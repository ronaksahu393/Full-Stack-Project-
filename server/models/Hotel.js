const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "" },
    comment: { type: String, required: true, trim: true },
    travelerType: {
      type: String,
      enum: ["Solo", "Couple", "Family", "Business", "Friends"],
      default: "Couple"
    },
    verifiedStay: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    summary: { type: String, required: true },
    propertyCategory: {
      type: String,
      required: true,
      enum: [
        "Heritage Palace",
        "Heritage Hotel",
        "Heritage Haveli",
        "Boutique Resort",
        "Luxury Hotel",
        "Wellness Retreat",
        "Haveli & Courtyard",
        "Hill Station Lodge",
        "Backwater Pavilion",
        "Beach Sanctuary",
        "Business Atelier",
        "Wildlife Lodge",
        "Wildlife Resort",
        "Desert Camp"
      ],
      default: "Boutique Resort"
    },

    // Location & Indian Address Architecture
    address: {
      addressLine: { type: String, required: true },
      locality: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, default: "" },
      state: { type: String, required: true },
      stateCode: { type: String, default: "" },
      postalCode: { type: String, required: true },
      country: { type: String, default: "India" }
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },

    // Imagery
    heroImage: { type: String, required: true },
    images: [{ type: String }],

    // Amenities & Facilities
    facilities: [{ type: String }],
    amenities: [{ type: String }],

    // Star Classification (Government/Official Classification - Only when verified)
    starClassification: {
      type: Number,
      min: 1,
      max: 5,
      default: null // null indicates unclassified / independent boutique
    },
    isStarVerified: { type: Boolean, default: false },

    // Guest Ratings (null indicates new property without reviews)
    rating: { type: Number, default: null, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    reviews: [reviewSchema],

    // Operational Policies
    policies: {
      checkInTime: { type: String, default: "14:00" },
      checkOutTime: { type: String, default: "11:00" },
      cancellationPolicy: {
        type: String,
        default: "Free cancellation up to 48 hours before check-in. Non-refundable thereafter."
      },
      petFriendly: { type: Boolean, default: false },
      childPolicy: { type: String, default: "Children below 6 years stay complimentary using existing bedding." },
      smokingPolicy: { type: String, default: "100% Non-smoking property throughout all indoor spaces." }
    },

    // Contact Information
    contact: {
      phone: { type: String, default: "+91 800 482 7769" },
      email: { type: String, default: "concierge@hotelpro.in" },
      website: { type: String, default: "" }
    },

    // Pricing & Inventory Indicator
    priceRange: {
      min: { type: Number, required: true, default: 3500 },
      max: { type: Number, required: true, default: 25000 }
    },
    startingPrice: { type: Number, required: true, default: 3500 },
    currency: { type: String, default: "INR" },

    // Platform State
    status: {
      type: String,
      enum: ["published", "draft", "inactive"],
      default: "published"
    },
    featured: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: true }, // Clearly distinguishes demo seed records from live API inventory
    source: { type: String, default: "HotelPro_Curated_Demo" }
  },
  { timestamps: true }
);

// Search Indexes
hotelSchema.index({ "address.city": 1, "address.state": 1 });
hotelSchema.index({ name: "text", "address.city": "text", "address.state": "text", summary: "text" });
hotelSchema.index({ propertyCategory: 1, startingPrice: 1 });
hotelSchema.index({ rating: -1, reviewCount: -1 });
hotelSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Hotel", hotelSchema);
