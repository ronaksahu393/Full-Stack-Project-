/**
 * HotelPro Enterprise Idempotent Seeder & Relationship Repair Service
 * 
 * Guarantees:
 * 1. Fully idempotent: Re-running never creates duplicate hotels, rooms, or users.
 * 2. Partial repair: Detects missing rooms or unlinked properties and repairs only missing items.
 * 3. Stable identifiers: Keys on stable _id and unique slug/name pairs.
 * 4. Conflict detection: Detects duplicate slug conflicts across mismatched IDs without data corruption.
 * 5. Production safe: NEVER calls deleteMany() or drops collections. Preserves genuine user data.
 * 6. Clean ratings: Ensures unreviewed properties/rooms don't carry fabricated default star ratings.
 */

const mongoose = require("mongoose");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const User = require("../models/User");
const { indiaHotels, indiaRooms } = require("../seeds/indiaSeedData");
const { seedHotels, seedRooms, seedUsers } = require("../seeds/seedData");

/**
 * Normalizes an ID to string for safe comparison.
 */
function toIdString(id) {
  if (!id) return "";
  return typeof id === "object" && id._id ? String(id._id) : String(id);
}

/**
 * Executes an idempotent synchronization of seed data and repairs relationships.
 * 
 * @param {Object} options
 * @param {boolean} [options.dryRun=false] - If true, evaluates changes without writing to DB
 * @param {Function} [options.logger=console.log] - Optional logger function
 * @param {Array} [options.seedHotelsList] - Custom hotels list (defaults to all curated seed hotels)
 * @param {Array} [options.seedRoomsList] - Custom rooms list (defaults to all curated seed rooms)
 * @param {Array} [options.seedUsersList] - Custom users list (defaults to seed users)
 * @returns {Promise<Object>} Summary report of inserted, updated, skipped, and flagged items
 */
async function syncDatabase(options = {}) {
  const {
    dryRun = false,
    logger = () => {},
    seedHotelsList = [...indiaHotels, ...seedHotels],
    seedRoomsList = [...seedRooms, ...indiaRooms],
    seedUsersList = seedUsers,
    HotelModel = Hotel,
    RoomModel = Room,
    UserModel = User
  } = options;

  const report = {
    success: true,
    dryRun,
    hotels: {
      scanned: seedHotelsList.length,
      inserted: 0,
      skipped: 0,
      conflicts: []
    },
    rooms: {
      scanned: seedRoomsList.length,
      inserted: 0,
      repaired: 0,
      skipped: 0,
      orphaned: []
    },
    users: {
      scanned: seedUsersList.length,
      inserted: 0,
      skipped: 0
    },
    sanitized: {
      hotels: 0,
      rooms: 0
    }
  };

  logger(`✦ [Seeder] Starting sync (dryRun: ${dryRun})...`);

  // -------------------------------------------------------------
  // STEP 1: Sync Hotels
  // -------------------------------------------------------------
  for (const h of seedHotelsList) {
    const existingById = await HotelModel.findById(h._id);
    const existingBySlug = await HotelModel.findOne({ slug: h.slug.toLowerCase().trim() });

    if (existingById && existingBySlug) {
      if (toIdString(existingById._id) === toIdString(existingBySlug._id)) {
        // Exact match already present, preserve user data untouched
        report.hotels.skipped++;
      } else {
        // Slug collision across two different IDs
        report.hotels.conflicts.push({
          slug: h.slug,
          incomingId: String(h._id),
          existingId: String(existingBySlug._id),
          reason: "Slug already claimed by another document with different _id"
        });
        logger(`  ⚠ Hotel slug conflict for '${h.slug}': ID ${h._id} vs existing ${existingBySlug._id}`);
      }
    } else if (existingBySlug && !existingById) {
      // Slug exists under a different ID
      report.hotels.conflicts.push({
        slug: h.slug,
        incomingId: String(h._id),
        existingId: String(existingBySlug._id),
        reason: "Slug already exists in DB with a different ID"
      });
      logger(`  ⚠ Hotel slug conflict for '${h.slug}': incoming ID ${h._id} cannot replace ${existingBySlug._id}`);
    } else if (existingById && !existingBySlug) {
      // Document exists by ID with a different slug
      report.hotels.skipped++;
    } else {
      // New hotel to insert
      if (!dryRun) {
        await HotelModel.create(h);
      }
      report.hotels.inserted++;
      logger(`  + Inserted hotel: ${h.name} (${h.slug})`);
    }
  }

  // Build Hotel Lookup Maps (by ID, by slug, and by name lowercase)
  const allHotels = await HotelModel.find();
  const hotelById = new Map();
  const hotelBySlug = new Map();
  const hotelByName = new Map();

  allHotels.forEach((h) => {
    hotelById.set(String(h._id), h);
    hotelBySlug.set(h.slug.toLowerCase().trim(), h);
    hotelByName.set(h.name.toLowerCase().trim(), h);
  });

  // -------------------------------------------------------------
  // STEP 2: Sync Seed Rooms & Repair Missing References
  // -------------------------------------------------------------
  for (const r of seedRoomsList) {
    // Resolve parent hotel
    let resolvedHotel = null;

    if (r.hotel && hotelById.has(toIdString(r.hotel))) {
      resolvedHotel = hotelById.get(toIdString(r.hotel));
    } else if (r.hotelSlug && hotelBySlug.has(r.hotelSlug.toLowerCase().trim())) {
      resolvedHotel = hotelBySlug.get(r.hotelSlug.toLowerCase().trim());
    } else if (r.property && hotelByName.has(r.property.toLowerCase().trim())) {
      resolvedHotel = hotelByName.get(r.property.toLowerCase().trim());
    }

    if (!resolvedHotel) {
      report.rooms.orphaned.push({
        roomId: String(r._id),
        name: r.name,
        hotel: r.hotel,
        hotelSlug: r.hotelSlug,
        property: r.property,
        reason: "No matching parent hotel found in database"
      });
      logger(`  ⚠ Room orphaned: '${r.name}' (no hotel match for ${r.hotelSlug || r.hotel})`);
      continue;
    }

    // Check if room already exists by _id OR by (hotel, name)
    const existingById = await RoomModel.findById(r._id);
    const existingByNameAndHotel = await RoomModel.findOne({
      hotel: resolvedHotel._id,
      name: r.name
    });

    const targetRoom = existingById || existingByNameAndHotel;

    if (targetRoom) {
      // Check if room needs relationship repair (hotel reference missing or mismatch)
      const needsHotelFix = !targetRoom.hotel || toIdString(targetRoom.hotel) !== toIdString(resolvedHotel._id);
      const needsSlugFix = !targetRoom.hotelSlug || targetRoom.hotelSlug !== resolvedHotel.slug;

      if (needsHotelFix || needsSlugFix) {
        if (!dryRun) {
          targetRoom.hotel = resolvedHotel._id;
          targetRoom.hotelSlug = resolvedHotel.slug;
          await targetRoom.save();
        }
        report.rooms.repaired++;
        logger(`  ✓ Repaired relationship for room: ${targetRoom.name} -> Hotel ${resolvedHotel.name}`);
      } else {
        // Room already exists and is healthy, preserve user modifications
        report.rooms.skipped++;
      }
    } else {
      // Room is missing, insert it safely linked to parent hotel
      const newRoomData = {
        ...r,
        hotel: resolvedHotel._id,
        hotelSlug: resolvedHotel.slug
      };

      if (!dryRun) {
        await RoomModel.create(newRoomData);
      }
      report.rooms.inserted++;
      logger(`  + Inserted room: ${r.name} for hotel ${resolvedHotel.name}`);
    }
  }

  // -------------------------------------------------------------
  // STEP 3: Scan & Repair Any Unlinked Pre-existing Database Rooms
  // -------------------------------------------------------------
  const unlinkedDbRooms = await RoomModel.find({
    $or: [{ hotel: null }, { hotel: { $exists: false } }]
  });

  for (const unlinked of unlinkedDbRooms) {
    let match = null;
    if (unlinked.hotelSlug && hotelBySlug.has(unlinked.hotelSlug.toLowerCase().trim())) {
      match = hotelBySlug.get(unlinked.hotelSlug.toLowerCase().trim());
    } else if (unlinked.property && hotelByName.has(unlinked.property.toLowerCase().trim())) {
      match = hotelByName.get(unlinked.property.toLowerCase().trim());
    }

    if (match) {
      if (!dryRun) {
        unlinked.hotel = match._id;
        unlinked.hotelSlug = match.slug;
        await unlinked.save();
      }
      report.rooms.repaired++;
      logger(`  ✓ Repaired unlinked pre-existing DB room: ${unlinked.name} -> ${match.name}`);
    } else {
      report.rooms.orphaned.push({
        roomId: String(unlinked._id),
        name: unlinked.name,
        property: unlinked.property,
        reason: "Pre-existing DB room without matching parent hotel"
      });
    }
  }

  // -------------------------------------------------------------
  // STEP 4: Sync Seed Users Idempotently
  // -------------------------------------------------------------
  for (const u of seedUsersList) {
    const existingUser = await UserModel.findOne({
      $or: [{ _id: u._id }, { email: u.email.toLowerCase().trim() }]
    });

    if (existingUser) {
      report.users.skipped++;
    } else {
      if (!dryRun) {
        const userObj = new UserModel(u);
        await userObj.save(); // Invokes pre-save bcrypt hash hook
      }
      report.users.inserted++;
      logger(`  + Inserted seed user: ${u.email} (${u.role})`);
    }
  }

  // -------------------------------------------------------------
  // STEP 5: Clean Fabricated Default Ratings (Integrity Guard)
  // -------------------------------------------------------------
  if (!dryRun) {
    const resHotels = await HotelModel.updateMany(
      { reviewCount: 0, rating: { $ne: null } },
      { $set: { rating: null } }
    );
    report.sanitized.hotels = resHotels.modifiedCount || 0;

    const resRooms = await RoomModel.updateMany(
      { reviewCount: 0, rating: { $ne: null } },
      { $set: { rating: null } }
    );
    report.sanitized.rooms = resRooms.modifiedCount || 0;
  }

  logger(`✦ [Seeder] Synchronization complete.`);
  logger(`  Hotels: ${report.hotels.inserted} inserted, ${report.hotels.skipped} skipped, ${report.hotels.conflicts.length} conflicts`);
  logger(`  Rooms:  ${report.rooms.inserted} inserted, ${report.rooms.repaired} repaired, ${report.rooms.skipped} skipped, ${report.rooms.orphaned.length} orphaned`);
  logger(`  Users:  ${report.users.inserted} inserted, ${report.users.skipped} skipped`);

  return report;
}

module.exports = {
  syncDatabase,
  toIdString
};
