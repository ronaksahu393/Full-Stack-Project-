const mongoose = require("mongoose");

const housekeepingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    roomName: { type: String, required: true },
    task: { type: String, required: true },
    assignedTo: { type: String, default: "Unassigned" },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending"
    },
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Urgent"],
      default: "Normal"
    },
    scheduledFor: { type: String, default: "Today" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Housekeeping", housekeepingSchema);
