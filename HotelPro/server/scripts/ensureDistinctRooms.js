const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hotelpro";

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB at", MONGODB_URI);

  const Hotel = mongoose.model("Hotel", new mongoose.Schema({}, { strict: false }));
  const Room = mongoose.model("Room", new mongoose.Schema({}, { strict: false }));

  // 1. Ensure all existing rooms have isActive: true
  const updateRes = await Room.updateMany({}, { $set: { isActive: true } });
  console.log("Updated rooms to active:", updateRes.modifiedCount);

  // 2. Fetch all hotels
  const hotels = await Hotel.find({});
  console.log(`Checking ${hotels.length} hotels in database...`);

  let createdRooms = 0;
  for (const h of hotels) {
    // Check if rooms already exist for this hotel
    const existing = await Room.find({
      $or: [{ hotel: h._id }, { hotelSlug: h.slug }]
    });

    if (existing.length === 0) {
      const city = h.address?.city || "India";
      const state = h.address?.state || "";
      const loc = `${city}${state ? ", " + state : ""}, India`;
      const basePrice = Number(h.startingPrice || h.effectiveStartingPrice) || 5500;
      const hero = h.heroImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";
      const secondImg = (h.images && h.images[1]) || (h.images && h.images[0]) || hero;

      await Room.create([
        {
          name: `${h.name} - Deluxe Heritage Suite`,
          category: "Deluxe Suite",
          property: h.name,
          location: loc,
          hotel: h._id,
          hotelSlug: h.slug,
          pricePerNight: basePrice,
          capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
          sizeSqM: 52,
          totalInventory: 5,
          availableInventory: 5,
          status: "Available",
          isActive: true,
          summary: `Signature luxury suite at ${h.name} with bespoke heritage interior and garden courtyard vistas.`,
          description: `Experience the authentic grandeur of ${h.name}. Handcrafted furnishings, Egyptian cotton linens, opulent ensuite bath with organic amenities, and 24/7 personalized concierge liaison.`,
          heroImage: hero,
          gallery: h.images && h.images.length > 0 ? h.images : [hero],
          amenities: ["High-speed Wi-Fi", "Complimentary Breakfast", "Climate Control", "Ensuite Marble Bath", "24/7 Room Service"]
        },
        {
          name: `${h.name} - Royal Palace Suite`,
          category: "Royal Suite",
          property: h.name,
          location: loc,
          hotel: h._id,
          hotelSlug: h.slug,
          pricePerNight: Math.round(basePrice * 1.45),
          capacity: { guests: 3, adults: 2, children: 1, bedrooms: 1, beds: 2, bedType: "Royal King Bed", bathrooms: 2 },
          sizeSqM: 78,
          totalInventory: 3,
          availableInventory: 3,
          status: "Available",
          isActive: true,
          summary: `Panoramic view suite at ${h.name} featuring an expansive private parlor, soaking tub, and dedicated butler service.`,
          description: `The regal jewel of ${h.name}. Designed for distinguished guests, this suite offers traditional archways, an expansive living salon, panoramic scenic vistas, and around-the-clock butler service.`,
          heroImage: secondImg,
          gallery: h.images && h.images.length > 0 ? h.images : [secondImg],
          amenities: ["Panoramic Scenic View", "Dedicated Butler", "Airport Transfer", "Deep Soaking Tub", "High Tea Service"]
        }
      ]);
      createdRooms += 2;
    } else {
      // Ensure property and location match hotel name
      for (const r of existing) {
        if (!r.property || r.property !== h.name) {
          await Room.updateOne({ _id: r._id }, { $set: { property: h.name, hotel: h._id, hotelSlug: h.slug } });
        }
      }
    }
  }

  const totalRooms = await Room.countDocuments({});
  console.log(`Successfully verified all hotels! Created: ${createdRooms} new rooms. Total rooms in DB: ${totalRooms}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
