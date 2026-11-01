const express = require("express");
const router = express.Router();
const {
  getAdminMetrics,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  createStaffAccount,
  getAllStaff,
  createTask,
  getAllTasks,
  getAllBookings,
  getAllHotels,
  createHotel,
  updateHotel,
  addHotelRoom
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);
router.use(authorize("admin"));

// Analytics & Reports
router.get("/metrics", getAdminMetrics);

// User Management
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

// Staff Provisioning & Management
router.post("/staff", createStaffAccount);
router.get("/staff", getAllStaff);

// Operational Task Management
router.post("/tasks", createTask);
router.get("/tasks", getAllTasks);

// Bookings & Financial Auditing
router.get("/bookings", getAllBookings);

// Hotel Property & Room Type Management
router.get("/hotels", getAllHotels);
router.post("/hotels", createHotel);
router.put("/hotels/:id", updateHotel);
router.post("/hotels/:id/rooms", addHotelRoom);

module.exports = router;
