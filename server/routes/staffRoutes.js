const express = require("express");
const router = express.Router();
const {
  getStaffOverview,
  updateRoomCleaningStatus,
  updateHousekeepingTask,
  getStaffTasks,
  updateTaskStatus,
  recordCheckIn,
  recordCheckOut
} = require("../controllers/staffController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);
router.use(authorize("staff", "admin"));

router.get("/overview", getStaffOverview);
router.put("/rooms/:id/cleaning", updateRoomCleaningStatus);
router.put("/housekeeping/:id", updateHousekeepingTask);

// Staff operational tasks & guest lifecycle
router.get("/tasks", getStaffTasks);
router.put("/tasks/:id/status", updateTaskStatus);
router.put("/bookings/:id/check-in", recordCheckIn);
router.put("/bookings/:id/check-out", recordCheckOut);

module.exports = router;

