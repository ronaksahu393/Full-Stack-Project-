const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Housekeeping = require("../models/Housekeeping");

const VALID_CLEANING_STATUSES = ["Clean", "Dirty", "In Progress", "Inspecting"];
const VALID_TASK_STATUSES = ["Pending", "In Progress", "Completed"];
const VALID_TASK_PRIORITIES = ["Low", "Normal", "High", "Urgent"];

// @desc    Get staff operations overview (Today's arrivals, departures, room cleaning statuses)
// @route   GET /api/staff/overview
exports.getStaffOverview = async (req, res, next) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const store = req.app.locals.inMemoryStore;
    if (store) {
      const activeBookings = store.bookings.filter((b) => b.status !== "Cancelled");
      const rooms = store.rooms;
      const tasks = store.housekeeping || [];

      const arrivalsToday = activeBookings.filter((b) => {
        const d = new Date(b.checkIn);
        return d >= todayStart && d <= todayEnd;
      });

      const departuresToday = activeBookings.filter((b) => {
        const d = new Date(b.checkOut);
        return d >= todayStart && d <= todayEnd;
      });

      return res.json({
        arrivalsToday: arrivalsToday.slice(0, 10),
        departuresToday: departuresToday.slice(0, 10),
        roomsCleaning: rooms.map((r) => ({
          _id: r._id,
          name: r.name,
          category: r.category,
          status: r.status,
          cleaningStatus: r.cleaningStatus || "Clean"
        })),
        housekeepingTasks: tasks
      });
    }

    // Mongoose path
    const arrivalsToday = await Booking.find({
      status: { $ne: "Cancelled" },
      checkIn: { $gte: todayStart, $lte: todayEnd }
    }).limit(10);

    const departuresToday = await Booking.find({
      status: { $ne: "Cancelled" },
      checkOut: { $gte: todayStart, $lte: todayEnd }
    }).limit(10);

    const rooms = await Room.find().select("name category status cleaningStatus");
    const tasks = await Housekeeping.find().sort({ createdAt: -1 });

    res.json({
      arrivalsToday,
      departuresToday,
      roomsCleaning: rooms,
      housekeepingTasks: tasks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update room cleaning status
// @route   PUT /api/staff/rooms/:id/cleaning
exports.updateRoomCleaningStatus = async (req, res, next) => {
  try {
    const { cleaningStatus } = req.body;
    if (!cleaningStatus || !VALID_CLEANING_STATUSES.includes(cleaningStatus)) {
      return res.status(400).json({
        message: `Invalid cleaning status specified. Permitted: [${VALID_CLEANING_STATUSES.join(", ")}]`
      });
    }

    const store = req.app.locals.inMemoryStore;

    if (store) {
      const room = store.rooms.find((r) => r._id.toString() === req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Suite not found." });
      }
      room.cleaningStatus = cleaningStatus;
      return res.json({ room, message: `Room cleaning status marked as ${cleaningStatus}.` });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Suite not found." });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { cleaningStatus },
      { new: true }
    );
    if (!room) {
      return res.status(404).json({ message: "Suite not found." });
    }
    res.json({ room, message: `Room cleaning status marked as ${cleaningStatus}.` });
  } catch (err) {
    next(err);
  }
};

// @desc    Update or create housekeeping task
// @route   PUT /api/staff/housekeeping/:id
exports.updateHousekeepingTask = async (req, res, next) => {
  try {
    const { status, assignedTo, priority } = req.body;

    if (status && !VALID_TASK_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid task status. Permitted: [${VALID_TASK_STATUSES.join(", ")}]`
      });
    }

    if (priority && !VALID_TASK_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        message: `Invalid priority level. Permitted: [${VALID_TASK_PRIORITIES.join(", ")}]`
      });
    }

    const store = req.app.locals.inMemoryStore;

    if (store) {
      const task = store.housekeeping.find((t) => t._id.toString() === req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found." });
      }
      if (status) task.status = status;
      if (assignedTo) task.assignedTo = assignedTo;
      if (priority) task.priority = priority;
      return res.json({ task, message: "Housekeeping task updated." });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Task not found." });
    }

    const task = await Housekeeping.findByIdAndUpdate(
      req.params.id,
      { status, assignedTo, priority },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }
    res.json({ task, message: "Housekeeping task updated." });
  } catch (err) {
    next(err);
  }
};

// @desc    Get operational tasks assigned to staff or department
// @route   GET /api/staff/tasks
exports.getStaffTasks = async (req, res, next) => {
  try {
    const Task = require("../models/Task");
    const store = req.app.locals.inMemoryStore;

    if (store) {
      const allTasks = store.tasks || [];
      // Filter for tasks assigned to this user or matching department, or show all if none
      const myTasks = allTasks.filter(
        (t) => !t.assignedTo || t.assignedTo.toString() === req.user._id.toString() || t.department === req.user.department
      );
      return res.json({ count: myTasks.length, tasks: myTasks.length > 0 ? myTasks : allTasks });
    }

    const tasks = await Task.find({
      $or: [
        { assignedTo: req.user._id },
        { department: req.user.department || "Front Desk" },
        { assignedTo: null }
      ]
    }).sort({ priority: -1, createdAt: -1 });

    res.json({ count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task progress status (Pending | In Progress | Completed)
// @route   PUT /api/staff/tasks/:id/status
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Permitted: Pending, In Progress, Completed" });
    }

    const Task = require("../models/Task");
    const store = req.app.locals.inMemoryStore;

    if (store) {
      const task = (store.tasks || []).find((t) => t._id.toString() === req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found." });
      task.status = status;
      if (status === "Completed") task.completedAt = new Date().toISOString();
      if (note) {
        if (!task.notes) task.notes = [];
        task.notes.push({ text: note, author: req.user.name, createdAt: new Date().toISOString() });
      }
      return res.json({ task, message: `Task marked as ${status}.` });
    }

    const updateData = { status };
    if (status === "Completed") updateData.completedAt = new Date();

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    task.status = status;
    if (status === "Completed") task.completedAt = new Date();
    if (note) {
      task.notes.push({ text: note, author: req.user.name, createdAt: new Date() });
    }
    await task.save();

    res.json({ task, message: `Task marked as ${status}.` });
  } catch (err) {
    next(err);
  }
};

// @desc    Record guest check-in
// @route   PUT /api/staff/bookings/:id/check-in
exports.recordCheckIn = async (req, res, next) => {
  try {
    const store = req.app.locals.inMemoryStore;
    if (store) {
      const booking = store.bookings.find((b) => b._id.toString() === req.params.id);
      if (!booking) return res.status(404).json({ message: "Reservation not found." });
      booking.status = "Checked-In";
      return res.json({ booking, message: "Guest check-in recorded successfully." });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "Checked-In" },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: "Reservation not found." });

    res.json({ booking, message: "Guest check-in recorded successfully." });
  } catch (err) {
    next(err);
  }
};

// @desc    Record guest check-out
// @route   PUT /api/staff/bookings/:id/check-out
exports.recordCheckOut = async (req, res, next) => {
  try {
    const store = req.app.locals.inMemoryStore;
    if (store) {
      const booking = store.bookings.find((b) => b._id.toString() === req.params.id);
      if (!booking) return res.status(404).json({ message: "Reservation not found." });
      booking.status = "Completed";
      return res.json({ booking, message: "Guest check-out completed." });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "Completed" },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: "Reservation not found." });

    res.json({ booking, message: "Guest check-out completed." });
  } catch (err) {
    next(err);
  }
};

