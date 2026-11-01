const express = require("express");
const router = express.Router();
const {
  createBooking,
  createRazorpayOrder,
  verifyPayment,
  getMyBookings,
  getBookingById,
  getAllBookings,
  cancelBooking,
  updateBookingStatus,
  getPaymentGatewayTelemetry,
  handlePaymentWebhook,
  processBookingRefund,
  getBookingRefundDetails
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Public payment telemetry & merchant webhooks (Zero secrets leaked; authenticated via HMAC signature)
router.get("/payment-telemetry", getPaymentGatewayTelemetry);
router.post("/payment-webhook", handlePaymentWebhook);

// All subsequent booking operations require valid authentication
router.use(protect);

router.post("/", createBooking);
router.post("/:id/create-razorpay-order", createRazorpayOrder);
router.post("/:id/verify-payment", verifyPayment);
router.get("/my", getMyBookings);
router.get("/:id", getBookingById);
router.put("/:id/cancel", cancelBooking);
router.post("/:id/refund", processBookingRefund);
router.get("/:id/refund", getBookingRefundDetails);

// Staff and Admin routes
router.get("/", authorize("staff", "admin"), getAllBookings);
router.put("/:id/status", authorize("staff", "admin"), updateBookingStatus);

module.exports = router;
