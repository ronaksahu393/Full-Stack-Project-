const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const { syncDatabase } = require("../services/seederService");

const seedDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hotelpro";
    console.log("Connecting to MongoDB for idempotent seeding...");
    await mongoose.connect(uri);

    const isResetRequested = process.env.RESET_DATABASE === "true";
    const isProduction = (process.env.NODE_ENV || "").toLowerCase() === "production";

    if (isResetRequested) {
      if (isProduction) {
        console.error("FATAL: RESET_DATABASE is strictly forbidden in production mode. Aborting.");
        process.exit(1);
      }
      console.warn("⚠ RESET_DATABASE=true detected in development. Resetting collections...");
      const User = require("../models/User");
      const Room = require("../models/Room");
      const Hotel = require("../models/Hotel");
      const Booking = require("../models/Booking");
      const Housekeeping = require("../models/Housekeeping");
      await User.deleteMany({});
      await Room.deleteMany({});
      await Hotel.deleteMany({});
      await Booking.deleteMany({});
      await Housekeeping.deleteMany({});
      console.log("Collections cleared for clean development reset.");
    }

    console.log("Running idempotent data synchronization and relationship repair...");
    const report = await syncDatabase({
      dryRun: false,
      logger: (msg) => console.log(msg)
    });

    console.log("\n✦ Seeder Summary Report:");
    console.log(`Hotels: ${report.hotels.inserted} inserted, ${report.hotels.skipped} skipped, ${report.hotels.conflicts.length} conflicts`);
    console.log(`Rooms:  ${report.rooms.inserted} inserted, ${report.rooms.repaired} repaired, ${report.rooms.skipped} skipped, ${report.rooms.orphaned.length} orphaned`);
    console.log(`Users:  ${report.users.inserted} inserted, ${report.users.skipped} skipped`);
    console.log("✦ HotelPro data synchronization complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
