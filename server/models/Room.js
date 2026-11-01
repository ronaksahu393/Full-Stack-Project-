const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      default: null
    },
    hotelSlug: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      default: "Deluxe Suite"
    },
    property: { type: String, required: true, default: "HotelPro Sanctuary & Estate" },
    location: { type: String, required: true, default: "Jaipur, Rajasthan, India" },
    currency: { type: String, default: "INR" },
    pricePerNight: { type: Number, required: true, min: 0 },

    // Indian GST calculation metadata
    taxesAndFees: {
      gstPercent: { type: Number, default: 12 }, // 12% for <= 7500, 18% for > 7500
      estimatedTax: { type: Number, default: 0 }
    },

    capacity: {
      guests: { type: Number, required: true, default: 2, min: 1 },
      adults: { type: Number, default: 2, min: 1 },
      children: { type: Number, default: 0, min: 0 },
      bedrooms: { type: Number, default: 1, min: 1 },
      beds: { type: Number, default: 1, min: 1 },
      bedType: { type: String, default: "King Bed" },
      bathrooms: { type: Number, default: 1, min: 1 }
    },

    sizeSqM: { type: Number, default: 50, min: 10 },
    totalInventory: { type: Number, default: 5, min: 1 },
    availableInventory: { type: Number, default: 5, min: 0 },

    status: {
      type: String,
      enum: ["Available", "Booked", "Maintenance"],
      default: "Available"
    },
    cleaningStatus: {
      type: String,
      enum: ["Clean", "Dirty", "In Progress", "Inspecting"],
      default: "Clean"
    },
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: null, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    summary: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    heroImage: { type: String, required: true },
    gallery: [{ type: String }],
    amenities: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

roomSchema.index({ hotel: 1, pricePerNight: 1 });
roomSchema.index({ category: 1, pricePerNight: 1 });
roomSchema.index({ featured: 1 });
roomSchema.index({ status: 1 });

module.exports = mongoose.model("Room", roomSchema);
