const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      default: null
    },
    hotelName: {
      type: String,
      default: ""
    },
    city: {
      type: String,
      default: ""
    },
    state: {
      type: String,
      default: ""
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room reference is required"]
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"]
    },
    guestName: {
      type: String,
      required: [true, "Guest name is required"],
      trim: true
    },
    guestEmail: {
      type: String,
      required: [true, "Guest email is required"],
      lowercase: true,
      trim: true
    },
    guestPhone: {
      type: String,
      default: "",
      trim: true
    },
    roomName: {
      type: String,
      required: true
    },
    checkIn: {
      type: Date,
      required: [true, "Check-in date is required"]
    },
    checkOut: {
      type: Date,
      required: [true, "Check-out date is required"]
    },
    nights: {
      type: Number,
      required: true,
      min: [1, "Stay must be at least 1 night"]
    },
    currency: {
      type: String,
      default: "INR"
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0
    },
    basePrice: {
      type: Number,
      default: 0
    },
    taxRatePercent: {
      type: Number,
      default: 12
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    guests: {
      adults: { type: Number, required: true, default: 1, min: 1 },
      children: { type: Number, default: 0, min: 0 }
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    specialRequests: {
      type: String,
      default: "",
      trim: true
    },
    status: {
      type: String,
      enum: [
        "Pending Payment",
        "Confirmed",
        "Checked In",
        "Checked-In",
        "Checked Out",
        "Completed",
        "Cancellation Requested",
        "Cancelled"
      ],
      default: "Confirmed"
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refund Pending", "Refunded"],
      default: "Pending"
    },
    paymentMethod: {
      type: String,
      default: "UPI_Card_Demo"
    },
    paymentTransactionId: {
      type: String,
      default: ""
    },
    razorpayOrderId: {
      type: String,
      default: ""
    },
    isDemoPayment: {
      type: Boolean,
      default: false
    },
    paidAt: {
      type: Date
    },
    cancellationReason: {
      type: String,
      default: ""
    },
    cancelledAt: {
      type: Date
    },
    refundStatus: {
      type: String,
      enum: ["None", "Pending", "Processing", "Completed", "Failed", "Unavailable", "Not_Applicable"],
      default: "None"
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    refundTransactionId: {
      type: String,
      default: ""
    },
    refundReason: {
      type: String,
      default: ""
    },
    refundRequestedAt: {
      type: Date
    },
    refundProcessedAt: {
      type: Date
    },
    refundAuditLog: [
      {
        action: { type: String, required: true },
        status: { type: String, required: true },
        amount: { type: Number, default: 0 },
        message: { type: String, default: "" },
        transactionId: { type: String, default: "" },
        timestamp: { type: Date, default: Date.now },
        performedBy: { type: String, default: "system" }
      }
    ]
  },
  { timestamps: true }
);

bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ hotel: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
