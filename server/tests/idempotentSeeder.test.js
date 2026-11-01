/**
 * HotelPro Idempotent Seeder & Relationship Repair Test Suite
 *
 * Verifies:
 * 1. Initial complete seeding: Inserts hotels, rooms, and users properly linked.
 * 2. Strict idempotency: Duplicate consecutive runs insert 0 new records.
 * 3. Partial database repair: Detects and inserts only missing rooms for seeded hotels.
 * 4. Relationship repair: Re-links unlinked or null hotel references on rooms.
 * 5. Duplicate slug conflict detection: Flags slug collisions without throwing or corrupting data.
 * 6. Orphaned room detection: Flags rooms pointing to nonexistent hotels in report.
 * 7. Genuine user data preservation: Never drops or overwrites user-created hotels or rooms.
 * 8. Rating sanitization: Ensures properties with 0 reviews have rating: null.
 */

const assert = require("assert");
const { syncDatabase, toIdString } = require("../services/seederService");
const { indiaHotels, indiaRooms } = require("../seeds/indiaSeedData");
const { seedHotels, seedRooms, seedUsers } = require("../seeds/seedData");

/**
 * Creates an in-memory mock Mongoose model representing a MongoDB collection.
 */
function createMockModel(name, initialData = []) {
  const collection = new Map();

  function clone(doc) {
    return JSON.parse(JSON.stringify(doc));
  }

  function wrapDocument(doc) {
    if (!doc) return null;
    const instance = clone(doc);
    instance.save = async function () {
      collection.set(String(instance._id), clone(instance));
      return instance;
    };
    return instance;
  }

  // Populate initial data
  initialData.forEach((item) => {
    const doc = clone(item);
    if (!doc._id) doc._id = "mock_" + Math.random().toString(36).substring(2, 9);
    collection.set(String(doc._id), doc);
  });

  return {
    name,
    _getStore: () => collection,
    findById: async (id) => {
      const doc = collection.get(String(id));
      return wrapDocument(doc);
    },
    findOne: async (query) => {
      for (const doc of collection.values()) {
        let match = true;
        if (query.$or) {
          const anyMatch = query.$or.some((subQuery) => {
            return Object.entries(subQuery).every(([k, v]) => String(doc[k]) === String(v));
          });
          if (!anyMatch) match = false;
        } else {
          for (const [k, v] of Object.entries(query)) {
            if (String(doc[k]) !== String(v)) {
              match = false;
              break;
            }
          }
        }
        if (match) return wrapDocument(doc);
      }
      return null;
    },
    find: async (query = {}) => {
      const results = [];
      for (const doc of collection.values()) {
        let match = true;
        if (query.$or) {
          const anyMatch = query.$or.some((sub) => {
            if (sub.hotel === null) return doc.hotel === null || doc.hotel === undefined;
            if (sub.hotel && sub.hotel.$exists === false) return !doc.hotel;
            return false;
          });
          if (!anyMatch) match = false;
        }
        if (match) results.push(wrapDocument(doc));
      }
      return results;
    },
    create: async (data) => {
      const doc = clone(data);
      if (!doc._id) doc._id = "mock_" + Math.random().toString(36).substring(2, 9);
      collection.set(String(doc._id), doc);
      return wrapDocument(doc);
    },
    updateMany: async (filter, update) => {
      let modifiedCount = 0;
      for (const doc of collection.values()) {
        if (filter.reviewCount === 0 && doc.reviewCount === 0) {
          if (filter.rating && filter.rating.$ne === null && doc.rating !== null) {
            doc.rating = update.$set.rating;
            modifiedCount++;
          }
        }
      }
      return { modifiedCount };
    },
    countDocuments: async () => collection.size
  };
}

function createMockUserModel(initialData = []) {
  const model = createMockModel("User", initialData);
  function UserConstructor(data) {
    const instance = { ...data };
    instance.save = async function () {
      model._getStore().set(String(instance._id), instance);
      return instance;
    };
    return instance;
  }
  UserConstructor.findById = model.findById;
  UserConstructor.findOne = model.findOne;
  UserConstructor.find = model.find;
  UserConstructor.create = model.create;
  UserConstructor.updateMany = model.updateMany;
  UserConstructor.countDocuments = model.countDocuments;
  UserConstructor._getStore = model._getStore;
  return UserConstructor;
}

async function runTests() {
  console.log("\n=================================================");
  console.log("  HOTELPRO IDEMPOTENT SEEDER & REPAIR TEST SUITE ");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
    }
  }

  const allSeedHotels = [...indiaHotels, ...seedHotels];
  const allSeedRooms = [...seedRooms, ...indiaRooms];

  // -------------------------------------------------------------
  // 1. Initial Seeding into Clean Database
  // -------------------------------------------------------------
  await test("Initial seeding populates all hotels, rooms, and users with valid relationships", async () => {
    const MockHotel = createMockModel("Hotel");
    const MockRoom = createMockModel("Room");
    const MockUser = createMockUserModel();

    const report = await syncDatabase({
      HotelModel: MockHotel,
      RoomModel: MockRoom,
      UserModel: MockUser
    });

    assert.strictEqual(report.success, true);
    assert.strictEqual(report.hotels.inserted, allSeedHotels.length, "All hotels should be inserted");
    assert.strictEqual(report.rooms.inserted, allSeedRooms.length, "All rooms should be inserted");
    assert.strictEqual(report.users.inserted, seedUsers.length, "All seed users should be inserted");
    assert.strictEqual(report.rooms.orphaned.length, 0, "No rooms should be orphaned");
    assert.strictEqual(report.hotels.conflicts.length, 0, "No hotel conflicts on initial seed");

    // Verify every room in DB has a valid parent hotel
    const dbRooms = await MockRoom.find();
    assert.strictEqual(dbRooms.length, allSeedRooms.length);
    for (const room of dbRooms) {
      assert.ok(room.hotel, `Room ${room.name} must have a hotel reference`);
      assert.ok(room.hotelSlug, `Room ${room.name} must have a hotelSlug`);
      const parent = await MockHotel.findById(room.hotel);
      assert.ok(parent, `Room ${room.name} must point to an existing hotel`);
      assert.strictEqual(parent.slug, room.hotelSlug);
    }
  });

  // -------------------------------------------------------------
  // 2. Strict Idempotency on Consecutive Runs
  // -------------------------------------------------------------
  await test("Running seeder a second time creates ZERO duplicate records and skips existing", async () => {
    const MockHotel = createMockModel("Hotel");
    const MockRoom = createMockModel("Room");
    const MockUser = createMockUserModel();

    // Run 1: Initial seed
    await syncDatabase({
      HotelModel: MockHotel,
      RoomModel: MockRoom,
      UserModel: MockUser
    });

    const hotelCountAfterRun1 = await MockHotel.countDocuments();
    const roomCountAfterRun1 = await MockRoom.countDocuments();
    const userCountAfterRun1 = await MockUser.countDocuments();

    // Run 2: Immediate duplicate run
    const report2 = await syncDatabase({
      HotelModel: MockHotel,
      RoomModel: MockRoom,
      UserModel: MockUser
    });

    assert.strictEqual(report2.hotels.inserted, 0, "Second run must insert 0 hotels");
    assert.strictEqual(report2.hotels.skipped, allSeedHotels.length, "All hotels should be skipped");
    assert.strictEqual(report2.rooms.inserted, 0, "Second run must insert 0 rooms");
    assert.strictEqual(report2.rooms.skipped, allSeedRooms.length, "All rooms should be skipped");
    assert.strictEqual(report2.rooms.repaired, 0, "Healthy rooms require 0 repairs");
    assert.strictEqual(report2.users.inserted, 0, "Second run must insert 0 users");
    assert.strictEqual(report2.users.skipped, seedUsers.length, "All users should be skipped");

    // Total counts in DB remain exactly identical
    assert.strictEqual(await MockHotel.countDocuments(), hotelCountAfterRun1);
    assert.strictEqual(await MockRoom.countDocuments(), roomCountAfterRun1);
    assert.strictEqual(await MockUser.countDocuments(), userCountAfterRun1);
  });

  // -------------------------------------------------------------
  // 3. Partial Database State: Repairing Missing Room for Seeded Hotel
  // -------------------------------------------------------------
  await test("Detects and inserts ONLY missing rooms when a hotel is missing rooms", async () => {
    const MockHotel = createMockModel("Hotel");
    const MockRoom = createMockModel("Room");
    const MockUser = createMockUserModel();

    // First, populate hotels and users, but omit the very last room
    await syncDatabase({
      HotelModel: MockHotel,
      RoomModel: MockRoom,
      UserModel: MockUser,
      seedRoomsList: allSeedRooms.slice(0, -1) // 1 room missing
    });

    const roomCountBefore = await MockRoom.countDocuments();
    assert.strictEqual(roomCountBefore, allSeedRooms.length - 1);

    // Run full sync: should detect only the 1 missing room
    const reportRepair = await syncDatabase({
      HotelModel: MockHotel,
      RoomModel: MockRoom,
      UserModel: MockUser,
      seedRoomsList: allSeedRooms
    });

    assert.strictEqual(reportRepair.hotels.inserted, 0, "No new hotels should be inserted");
    assert.strictEqual(reportRepair.rooms.inserted, 1, "Exactly 1 missing room should be repaired/inserted");
    assert.strictEqual(reportRepair.rooms.skipped, allSeedRooms.length - 1);
    assert.strictEqual(await MockRoom.countDocuments(), allSeedRooms.length);
  });

  // -------------------------------------------------------------
  // 4. Relationship Repair: Linking Unlinked Room to Parent Hotel
  // -------------------------------------------------------------
  await test("Repairs rooms with null hotel reference using hotelSlug matching", async () => {
    const testHotel = {
      _id: "660000000000000000000101",
      name: "Rajputana Heritage Haveli & Spa",
      slug: "rajputana-heritage-haveli-jaipur",
      startingPrice: 6500
    };

    // Broken room in DB: hotel is null, but hotelSlug is present
    const brokenRoom = {
      _id: "660000000000000000000201",
      hotel: null, // Unlinked
      hotelSlug: "rajputana-heritage-haveli-jaipur",
      name: "Jharokha Courtyard Room",
      pricePerNight: 6500
    };

    const MockHotel = createMockModel("Hotel", [testHotel]);
    const MockRoom = createMockModel("Room", [brokenRoom]);
    const MockUser = createMockUserModel();

    const report = await syncDatabase({
      HotelModel: MockHotel,
      RoomModel: MockRoom,
      UserModel: MockUser,
      seedHotelsList: [testHotel],
      seedRoomsList: [brokenRoom],
      seedUsersList: []
    });

    assert.strictEqual(report.rooms.repaired, 1, "Should repair exactly 1 unlinked room");
    assert.strictEqual(report.rooms.inserted, 0, "Should not insert duplicate room");

    const repairedRoom = await MockRoom.findById("660000000000000000000201");
    assert.strictEqual(String(repairedRoom.hotel), testHotel._id, "Room must now link to parent hotel ID");
  });

  // -------------------------------------------------------------
  // 5. Unique Key Conflict Detection (Slug Collisions)
  // -------------------------------------------------------------
  await test("Detects and flags duplicate hotel slug collisions across different IDs safely", async () => {
    const existingDbHotel = {
      _id: "669999999999999999999999", // Different ID
      name: "Existing Custom Haveli",
      slug: "rajputana-heritage-haveli-jaipur", // Same slug!
      startingPrice: 5000
    };

    const incomingSeedHotel = {
      _id: "660000000000000000000101", // Seed ID
      name: "Rajputana Heritage Haveli & Spa",
      slug: "rajputana-heritage-haveli-jaipur"
    };

    const MockHotel = createMockModel("Hotel", [existingDbHotel]);
    const MockRoom = createMockModel("Room");
    const MockUser = createMockUserModel();

    const report = await syncDatabase({
      HotelModel: MockHotel,
      RoomModel: MockRoom,
      UserModel: MockUser,
      seedHotelsList: [incomingSeedHotel],
      seedRoomsList: [],
      seedUsersList: []
    });

    assert.strictEqual(report.hotels.conflicts.length, 1, "Must flag slug collision");
    assert.strictEqual(report.hotels.conflicts[0].slug, "rajputana-heritage-haveli-jaipur");
    assert.strictEqual(report.hotels.inserted, 0, "Must not insert conflicting document");
    // Existing DB document remains intact
    const preserved = await MockHotel.findById("669999999999999999999999");
    assert.strictEqual(preserved.name, "Existing Custom Haveli");
  });

  // -------------------------------------------------------------
  // 6. Orphaned Room Detection
  // -------------------------------------------------------------
  await test("Flags orphaned rooms that reference non-existent parent hotels", async () => {
    const orphanRoom = {
      _id: "room_orphan_999",
      hotel: "non_existent_hotel_id",
      hotelSlug: "unknown-hotel-slug",
      name: "Phantom Mystery Suite"
    };

    const MockHotel = createMockModel("Hotel");
    const MockRoom = createMockModel("Room");
    const MockUser = createMockUserModel();

    const report = await syncDatabase({
      HotelModel: MockHotel,
      RoomModel: MockRoom,
      UserModel: MockUser,
      seedHotelsList: [],
      seedRoomsList: [orphanRoom],
      seedUsersList: []
    });

    assert.strictEqual(report.rooms.orphaned.length, 1, "Orphaned room must be captured in report");
    assert.strictEqual(report.rooms.orphaned[0].roomId, "room_orphan_999");
    assert.strictEqual(report.rooms.inserted, 0);
  });

  // -------------------------------------------------------------
  // 7. Preservation of Genuine User Data
  // -------------------------------------------------------------
  await test("Preserves user-created hotels and custom room modifications without overwriting", async () => {
    const userCustomHotel = {
      _id: "user_created_hotel_001",
      name: "My Custom Heritage Boutique",
      slug: "my-custom-heritage-boutique",
      startingPrice: 9999,
      isDemo: false
    };

    // Modified seed room with user-adjusted price
    const userModifiedSeedRoom = {
      _id: "664fa2a3b8109a1b1c000010",
      hotel: "664fa100b8109a1b1c000001",
      hotelSlug: "hotelpro-estate-botanical-sanctuary",
      name: "The Pavilion Garden Suite",
      pricePerNight: 999 // User customized price from 420 to 999
    };

    const MockHotel = createMockModel("Hotel", [userCustomHotel]);
    const MockRoom = createMockModel("Room", [userModifiedSeedRoom]);
    const MockUser = createMockUserModel();

    await syncDatabase({
      HotelModel: MockHotel,
      RoomModel: MockRoom,
      UserModel: MockUser
    });

    // Verify user-created hotel was untouched
    const customHotelInDb = await MockHotel.findById("user_created_hotel_001");
    assert.ok(customHotelInDb, "User-created hotel must not be deleted");
    assert.strictEqual(customHotelInDb.name, "My Custom Heritage Boutique");

    // Verify user-modified room price was preserved
    const roomInDb = await MockRoom.findById("664fa2a3b8109a1b1c000010");
    assert.strictEqual(roomInDb.pricePerNight, 999, "User modified room price must not be overwritten");
  });

  // -------------------------------------------------------------
  // 8. Fabricated Default Rating Sanitization
  // -------------------------------------------------------------
  await test("Sanitizes unreviewed properties with reviewCount: 0 and non-null ratings", async () => {
    const unreviewedHotel = {
      _id: "unreviewed_hotel_1",
      name: "New Unreviewed Hotel",
      slug: "new-unreviewed-hotel",
      reviewCount: 0,
      rating: 5.0 // Fabricated rating that should be null
    };

    const MockHotel = createMockModel("Hotel", [unreviewedHotel]);
    const MockRoom = createMockModel("Room");
    const MockUser = createMockUserModel();

    const report = await syncDatabase({
      HotelModel: MockHotel,
      RoomModel: MockRoom,
      UserModel: MockUser,
      seedHotelsList: [],
      seedRoomsList: [],
      seedUsersList: []
    });

    assert.strictEqual(report.sanitized.hotels, 1, "Must sanitize 1 unreviewed hotel");
    const sanitizedDoc = await MockHotel.findById("unreviewed_hotel_1");
    assert.strictEqual(sanitizedDoc.rating, null, "Rating must be sanitized to null");
  });

  console.log("\n=================================================");
  console.log(`  TEST RESULTS: ${passed}/${total} PASSED`);
  console.log("=================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
