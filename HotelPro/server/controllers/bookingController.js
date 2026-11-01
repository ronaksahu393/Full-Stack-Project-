const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { calculateBookingPricing } = require("../utils/taxCalculator");
const {
  createRazorpayOrder: generateRazorpayOrder,
  verifyPaymentTransaction,
  verifyRazorpayWebhookSignature,
  verifyStripeWebhookSignature,
  getPaymentGatewayStatus,
  processGatewayRefund
} = require("../services/paymentService");

// Concurrency mutex locks for in-flight room booking requests to prevent race condition double-bookings
const roomLocks = new Map();
const LOCK_TIMEOUT_MS = 8000;

const acquireLock = (roomId) => {
  const key = roomId.toString();
  const now = Date.now();
  if (roomLocks.has(key)) {
    const lockTime = roomLocks.get(key);
    if (now - lockTime < LOCK_TIMEOUT_MS) {
      return false; // Still held by an active session
    }
  }
  roomLocks.set(key, now);
  return true;
};

const releaseLock = (roomId) => {
  roomLocks.delete(roomId.toString());
};

// Check if current MongoDB deployment supports multi-document transactions (ReplicaSet or Sharded cluster)
function isTransactionSupported() {
  try {
    const client = mongoose.connection?.client;
    if (!client || !client.topology) return false;
    const desc = client.topology.description;
    const type = desc?.type;
    return type === "ReplicaSetWithPrimary" || type === "Sharded";
  } catch {
    return false;
  }
}

// Valid status state machine transitions
const VALID_TRANSITIONS = {
  "Pending Payment": ["Confirmed", "Cancelled"],
  "Confirmed": ["Checked In", "Checked-In", "Cancellation Requested", "Cancelled"],
  "Checked In": ["Checked Out", "Completed"],
  "Checked-In": ["Checked Out", "Completed"],
  "Cancellation Requested": ["Cancelled", "Confirmed"],
  "Checked Out": [],
  "Completed": [],
  "Cancelled": []
};

// @desc    Create a new booking with rigorous server-side validation and concurrency checks
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
  const {
    roomId,
    checkIn,
    checkOut,
    guests,
    guestName,
    guestEmail,
    guestPhone,
    specialRequests
  } = req.body;

  if (!roomId || !checkIn || !checkOut || !guests || !guestName || !guestEmail) {
    return res.status(400).json({ message: "Please provide all required booking fields." });
  }

  // Parse and validate dates strictly
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return res.status(400).json({ message: "Invalid date format specified for stay." });
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (checkInDate < now) {
    return res.status(400).json({ message: "Check-in date cannot be in the past." });
  }

  if (checkOutDate <= checkInDate) {
    return res.status(400).json({ message: "Check-out date must be at least one day after check-in." });
  }

  const diffTime = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (nights < 1) {
    return res.status(400).json({ message: "Stay duration must be a minimum of 1 night." });
  }

  // Validate guest counts
  const adultsCount = Number(guests?.adults);
  if (isNaN(adultsCount) || adultsCount < 1) {
    return res.status(400).json({ message: "At least 1 adult guest is required." });
  }
  const childrenCount = Math.max(0, Number(guests?.children) || 0);
  const totalGuests = adultsCount + childrenCount;

  // Acquire concurrency lock on this specific room
  if (!acquireLock(roomId)) {
    return res.status(409).json({
      code: "CONCURRENT_BOOKING_IN_PROGRESS",
      message: "This suite is currently being reserved by another session. Please retry momentarily."
    });
  }

  try {
    const store = req.app.locals.inMemoryStore;

    if (store) {
      const room = store.rooms.find((r) => r._id.toString() === roomId.toString());
      if (!room) {
        return res.status(404).json({ message: "Selected suite not found in portfolio." });
      }

      if (room.status === "Maintenance") {
        return res.status(400).json({ message: "This suite is temporarily unavailable due to architectural maintenance." });
      }

      if (room.isActive === false) {
        return res.status(400).json({ message: "This suite is currently inactive." });
      }

      if (room.availableInventory !== undefined && room.availableInventory !== null && Number(room.availableInventory) <= 0) {
        return res.status(400).json({ message: "No inventory currently available for this suite." });
      }

      if (totalGuests > room.capacity.guests) {
        return res.status(400).json({
          message: `This suite accommodates a maximum of ${room.capacity.guests} guests (selected: ${totalGuests}).`
        });
      }

      // Check for duplicate active reservation from the same user on overlapping stay dates
      const duplicateUserBooking = store.bookings.find(
        (b) =>
          b.user.toString() === req.user._id.toString() &&
          b.room.toString() === roomId.toString() &&
          b.status !== "Cancelled" &&
          checkInDate < new Date(b.checkOut) &&
          checkOutDate > new Date(b.checkIn)
      );

      if (duplicateUserBooking) {
        return res.status(409).json({
          code: "DUPLICATE_BOOKING_REQUEST",
          message: "You already have an active reservation for this suite on the selected dates.",
          booking: duplicateUserBooking
        });
      }

      // Check date collision with existing active bookings for this room (exclude Cancelled)
      const collision = store.bookings.some((b) => {
        if (b.room.toString() !== roomId.toString() || b.status === "Cancelled") {
          return false;
        }
        const bIn = new Date(b.checkIn);
        const bOut = new Date(b.checkOut);
        return checkInDate < bOut && checkOutDate > bIn;
      });

      if (collision) {
        return res.status(409).json({
          code: "OVERLAPPING_RESERVATION",
          message: "The requested stay dates overlap with an existing reservation for this suite."
        });
      }

      // Server recalculates price and tax: NEVER trust client-submitted totalPrice
      const pricing = calculateBookingPricing(room, nights);
      const isComplimentary = pricing.totalPrice === 0;

      const newBooking = {
        _id: `booking_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        hotel: room.hotel || null,
        hotelName: room.property || "",
        city: room.location ? room.location.split(",")[0].trim() : "",
        state: room.location ? (room.location.split(",")[1] || "").trim() : "",
        room: room._id,
        user: req.user._id, // Strictly bind to authenticated session
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim().toLowerCase(),
        guestPhone: guestPhone ? guestPhone.trim() : "",
        roomName: room.name,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        nights: pricing.nights,
        currency: pricing.currency,
        pricePerNight: pricing.pricePerNight,
        basePrice: pricing.basePrice,
        taxRatePercent: pricing.gstPercent,
        taxAmount: pricing.taxAmount,
        guests: {
          adults: adultsCount,
          children: childrenCount
        },
        totalPrice: pricing.totalPrice,
        status: isComplimentary ? "Confirmed" : "Pending Payment",
        paymentStatus: isComplimentary ? "Paid" : "Pending",
        paymentMethod: isComplimentary ? "Complimentary" : "Pending",
        paymentTransactionId: "",
        isDemoPayment: false,
        specialRequests: specialRequests ? specialRequests.trim() : "",
        createdAt: new Date().toISOString()
      };

      store.bookings.unshift(newBooking);

      return res.status(201).json({
        booking: newBooking,
        message: isComplimentary
          ? "Reservation confirmed. Complimentary voucher active."
          : "Reservation held successfully. Pending payment verification."
      });
    }

    // Mongoose path
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(404).json({ message: "Selected suite not found in portfolio." });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Selected suite not found in portfolio." });
    }

    if (room.status === "Maintenance") {
      return res.status(400).json({ message: "This suite is temporarily unavailable due to architectural maintenance." });
    }

    if (room.isActive === false) {
      return res.status(400).json({ message: "This suite is currently inactive." });
    }

    if (room.availableInventory !== undefined && room.availableInventory !== null && Number(room.availableInventory) <= 0) {
      return res.status(400).json({ message: "No inventory currently available for this suite." });
    }

    if (totalGuests > room.capacity.guests) {
      return res.status(400).json({
        message: `This suite accommodates a maximum of ${room.capacity.guests} guests (selected: ${totalGuests}).`
      });
    }

    // Prevent duplicate bookings from the same user for overlapping dates
    const duplicateUserBooking = await Booking.findOne({
      user: req.user._id,
      room: roomId,
      status: { $ne: "Cancelled" },
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate }
    });

    if (duplicateUserBooking) {
      return res.status(409).json({
        code: "DUPLICATE_BOOKING_REQUEST",
        message: "You already have an active reservation for this suite on the selected dates.",
        booking: duplicateUserBooking
      });
    }

    const pricing = calculateBookingPricing(room, nights);
    const isComplimentary = pricing.totalPrice === 0;

    const bookingPayload = {
      hotel: room.hotel || null,
      hotelName: room.property || "",
      city: room.location ? room.location.split(",")[0].trim() : "",
      state: room.location ? (room.location.split(",")[1] || "").trim() : "",
      room: room._id,
      user: req.user._id,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone ? guestPhone.trim() : "",
      roomName: room.name,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights: pricing.nights,
      currency: pricing.currency,
      pricePerNight: pricing.pricePerNight,
      basePrice: pricing.basePrice,
      taxRatePercent: pricing.gstPercent,
      taxAmount: pricing.taxAmount,
      guests: {
        adults: adultsCount,
        children: childrenCount
      },
      totalPrice: pricing.totalPrice,
      status: isComplimentary ? "Confirmed" : "Pending Payment",
      paymentStatus: isComplimentary ? "Paid" : "Pending",
      paymentMethod: isComplimentary ? "Complimentary" : "Pending",
      paymentTransactionId: "",
      isDemoPayment: false,
      specialRequests: specialRequests ? specialRequests.trim() : ""
    };

    // If MongoDB supports replica-set transactions, execute within an ACID transaction session
    if (isTransactionSupported()) {
      const session = await mongoose.startSession();
      try {
        let createdBooking = null;
        await session.withTransaction(async () => {
          const collision = await Booking.findOne({
            room: roomId,
            status: { $ne: "Cancelled" },
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate }
          }).session(session);

          if (collision) {
            const err = new Error("The requested stay dates overlap with an existing reservation for this suite.");
            err.statusCode = 409;
            throw err;
          }

          const [newB] = await Booking.create([bookingPayload], { session });
          createdBooking = newB;
        });

        return res.status(201).json({
          booking: createdBooking,
          message: isComplimentary
            ? "Reservation confirmed. Complimentary voucher active."
            : "Reservation held successfully. Pending payment verification."
        });
      } finally {
        await session.endSession();
      }
    }

    // Explicit safe alternative for standalone MongoDB / single-node deployments
    const collision = await Booking.findOne({
      room: roomId,
      status: { $ne: "Cancelled" },
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate }
    });

    if (collision) {
      return res.status(409).json({
        code: "OVERLAPPING_RESERVATION",
        message: "The requested stay dates overlap with an existing reservation for this suite."
      });
    }

    const booking = await Booking.create(bookingPayload);

    return res.status(201).json({
      booking,
      message: isComplimentary
        ? "Reservation confirmed. Complimentary voucher active."
        : "Reservation held successfully. Pending payment verification."
    });
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({ message: err.message });
    }
    next(err);
  } finally {
    releaseLock(roomId);
  }
};

// @desc    Create Razorpay Order for a booking
// @route   POST /api/bookings/:id/create-razorpay-order
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const store = req.app.locals.inMemoryStore;

    if (store) {
      const booking = store.bookings.find((b) => b._id.toString() === bookingId.toString());
      if (!booking) {
        return res.status(404).json({ message: "Reservation not found." });
      }

      const bookingUserId = booking.user ? booking.user.toString() : "";
      const isOwner =
        bookingUserId === req.user._id.toString() ||
        (booking.guestEmail && booking.guestEmail.toLowerCase() === req.user.email.toLowerCase());
      if (!isOwner && req.user.role === "guest") {
        return res.status(403).json({ message: "Not authorized to initiate payment for this reservation." });
      }

      if (booking.paymentStatus === "Paid") {
        return res.status(400).json({ message: "Reservation has already been paid and settled." });
      }

      if (booking.status === "Cancelled") {
        return res.status(400).json({ message: "Cannot create payment order for a cancelled reservation." });
      }

      const order = await generateRazorpayOrder({ booking });
      booking.razorpayOrderId = order.orderId;

      return res.json({
        success: true,
        order,
        booking: {
          _id: booking._id,
          totalPrice: booking.totalPrice,
          currency: booking.currency || "INR",
          roomName: booking.roomName,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          guestPhone: booking.guestPhone
        }
      });
    }

    // Mongoose path
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    const bookingUserId = booking.user ? booking.user.toString() : "";
    const isOwner =
      bookingUserId === req.user._id.toString() ||
      (booking.guestEmail && booking.guestEmail.toLowerCase() === req.user.email.toLowerCase());
    if (!isOwner && req.user.role === "guest") {
      return res.status(403).json({ message: "Not authorized to initiate payment for this reservation." });
    }

    if (booking.paymentStatus === "Paid") {
      return res.status(400).json({ message: "Reservation has already been paid and settled." });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Cannot create payment order for a cancelled reservation." });
    }

    const order = await generateRazorpayOrder({ booking });
    booking.razorpayOrderId = order.orderId;
    await booking.save();

    return res.json({
      success: true,
      order,
      booking: {
        _id: booking._id,
        totalPrice: booking.totalPrice,
        currency: booking.currency || "INR",
        roomName: booking.roomName,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify payment for an existing booking (Stripe / Razorpay / Secure Demo Simulator)
// @route   POST /api/bookings/:id/verify-payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const store = req.app.locals.inMemoryStore;

    if (store) {
      const booking = store.bookings.find((b) => b._id.toString() === bookingId.toString());
      if (!booking) {
        return res.status(404).json({ message: "Reservation not found." });
      }

      // Check user authorization (ownership or staff/admin)
      const bookingUserId = booking.user ? booking.user.toString() : "";
      const isOwner =
        bookingUserId === req.user._id.toString() ||
        (booking.guestEmail && booking.guestEmail.toLowerCase() === req.user.email.toLowerCase());
      if (!isOwner && req.user.role === "guest") {
        return res.status(403).json({ message: "Not authorized to process payment for this reservation." });
      }

      // Prevent payment on cancelled reservations
      if (booking.status === "Cancelled") {
        return res.status(400).json({ message: "Cannot process payment for a cancelled reservation." });
      }

      // Idempotency check: if already Paid
      const incomingTx = req.body.razorpay_payment_id || req.body.paymentIntentId || req.body.transactionId;
      if (booking.paymentStatus === "Paid") {
        if (incomingTx && booking.paymentTransactionId === incomingTx) {
          return res.status(200).json({
            booking,
            message: "Payment has already been verified and settled for this transaction."
          });
        }
        return res.status(409).json({ message: "This reservation has already been settled and paid." });
      }

      // Verify payment through server-side payment service
      let verification;
      try {
        verification = await verifyPaymentTransaction({
          booking,
          body: req.body,
          isProduction: process.env.NODE_ENV === "production"
        });
      } catch (verifyErr) {
        booking.paymentStatus = "Failed";
        if (!Array.isArray(booking.refundAuditLog)) booking.refundAuditLog = [];
        booking.refundAuditLog.push({
          action: "PAYMENT_VERIFICATION_FAILED",
          status: "Failed",
          message: verifyErr.message,
          timestamp: new Date().toISOString(),
          performedBy: req.user.email || req.user._id
        });
        return res.status(verifyErr.statusCode || 400).json({
          code: verifyErr.code || "PAYMENT_VERIFICATION_FAILED",
          message: verifyErr.message
        });
      }

      // Replay attack prevention: verify transaction ID has not been used on another reservation
      if (verification.transactionId) {
        const duplicate = store.bookings.find(
          (b) => b._id.toString() !== bookingId.toString() && b.paymentTransactionId === verification.transactionId
        );
        if (duplicate) {
          return res.status(409).json({
            code: "DUPLICATE_PAYMENT_REFERENCE",
            message: "This payment transaction reference has already been applied to another reservation."
          });
        }
      }

      booking.paymentStatus = "Paid";
      booking.status = "Confirmed";
      booking.paymentMethod = verification.paymentMethod;
      booking.paymentTransactionId = verification.transactionId;
      booking.paidAt = new Date().toISOString();
      booking.isDemoPayment = verification.isDemoPayment;

      return res.json({
        booking,
        message: verification.message
      });
    }

    // Mongoose path
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    const bookingUserId = booking.user ? booking.user.toString() : "";
    const isOwner =
      bookingUserId === req.user._id.toString() ||
      (booking.guestEmail && booking.guestEmail.toLowerCase() === req.user.email.toLowerCase());
    if (!isOwner && req.user.role === "guest") {
      return res.status(403).json({ message: "Not authorized to process payment for this reservation." });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Cannot process payment for a cancelled reservation." });
    }

    const incomingTx = req.body.razorpay_payment_id || req.body.paymentIntentId || req.body.transactionId;
    if (booking.paymentStatus === "Paid") {
      if (incomingTx && booking.paymentTransactionId === incomingTx) {
        return res.status(200).json({
          booking,
          message: "Payment has already been verified and settled for this transaction."
        });
      }
      return res.status(409).json({ message: "This reservation has already been settled and paid." });
    }

    let verification;
    try {
      verification = await verifyPaymentTransaction({
        booking,
        body: req.body,
        isProduction: process.env.NODE_ENV === "production"
      });
    } catch (verifyErr) {
      booking.paymentStatus = "Failed";
      if (!Array.isArray(booking.refundAuditLog)) booking.refundAuditLog = [];
      booking.refundAuditLog.push({
        action: "PAYMENT_VERIFICATION_FAILED",
        status: "Failed",
        message: verifyErr.message,
        timestamp: new Date(),
        performedBy: req.user.email || req.user._id.toString()
      });
      await booking.save();
      return res.status(verifyErr.statusCode || 400).json({
        code: verifyErr.code || "PAYMENT_VERIFICATION_FAILED",
        message: verifyErr.message
      });
    }

    if (verification.transactionId) {
      const duplicate = await Booking.findOne({
        paymentTransactionId: verification.transactionId,
        _id: { $ne: booking._id }
      });
      if (duplicate) {
        return res.status(409).json({
          code: "DUPLICATE_PAYMENT_REFERENCE",
          message: "This payment transaction reference has already been applied to another reservation."
        });
      }
    }

    booking.paymentStatus = "Paid";
    booking.status = "Confirmed";
    booking.paymentMethod = verification.paymentMethod;
    booking.paymentTransactionId = verification.transactionId;
    booking.paidAt = new Date();
    booking.isDemoPayment = verification.isDemoPayment;
    await booking.save();

    res.json({
      booking,
      message: verification.message
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get payment gateway status telemetry (safe, zero secrets)
// @route   GET /api/bookings/payment-telemetry
exports.getPaymentGatewayTelemetry = (req, res) => {
  res.json(getPaymentGatewayStatus());
};

// @desc    Handle incoming merchant payment webhooks with cryptographic signature verification
// @route   POST /api/bookings/payment-webhook
exports.handlePaymentWebhook = async (req, res, next) => {
  try {
    const razorpaySignature = req.headers["x-razorpay-signature"];
    const stripeSignature = req.headers["stripe-signature"];
    const rawBody = req.body;

    // 1. Razorpay Webhook Handler
    if (razorpaySignature) {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!secret) {
        return res.status(503).json({ message: "Razorpay webhook secret not configured on server." });
      }

      const isValid = verifyRazorpayWebhookSignature({ rawBody, signature: razorpaySignature, secret });
      if (!isValid) {
        return res.status(400).json({ message: "Invalid Razorpay webhook signature." });
      }

      const event = req.body.event;
      if (event === "payment.captured" || event === "order.paid") {
        const paymentEntity = req.body.payload?.payment?.entity;
        const notes = paymentEntity?.notes || {};
        const bookingId = notes.bookingId || notes.booking_id;
        const transactionId = paymentEntity?.id;

        if (bookingId) {
          const store = req.app.locals.inMemoryStore;
          if (store) {
            const booking = store.bookings.find((b) => b._id.toString() === bookingId.toString());
            if (booking && booking.paymentStatus !== "Paid") {
              booking.paymentStatus = "Paid";
              booking.status = "Confirmed";
              booking.paymentTransactionId = transactionId || booking.paymentTransactionId;
              booking.paidAt = new Date().toISOString();
            }
          } else {
            const booking = await Booking.findById(bookingId);
            if (booking && booking.paymentStatus !== "Paid") {
              booking.paymentStatus = "Paid";
              booking.status = "Confirmed";
              booking.paymentTransactionId = transactionId || booking.paymentTransactionId;
              booking.paidAt = new Date();
              await booking.save();
            }
          }
        }
      }

      return res.status(200).json({ received: true });
    }

    // 2. Stripe Webhook Handler
    if (stripeSignature) {
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!secret) {
        return res.status(503).json({ message: "Stripe webhook secret not configured on server." });
      }

      const isValid = verifyStripeWebhookSignature({ rawBody, signatureHeader: stripeSignature, secret });
      if (!isValid) {
        return res.status(400).json({ message: "Invalid Stripe webhook signature." });
      }

      const eventType = req.body.type;
      if (eventType === "payment_intent.succeeded") {
        const pi = req.body.data?.object;
        const bookingId = pi?.metadata?.bookingId || pi?.metadata?.booking_id;
        const transactionId = pi?.id;

        if (bookingId) {
          const store = req.app.locals.inMemoryStore;
          if (store) {
            const booking = store.bookings.find((b) => b._id.toString() === bookingId.toString());
            if (booking && booking.paymentStatus !== "Paid") {
              booking.paymentStatus = "Paid";
              booking.status = "Confirmed";
              booking.paymentTransactionId = transactionId || booking.paymentTransactionId;
              booking.paidAt = new Date().toISOString();
            }
          } else {
            const booking = await Booking.findById(bookingId);
            if (booking && booking.paymentStatus !== "Paid") {
              booking.paymentStatus = "Paid";
              booking.status = "Confirmed";
              booking.paymentTransactionId = transactionId || booking.paymentTransactionId;
              booking.paidAt = new Date();
              await booking.save();
            }
          }
        }
      }

      return res.status(200).json({ received: true });
    }

    return res.status(400).json({ message: "Unrecognized webhook signature headers." });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's personal bookings (Strictly filtered by authenticated user ID)
// @route   GET /api/bookings/my
exports.getMyBookings = async (req, res, next) => {
  try {
    const store = req.app.locals.inMemoryStore;
    if (store) {
      const userBookings = store.bookings.filter(
        (b) => b.user.toString() === req.user._id.toString() || b.guestEmail.toLowerCase() === req.user.email.toLowerCase()
      );
      return res.json({ bookings: userBookings });
    }

    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking by ID (Strict ownership or staff/admin access)
// @route   GET /api/bookings/:id
exports.getBookingById = async (req, res, next) => {
  try {
    const store = req.app.locals.inMemoryStore;
    if (store) {
      const booking = store.bookings.find((b) => b._id.toString() === req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      const bookingUserId = booking.user ? booking.user.toString() : "";
      const isStaffOrAdmin = req.user.role === "staff" || req.user.role === "admin";
      const isOwner = bookingUserId === req.user._id.toString() || (booking.guestEmail && booking.guestEmail.toLowerCase() === req.user.email.toLowerCase());

      if (!isStaffOrAdmin && !isOwner) {
        return res.status(403).json({ message: "Forbidden: Not authorized to view this reservation." });
      }

      return res.json({ booking });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const bookingUserId = booking.user ? booking.user.toString() : "";
    const isStaffOrAdmin = req.user.role === "staff" || req.user.role === "admin";
    const isOwner = bookingUserId === req.user._id.toString() || (booking.guestEmail && booking.guestEmail.toLowerCase() === req.user.email.toLowerCase());

    if (!isStaffOrAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden: Not authorized to view this reservation." });
    }

    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings (Staff & Admin only)
// @route   GET /api/bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const store = req.app.locals.inMemoryStore;
    if (store) {
      return res.json({ count: store.bookings.length, bookings: store.bookings });
    }

    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

/**
 * Calculates cancellation eligibility and applicable refund based on arrival window.
 */
function calculateCancellationEligibility(booking) {
  const now = Date.now();
  const checkInTime = new Date(booking.checkIn).getTime();
  const hoursUntilCheckIn = (checkInTime - now) / (1000 * 60 * 60);

  if (booking.status === "Completed" || booking.status === "Checked Out") {
    return { eligible: false, reason: "Cannot cancel a completed stay." };
  }
  if (booking.status === "Checked In" || booking.status === "Checked-In") {
    return { eligible: false, reason: "Cannot cancel a stay that is already in progress. Please speak with the concierge desk." };
  }
  if (booking.status === "Cancelled") {
    return { eligible: false, reason: "This reservation is already cancelled." };
  }

  let eligibleRefundAmount = 0;
  let policyTier = "Non-Refundable";

  if (booking.paymentStatus === "Paid") {
    if (hoursUntilCheckIn >= 48) {
      eligibleRefundAmount = booking.totalPrice;
      policyTier = "Complimentary 100% Refund (Cancelled > 48h prior to arrival)";
    } else if (hoursUntilCheckIn > 0 && hoursUntilCheckIn < 48) {
      const oneNightRetention = booking.pricePerNight || Math.round(booking.totalPrice / (booking.nights || 1));
      eligibleRefundAmount = Math.max(0, booking.totalPrice - oneNightRetention);
      policyTier = `Late Cancellation (Within 48h): 1-night retention fee applicable (₹${oneNightRetention})`;
    } else {
      eligibleRefundAmount = 0;
      policyTier = "Non-Refundable (Cancelled on or after check-in date)";
    }
  }

  return {
    eligible: true,
    hoursUntilCheckIn,
    eligibleRefundAmount,
    policyTier
  };
}

// @desc    Cancel a booking with authorization and status transition checks
// @route   PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const store = req.app.locals.inMemoryStore;
    const cancellationReason = req.body?.reason ? req.body.reason.trim() : "Guest requested cancellation";

    if (store) {
      const booking = store.bookings.find((b) => b._id.toString() === req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      // Check ownership or staff/admin
      const bookingUserId = booking.user ? booking.user.toString() : "";
      const isStaffOrAdmin = req.user.role === "staff" || req.user.role === "admin";
      const isOwner = bookingUserId === req.user._id.toString() || (booking.guestEmail && booking.guestEmail.toLowerCase() === req.user.email.toLowerCase());

      if (!isStaffOrAdmin && !isOwner) {
        return res.status(403).json({ message: "Not authorized to cancel this booking." });
      }

      const eligibility = calculateCancellationEligibility(booking);
      if (!eligibility.eligible) {
        return res.status(400).json({ message: eligibility.reason });
      }

      if (!Array.isArray(booking.refundAuditLog)) {
        booking.refundAuditLog = [];
      }

      booking.status = "Cancelled";
      booking.cancelledAt = new Date().toISOString();
      booking.cancellationReason = cancellationReason;

      let refundMessage = "";
      if (booking.paymentStatus === "Paid") {
        booking.refundStatus = "Pending";
        booking.paymentStatus = "Refund Pending";
        booking.refundAmount = eligibility.eligibleRefundAmount;
        booking.refundRequestedAt = new Date().toISOString();

        booking.refundAuditLog.push({
          action: "CANCEL_INITIATE_REFUND",
          status: "Pending",
          amount: eligibility.eligibleRefundAmount,
          message: `Cancellation confirmed. Refund of ₹${eligibility.eligibleRefundAmount} initiated (${eligibility.policyTier}).`,
          timestamp: new Date().toISOString(),
          performedBy: req.user.email || req.user._id
        });

        refundMessage = `Your reservation has been cancelled. Payment refund has been initiated with the merchant provider.`;
      } else {
        booking.refundStatus = "Not_Applicable";
        booking.refundAmount = 0;

        booking.refundAuditLog.push({
          action: "CANCEL_UNPAID",
          status: "Not_Applicable",
          amount: 0,
          message: "Reservation cancelled prior to payment settlement; no refund required.",
          timestamp: new Date().toISOString(),
          performedBy: req.user.email || req.user._id
        });

        refundMessage = "Your reservation has been cancelled. No payment was captured, so no refund was required.";
      }

      return res.json({
        booking,
        message: refundMessage
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const bookingUserId = booking.user ? booking.user.toString() : "";
    const isStaffOrAdmin = req.user.role === "staff" || req.user.role === "admin";
    const isOwner = bookingUserId === req.user._id.toString() || (booking.guestEmail && booking.guestEmail.toLowerCase() === req.user.email.toLowerCase());

    if (!isStaffOrAdmin && !isOwner) {
      return res.status(403).json({ message: "Not authorized to cancel this booking." });
    }

    const eligibility = calculateCancellationEligibility(booking);
    if (!eligibility.eligible) {
      return res.status(400).json({ message: eligibility.reason });
    }

    booking.status = "Cancelled";
    booking.cancelledAt = new Date();
    booking.cancellationReason = cancellationReason;

    let refundMessage = "";
    if (booking.paymentStatus === "Paid") {
      booking.refundStatus = "Pending";
      booking.paymentStatus = "Refund Pending";
      booking.refundAmount = eligibility.eligibleRefundAmount;
      booking.refundRequestedAt = new Date();

      booking.refundAuditLog.push({
        action: "CANCEL_INITIATE_REFUND",
        status: "Pending",
        amount: eligibility.eligibleRefundAmount,
        message: `Cancellation confirmed. Refund of ₹${eligibility.eligibleRefundAmount} initiated (${eligibility.policyTier}).`,
        timestamp: new Date(),
        performedBy: req.user.email || req.user._id.toString()
      });

      refundMessage = `Your reservation has been cancelled. Payment refund has been initiated with the merchant provider.`;
    } else {
      booking.refundStatus = "Not_Applicable";
      booking.refundAmount = 0;

      booking.refundAuditLog.push({
        action: "CANCEL_UNPAID",
        status: "Not_Applicable",
        amount: 0,
        message: "Reservation cancelled prior to payment settlement; no refund required.",
        timestamp: new Date(),
        performedBy: req.user.email || req.user._id.toString()
      });

      refundMessage = "Your reservation has been cancelled. No payment was captured, so no refund was required.";
    }

    await booking.save();

    res.json({
      booking,
      message: refundMessage
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Process refund with configured payment gateway or demo simulator
// @route   POST /api/bookings/:id/refund
exports.processBookingRefund = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const store = req.app.locals.inMemoryStore;
    const { simulateFailure } = req.body || {};

    if (store) {
      const booking = store.bookings.find((b) => b._id.toString() === bookingId.toString());
      if (!booking) {
        return res.status(404).json({ message: "Reservation not found." });
      }

      const bookingUserId = booking.user ? booking.user.toString() : "";
      if (
        bookingUserId !== req.user._id.toString() &&
        booking.guestEmail !== req.user.email &&
        req.user.role === "guest"
      ) {
        return res.status(403).json({ message: "Not authorized to process refund for this reservation." });
      }

      if (booking.status !== "Cancelled") {
        return res.status(400).json({
          code: "BOOKING_NOT_CANCELLED",
          message: "Cannot process refund for an active reservation. Cancel the booking first."
        });
      }

      if (booking.refundStatus === "Completed" || booking.paymentStatus === "Refunded") {
        return res.status(409).json({
          code: "DUPLICATE_REFUND_REQUEST",
          message: "Refund has already been completed and settled for this reservation."
        });
      }

      if (booking.refundStatus === "Not_Applicable" || booking.paymentStatus === "Pending") {
        return res.status(400).json({
          code: "NO_REFUNDABLE_PAYMENT",
          message: "No payment was captured for this reservation; refund cannot be processed."
        });
      }

      if (!Array.isArray(booking.refundAuditLog)) {
        booking.refundAuditLog = [];
      }

      const refundResult = await processGatewayRefund({
        booking,
        amount: booking.refundAmount,
        reason: booking.cancellationReason,
        isProduction: process.env.NODE_ENV === "production",
        simulateFailure
      });

      if (refundResult.status === "Completed") {
        booking.refundStatus = "Completed";
        booking.paymentStatus = "Refunded";
        booking.refundTransactionId = refundResult.refundTransactionId;
        booking.refundProcessedAt = new Date().toISOString();

        booking.refundAuditLog.push({
          action: "REFUND_COMPLETED",
          status: "Completed",
          amount: booking.refundAmount,
          transactionId: refundResult.refundTransactionId,
          message: refundResult.message,
          timestamp: new Date().toISOString(),
          performedBy: req.user.email || req.user._id
        });

        return res.json({
          booking,
          message: refundResult.message
        });
      } else if (refundResult.status === "Failed") {
        booking.refundStatus = "Failed";
        booking.paymentStatus = "Paid";

        booking.refundAuditLog.push({
          action: "REFUND_FAILED",
          status: "Failed",
          amount: booking.refundAmount,
          message: refundResult.message,
          timestamp: new Date().toISOString(),
          performedBy: req.user.email || req.user._id
        });

        return res.status(400).json({
          code: "REFUND_FAILED",
          booking,
          message: refundResult.message
        });
      } else if (refundResult.status === "Unavailable") {
        booking.refundStatus = "Unavailable";

        booking.refundAuditLog.push({
          action: "REFUND_UNAVAILABLE",
          status: "Unavailable",
          amount: booking.refundAmount,
          message: refundResult.message,
          timestamp: new Date().toISOString(),
          performedBy: req.user.email || req.user._id
        });

        return res.status(503).json({
          code: "PAYMENT_GATEWAY_NOT_CONFIGURED",
          booking,
          message: refundResult.message
        });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    const bookingUserId = booking.user ? booking.user.toString() : "";
    if (
      bookingUserId !== req.user._id.toString() &&
      req.user.role === "guest"
    ) {
      return res.status(403).json({ message: "Not authorized to process refund for this reservation." });
    }

    if (booking.status !== "Cancelled") {
      return res.status(400).json({
        code: "BOOKING_NOT_CANCELLED",
        message: "Cannot process refund for an active reservation. Cancel the booking first."
      });
    }

    if (booking.refundStatus === "Completed" || booking.paymentStatus === "Refunded") {
      return res.status(409).json({
        code: "DUPLICATE_REFUND_REQUEST",
        message: "Refund has already been completed and settled for this reservation."
      });
    }

    if (booking.refundStatus === "Not_Applicable" || booking.paymentStatus === "Pending") {
      return res.status(400).json({
        code: "NO_REFUNDABLE_PAYMENT",
        message: "No payment was captured for this reservation; refund cannot be processed."
      });
    }

    const refundResult = await processGatewayRefund({
      booking,
      amount: booking.refundAmount,
      reason: booking.cancellationReason,
      isProduction: process.env.NODE_ENV === "production",
      simulateFailure
    });

    if (refundResult.status === "Completed") {
      booking.refundStatus = "Completed";
      booking.paymentStatus = "Refunded";
      booking.refundTransactionId = refundResult.refundTransactionId;
      booking.refundProcessedAt = new Date();

      booking.refundAuditLog.push({
        action: "REFUND_COMPLETED",
        status: "Completed",
        amount: booking.refundAmount,
        transactionId: refundResult.refundTransactionId,
        message: refundResult.message,
        timestamp: new Date(),
        performedBy: req.user.email || req.user._id.toString()
      });

      await booking.save();
      return res.json({ booking, message: refundResult.message });
    } else if (refundResult.status === "Failed") {
      booking.refundStatus = "Failed";
      booking.paymentStatus = "Paid";

      booking.refundAuditLog.push({
        action: "REFUND_FAILED",
        status: "Failed",
        amount: booking.refundAmount,
        message: refundResult.message,
        timestamp: new Date(),
        performedBy: req.user.email || req.user._id.toString()
      });

      await booking.save();
      return res.status(400).json({
        code: "REFUND_FAILED",
        booking,
        message: refundResult.message
      });
    } else if (refundResult.status === "Unavailable") {
      booking.refundStatus = "Unavailable";

      booking.refundAuditLog.push({
        action: "REFUND_UNAVAILABLE",
        status: "Unavailable",
        amount: booking.refundAmount,
        message: refundResult.message,
        timestamp: new Date(),
        performedBy: req.user.email || req.user._id.toString()
      });

      await booking.save();
      return res.status(503).json({
        code: "PAYMENT_GATEWAY_NOT_CONFIGURED",
        booking,
        message: refundResult.message
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get refund details and audit trail for a booking
// @route   GET /api/bookings/:id/refund
exports.getBookingRefundDetails = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const store = req.app.locals.inMemoryStore;
    let booking;

    if (store) {
      booking = store.bookings.find((b) => b._id.toString() === bookingId.toString());
    } else {
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(404).json({ message: "Reservation not found." });
      }
      booking = await Booking.findById(bookingId);
    }

    if (!booking) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    const bookingUserId = booking.user ? booking.user.toString() : "";
    if (
      bookingUserId !== req.user._id.toString() &&
      booking.guestEmail !== req.user.email &&
      req.user.role === "guest"
    ) {
      return res.status(403).json({ message: "Not authorized to view refund details for this reservation." });
    }

    res.json({
      bookingId: booking._id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      refundStatus: booking.refundStatus || "None",
      refundAmount: booking.refundAmount || 0,
      refundTransactionId: booking.refundTransactionId || "",
      refundRequestedAt: booking.refundRequestedAt || null,
      refundProcessedAt: booking.refundProcessedAt || null,
      refundAuditLog: booking.refundAuditLog || []
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking status (Staff & Admin only, strictly enforcing valid state machine transitions)
// @route   PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Please specify target status." });
    }

    const store = req.app.locals.inMemoryStore;

    if (store) {
      const booking = store.bookings.find((b) => b._id.toString() === req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      const allowedTransitions = VALID_TRANSITIONS[booking.status] || [];
      if (!allowedTransitions.includes(status)) {
        return res.status(400).json({
          message: `Invalid status transition from '${booking.status}' to '${status}'. Permitted: [${allowedTransitions.join(", ")}]`
        });
      }

      booking.status = status;
      if (status === "Cancelled") {
        booking.cancelledAt = new Date().toISOString();
        if (booking.paymentStatus === "Paid") {
          booking.paymentStatus = "Refund Pending";
          booking.refundStatus = "Pending";
          booking.refundAmount = booking.totalPrice;
          booking.refundRequestedAt = new Date().toISOString();
        } else {
          booking.refundStatus = "Not_Applicable";
        }
      }

      return res.json({ booking, message: `Reservation status updated to ${status}.` });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const allowedTransitions = VALID_TRANSITIONS[booking.status] || [];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from '${booking.status}' to '${status}'. Permitted: [${allowedTransitions.join(", ")}]`
      });
    }

    booking.status = status;
    if (status === "Cancelled") {
      booking.cancelledAt = new Date();
      if (booking.paymentStatus === "Paid") {
        booking.paymentStatus = "Refund Pending";
        booking.refundStatus = "Pending";
        booking.refundAmount = booking.totalPrice;
        booking.refundRequestedAt = new Date();
      } else {
        booking.refundStatus = "Not_Applicable";
      }
    }
    await booking.save();

    res.json({ booking, message: `Reservation status updated to ${status}.` });
  } catch (err) {
    next(err);
  }
};
