const mongoose = require("mongoose");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const User = require("../models/User");

/**
 * Generates an array of ISO calendar date strings (YYYY-MM-DD) for a given date range.
 * Uses UTC to ensure timezone independence across boundary dates.
 */
function getDatesInRange(startDateStr, endDateStr) {
  const dates = [];
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return [startDateStr];
    }
    const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

    let count = 0;
    while (cur <= last && count < 366) {
      dates.push(cur.toISOString().split("T")[0]);
      cur.setUTCDate(cur.getUTCDate() + 1);
      count++;
    }
  } catch {
    return [startDateStr];
  }
  return dates.length > 0 ? dates : [startDateStr];
}

function safeFormatDate(val) {
  if (!val) return null;
  try {
    if (typeof val === "string") {
      const match = val.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

/**
 * Computes executive portfolio metrics:
 * 1. Occupancy Rate = (Occupied Room-Nights / Available Room-Nights) * 100
 *    - De-duplicates room nights to prevent overlapping records from inflating occupancy.
 *    - Strictly excludes cancelled and unconfirmed reservations.
 *    - Excludes rooms in 'Maintenance' from available inventory.
 * 2. Realized Revenue = Gross Verified Paid Revenue - Confirmed/Pending Refunds
 *    - Strictly excludes unpaid, failed, or pending payments.
 *    - Accounts for partial refunds and retention fees accurately.
 */
function calculateAdminAnalytics({ rooms = [], bookings = [], users = [], query = {} }) {
  const now = new Date();

  // 1. Determine reporting period
  let startDate = query.startDate;
  let endDate = query.endDate;

  if (query.period === "today") {
    startDate = now.toISOString().split("T")[0];
    endDate = startDate;
  } else if (!startDate || !endDate) {
    // Default to the current calendar month
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
    startDate = startOfMonth.toISOString().split("T")[0];
    endDate = endOfMonth.toISOString().split("T")[0];
  }

  // Ensure start <= end
  if (startDate > endDate) {
    const temp = startDate;
    startDate = endDate;
    endDate = temp;
  }

  const calendarDates = getDatesInRange(startDate, endDate);
  const totalPeriodDays = Math.max(1, calendarDates.length);
  const periodDateSet = new Set(calendarDates);

  // 2. Available Room-Nights
  const operationalRooms = rooms.filter((r) => r.status !== "Maintenance");
  const availableRoomNights = operationalRooms.length * totalPeriodDays;

  // 3. Occupied Room-Nights Calculation
  const VALID_OCCUPANCY_STATUSES = new Set([
    "Confirmed",
    "Checked In",
    "Checked-In",
    "Checked Out",
    "Completed"
  ]);

  const occupiedSet = new Set();

  for (const booking of bookings) {
    // Exclude cancelled, pending payment, or invalid bookings
    if (!VALID_OCCUPANCY_STATUSES.has(booking.status)) {
      continue;
    }

    const roomId = (booking.room?._id || booking.room || "").toString();
    if (!roomId) continue;

    const inStr = safeFormatDate(booking.checkIn);
    const outStr = safeFormatDate(booking.checkOut);
    if (!inStr || !outStr) continue;

    const stayDates = getDatesInRange(inStr, outStr);
    // In hospitality accounting, checkout date is day of departure (not an occupied night)
    const nightDates = stayDates.length > 1 ? stayDates.slice(0, -1) : stayDates;

    for (const night of nightDates) {
      if (periodDateSet.has(night)) {
        // Distinct (roomId, night) pair prevents overlapping bookings from inflating occupancy
        occupiedSet.add(`${roomId}_${night}`);
      }
    }
  }

  const occupiedRoomNights = occupiedSet.size;
  const occupancyRate = availableRoomNights > 0
    ? Math.min(100, Math.round((occupiedRoomNights / availableRoomNights) * 100))
    : 0;

  // 4. Realized Revenue Calculation
  let grossRevenue = 0;
  let totalRefunds = 0;

  for (const b of bookings) {
    const price = Number(b.totalPrice) || 0;
    const refundAmt = Number(b.refundAmount) || 0;

    if (b.paymentStatus === "Paid") {
      grossRevenue += price;
      if (b.refundStatus === "Completed") {
        totalRefunds += refundAmt || price;
      } else if (b.refundStatus === "Pending") {
        totalRefunds += refundAmt;
      }
    } else if (b.paymentStatus === "Refund Pending" || b.paymentStatus === "Refunded") {
      grossRevenue += price;
      totalRefunds += refundAmt || price;
    }
    // Failed, Pending, or unverified payments contribute ₹0 to revenue
  }

  const totalRevenue = Math.max(0, grossRevenue - totalRefunds);

  // 5. Daily Operations Telemetry (Arrivals, Departures, Active Stays)
  const todayStr = now.toISOString().split("T")[0];

  const arrivalsToday = bookings.filter((b) => {
    if (b.status === "Cancelled") return false;
    const inStr = safeFormatDate(b.checkIn);
    return inStr === todayStr;
  }).length;

  const departuresToday = bookings.filter((b) => {
    if (b.status === "Cancelled") return false;
    const outStr = safeFormatDate(b.checkOut);
    return outStr === todayStr;
  }).length;

  const activeBookingsCount = bookings.filter((b) => {
    if (b.status === "Cancelled") return false;
    const inStr = safeFormatDate(b.checkIn);
    const outStr = safeFormatDate(b.checkOut);
    if (!inStr || !outStr) return false;
    return inStr <= todayStr && outStr > todayStr;
  }).length;

  const guestsCount = users.filter((u) => u.role === "guest").length;
  const staffCount = users.filter((u) => u.role === "staff" || u.role === "admin").length;

  return {
    metrics: {
      totalRevenue,
      grossRevenue,
      totalRefunds,
      occupancyRate,
      occupiedRoomNights,
      availableRoomNights,
      totalBookings: bookings.length,
      totalRooms: rooms.length,
      activeBookingsCount,
      arrivalsToday,
      departuresToday,
      guestsCount,
      staffCount,
      reportingPeriod: {
        startDate,
        endDate,
        totalDays: totalPeriodDays
      }
    },
    recentBookings: bookings.slice(0, 6)
  };
}

// @desc    Get executive metrics & analytics
// @route   GET /api/admin/metrics
exports.getAdminMetrics = async (req, res, next) => {
  try {
    const store = req.app.locals.inMemoryStore;
    if (store) {
      const analytics = calculateAdminAnalytics({
        rooms: store.rooms,
        bookings: store.bookings,
        users: store.users,
        query: req.query
      });
      return res.json(analytics);
    }

    // Mongoose path
    const [rooms, bookings, users] = await Promise.all([
      Room.find().lean(),
      Booking.find().sort({ createdAt: -1 }).lean(),
      User.find().lean()
    ]);

    const analytics = calculateAdminAnalytics({
      rooms,
      bookings,
      users,
      query: req.query
    });

    res.json(analytics);
  } catch (err) {
    next(err);
  }
};

exports.calculateAdminAnalytics = calculateAdminAnalytics;
exports.getDatesInRange = getDatesInRange;

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const store = req.app.locals.inMemoryStore;
    if (store) {
      const users = store.users.map((u) => {
        const copy = { ...u };
        delete copy.password;
        return copy;
      });
      return res.json({ count: users.length, users });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["guest", "staff", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    // Prevent administrators from inadvertently revoking their own admin access
    if (req.user && req.user._id && req.user._id.toString() === req.params.id && role !== "admin") {
      return res.status(400).json({ message: "Administrators cannot revoke their own administrative privileges." });
    }

    const store = req.app.locals.inMemoryStore;
    if (store) {
      const user = store.users.find((u) => u._id.toString() === req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      user.role = role;
      const copy = { ...user };
      delete copy.password;
      return res.json({ user: copy, message: `User role updated to ${role}.` });
    }

    if (!store && !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ user, message: `User role updated to ${role}.` });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all hotels with admin controls
// @route   GET /api/admin/hotels
exports.getAllHotels = async (req, res, next) => {
  try {
    const store = req.app.locals.inMemoryStore;
    if (store) {
      const hotels = store.hotels || [];
      const rooms = store.rooms || [];
      const enriched = hotels.map((h) => {
        const hotelRooms = rooms.filter((r) => r.hotel && r.hotel.toString() === h._id.toString());
        return {
          ...h,
          roomCount: hotelRooms.length
        };
      });
      return res.json({ count: enriched.length, hotels: enriched });
    }

    const Hotel = require("../models/Hotel");
    const Room = require("../models/Room");
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    const enriched = await Promise.all(
      hotels.map(async (h) => {
        const count = await Room.countDocuments({ hotel: h._id });
        return { ...h.toObject(), roomCount: count };
      })
    );
    res.json({ count: enriched.length, hotels: enriched });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new hotel property
// @route   POST /api/admin/hotels
exports.createHotel = async (req, res, next) => {
  try {
    const {
      name,
      propertyCategory,
      summary,
      description,
      address,
      heroImage,
      startingPrice,
      starClassification,
      isStarVerified
    } = req.body;

    if (!name || !summary || !address?.city || !address?.state) {
      return res.status(400).json({ message: "Hotel name, summary, city, and state are required." });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const store = req.app.locals.inMemoryStore;

    // Calculate rating strictly from genuine reviews; initialize to null/0 if no reviews exist
    const genuineReviews = Array.isArray(req.body.reviews) ? req.body.reviews : [];
    let calculatedRating = null;
    let reviewCount = 0;

    if (genuineReviews.length > 0) {
      const validRatings = genuineReviews
        .map((r) => Number(r.rating))
        .filter((r) => !isNaN(r) && r >= 1 && r <= 5);
      if (validRatings.length > 0) {
        calculatedRating = Number(
          (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(2)
        );
        reviewCount = validRatings.length;
      }
    }

    const newHotel = {
      _id: new (require("mongoose").Types.ObjectId)().toString(),
      name,
      slug,
      summary,
      description: description || summary,
      propertyCategory: propertyCategory || "Boutique Resort",
      address: {
        addressLine: address.addressLine || `${address.locality || address.city}, ${address.city}`,
        locality: address.locality || address.city,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode || "400001",
        country: "India"
      },
      location: { type: "Point", coordinates: address.coordinates || [77.2090, 28.6139] },
      heroImage: heroImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      images: [heroImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945"],
      facilities: req.body.facilities || ["Wi-Fi", "Air Conditioning"],
      amenities: req.body.amenities || ["Free Wi-Fi"],
      starClassification: starClassification ? Number(starClassification) : null,
      isStarVerified: Boolean(isStarVerified),
      rating: calculatedRating,
      reviewCount: reviewCount,
      reviews: genuineReviews,
      policies: req.body.policies || {
        checkInTime: "14:00",
        checkOutTime: "11:00",
        cancellationPolicy: "Free cancellation up to 48 hours before check-in."
      },
      priceRange: { min: Number(startingPrice) || 4500, max: (Number(startingPrice) || 4500) * 3 },
      startingPrice: Number(startingPrice) || 4500,
      currency: "INR",
      status: "published",
      isDemo: false,
      source: "Admin_Created"
    };

    if (store) {
      if (!store.hotels) store.hotels = [];
      store.hotels.unshift(newHotel);
      return res.status(201).json({ hotel: newHotel, message: "Hotel created successfully." });
    }

    const Hotel = require("../models/Hotel");
    const hotelDoc = new Hotel(newHotel);
    await hotelDoc.save();
    res.status(201).json({ hotel: hotelDoc, message: "Hotel created successfully." });
  } catch (err) {
    next(err);
  }
};

// @desc    Update an existing hotel property
// @route   PUT /api/admin/hotels/:id
exports.updateHotel = async (req, res, next) => {
  try {
    const hotelId = req.params.id;
    const store = req.app.locals.inMemoryStore;

    if (store) {
      const idx = (store.hotels || []).findIndex((h) => h._id.toString() === hotelId.toString());
      if (idx === -1) {
        return res.status(404).json({ message: "Hotel not found." });
      }
      store.hotels[idx] = { ...store.hotels[idx], ...req.body };
      return res.json({ hotel: store.hotels[idx], message: "Hotel updated successfully." });
    }

    if (!store && !mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(404).json({ message: "Hotel not found." });
    }

    const updated = await Hotel.findByIdAndUpdate(hotelId, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Hotel not found." });
    }
    res.json({ hotel: updated, message: "Hotel updated successfully." });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a room type to a hotel
// @route   POST /api/admin/hotels/:id/rooms
exports.addHotelRoom = async (req, res, next) => {
  try {
    const hotelId = req.params.id;
    const { name, category, pricePerNight, capacity, heroImage, summary } = req.body;

    if (!name || !pricePerNight) {
      return res.status(400).json({ message: "Room name and price per night are required." });
    }

    const store = req.app.locals.inMemoryStore;
    let hotelName = "HotelPro Property";
    let locationStr = "India";

    if (store) {
      const hotel = (store.hotels || []).find((h) => h._id.toString() === hotelId.toString());
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found in directory." });
      }
      hotelName = hotel.name;
      locationStr = `${hotel.address?.city}, ${hotel.address?.state}, India`;
    } else {
      if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        return res.status(404).json({ message: "Hotel not found in directory." });
      }
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found in directory." });
      }
      hotelName = hotel.name;
      locationStr = `${hotel.address?.city}, ${hotel.address?.state}, India`;
    }

    const newRoom = {
      _id: new mongoose.Types.ObjectId().toString(),
      hotel: hotelId,
      name,
      category: category || "Classic Room",
      property: hotelName,
      location: locationStr,
      currency: "INR",
      pricePerNight: Number(pricePerNight),
      taxesAndFees: { gstPercent: Number(pricePerNight) >= 7500 ? 18 : 12, estimatedTax: 0 },
      capacity: capacity || { guests: 2, adults: 2, children: 0, bedrooms: 1, beds: 1 },
      sizeSqM: req.body.sizeSqM || 45,
      totalInventory: req.body.totalInventory || 5,
      availableInventory: req.body.availableInventory || 5,
      status: "Available",
      cleaningStatus: "Clean",
      featured: Boolean(req.body.featured),
      rating: null,
      reviewCount: 0,
      summary: summary || name,
      description: req.body.description || summary || name,
      heroImage: heroImage || "https://images.unsplash.com/photo-1599661046289-e31897846e41",
      gallery: [heroImage || "https://images.unsplash.com/photo-1599661046289-e31897846e41"],
      amenities: req.body.amenities || ["Free Wi-Fi", "Air Conditioning"],
      isActive: true
    };

    if (store) {
      if (!store.rooms) store.rooms = [];
      store.rooms.push(newRoom);
      return res.status(201).json({ room: newRoom, message: "Room type added successfully." });
    }

    const Room = require("../models/Room");
    const roomDoc = new Room(newRoom);
    await roomDoc.save();
    res.status(201).json({ room: roomDoc, message: "Room type added successfully." });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user account status (active | suspended)
// @route   PUT /api/admin/users/:id/status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Permitted: active, suspended" });
    }

    if (req.user && req.user._id && req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "Administrators cannot suspend their own account." });
    }

    const store = req.app.locals.inMemoryStore;
    if (store) {
      const user = store.users.find((u) => u._id.toString() === req.params.id);
      if (!user) return res.status(404).json({ message: "User not found." });
      user.status = status;
      const copy = { ...user };
      delete copy.password;
      return res.json({ user: copy, message: `User status changed to ${status}.` });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json({ user, message: `User status changed to ${status}.` });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete/Deactivate user account safely
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user && req.user._id && req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "Administrators cannot delete their own account." });
    }

    const store = req.app.locals.inMemoryStore;
    if (store) {
      const idx = store.users.findIndex((u) => u._id.toString() === req.params.id);
      if (idx === -1) return res.status(404).json({ message: "User not found." });
      store.users.splice(idx, 1);
      return res.json({ success: true, message: "User account removed successfully." });
    }

    const adminCount = await User.countDocuments({ role: "admin" });
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found." });

    if (targetUser.role === "admin" && adminCount <= 1) {
      return res.status(400).json({ message: "Cannot remove the sole remaining administrator account." });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User account removed successfully." });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new staff account (Admin provisioning only)
// @route   POST /api/admin/staff
exports.createStaffAccount = async (req, res, next) => {
  try {
    const { name, email, password, department, assignedProperty, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and temporary passkey are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const bcrypt = require("bcryptjs");

    const store = req.app.locals.inMemoryStore;
    if (store) {
      const exists = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        return res.status(400).json({ message: "An account with this email already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newStaff = {
        _id: `user_${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: "staff",
        department: department || "Front Desk",
        assignedProperty: assignedProperty || "AtithiGo Palaces",
        phone: phone || "",
        status: "active",
        isEmailVerified: true,
        createdAt: new Date().toISOString()
      };
      store.users.push(newStaff);

      const copy = { ...newStaff };
      delete copy.password;
      return res.status(201).json({ staff: copy, message: "Staff account created successfully." });
    }

    const exists = await User.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const staffUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: "staff",
      department: department || "Front Desk",
      assignedProperty: assignedProperty || "AtithiGo Palaces",
      phone: phone || "",
      status: "active",
      isEmailVerified: true
    });

    res.status(201).json({
      staff: {
        _id: staffUser._id,
        name: staffUser.name,
        email: staffUser.email,
        role: staffUser.role,
        department: staffUser.department,
        assignedProperty: staffUser.assignedProperty,
        phone: staffUser.phone
      },
      message: "Staff account created successfully."
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all staff members
// @route   GET /api/admin/staff
exports.getAllStaff = async (req, res, next) => {
  try {
    const store = req.app.locals.inMemoryStore;
    if (store) {
      const staff = store.users
        .filter((u) => u.role === "staff")
        .map((u) => {
          const c = { ...u };
          delete c.password;
          return c;
        });
      return res.json({ count: staff.length, staff });
    }

    const staff = await User.find({ role: "staff" }).select("-password").sort({ createdAt: -1 });
    res.json({ count: staff.length, staff });
  } catch (err) {
    next(err);
  }
};

// @desc    Create and assign operational task to staff
// @route   POST /api/admin/tasks
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, department, priority, assignedTo, property, roomName, deadline } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Task title is required." });
    }

    const Task = require("../models/Task");
    const store = req.app.locals.inMemoryStore;

    if (store) {
      if (!store.tasks) store.tasks = [];
      const newTask = {
        _id: `task_${Date.now()}`,
        title: title.trim(),
        description: description || "",
        department: department || "Front Desk",
        priority: priority || "Normal",
        status: "Pending",
        assignedTo: assignedTo || null,
        property: property || "AtithiGo Sanctuaries",
        roomName: roomName || "",
        deadline: deadline ? new Date(deadline) : null,
        notes: [],
        createdAt: new Date().toISOString()
      };
      store.tasks.push(newTask);
      return res.status(201).json({ task: newTask, message: "Operational task assigned successfully." });
    }

    let assignedToName = "Unassigned";
    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      const staffUser = await User.findById(assignedTo);
      if (staffUser) assignedToName = staffUser.name;
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      department: department || "Front Desk",
      priority: priority || "Normal",
      status: "Pending",
      assignedTo: assignedTo && mongoose.Types.ObjectId.isValid(assignedTo) ? assignedTo : null,
      assignedToName,
      property: property || "AtithiGo Sanctuaries",
      roomName: roomName || "",
      deadline: deadline ? new Date(deadline) : null,
      createdBy: req.user._id
    });

    res.status(201).json({ task, message: "Operational task assigned successfully." });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all operational tasks (Admin)
// @route   GET /api/admin/tasks
exports.getAllTasks = async (req, res, next) => {
  try {
    const Task = require("../models/Task");
    const store = req.app.locals.inMemoryStore;

    if (store) {
      const tasks = store.tasks || [];
      return res.json({ count: tasks.length, tasks });
    }

    const tasks = await Task.find().populate("assignedTo", "name email department").sort({ createdAt: -1 });
    res.json({ count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reservations across portfolio (Admin)
// @route   GET /api/admin/bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const store = req.app.locals.inMemoryStore;
    if (store) {
      const bookings = store.bookings || [];
      return res.json({ count: bookings.length, bookings });
    }

    const bookings = await Booking.find().populate("user", "name email phone").sort({ createdAt: -1 });
    res.json({ count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

