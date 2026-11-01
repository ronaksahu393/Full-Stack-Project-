const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    department: {
      type: String,
      enum: ["Front Desk", "Housekeeping", "Maintenance", "Concierge", "Dining & Butler", "General Management"],
      default: "General Management"
    },
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Urgent"],
      default: "Normal"
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending"
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    assignedToName: { type: String, default: "Unassigned" },
    property: { type: String, default: "All Sanctuaries" },
    roomName: { type: String, default: "" },
    deadline: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    notes: [
      {
        text: { type: String, required: true },
        author: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
