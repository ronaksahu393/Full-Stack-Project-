import React, { useState, useEffect, useId } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Divider,
  Grid,
  IconButton,
  CircularProgress,
  Chip,
  InputAdornment,
  Autocomplete
} from "@mui/material";
import {
  X as CloseIcon,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  User,
  Sparkles,
  Info,
  Clock,
  Building
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotify } from "../../context/NotificationContext";
import { api, loadRazorpayScript } from "../../services/api";
import { COUNTRIES, DEFAULT_COUNTRY } from "../../utils/countries.js";
import { validateAndFormatPhone, parseInitialPhone } from "../../utils/phoneValidation.js";
import { calculateBookingPrice, formatINR, formatCurrency } from "../../utils/pricing.js";

export default function BookingModal({
  room,
  isOpen,
  onClose,
  initialDates = {},
  initialCheckIn,
  initialCheckOut,
  initialGuests
}) {
  const { user } = useAuth();
  const { notify } = useNotify();
  const navigate = useNavigate();

  // Determine initial dates and occupancy values with backward compatibility
  const effectiveCheckIn = initialDates.checkIn || initialCheckIn || "";
  const effectiveCheckOut = initialDates.checkOut || initialCheckOut || "";
  const effectiveGuests = Number(initialDates.guests || initialGuests || 2);

  // Form State
  const [checkIn, setCheckIn] = useState(effectiveCheckIn);
  const [checkOut, setCheckOut] = useState(effectiveCheckOut);
  const [adults, setAdults] = useState(
    room?.capacity?.guests ? Math.min(effectiveGuests, room.capacity.guests) : 2
  );
  const [children, setChildren] = useState(0);

  // Lead guest state
  const [guestName, setGuestName] = useState(user?.name || "");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");

  // International phone handling with searchable country selection and metadata validation
  const initialPhoneState = parseInitialPhone(user?.phone);
  const [selectedCountry, setSelectedCountry] = useState(initialPhoneState.country || DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneState.nationalNumber || "");

  const [specialRequests, setSpecialRequests] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [gatewayStatus, setGatewayStatus] = useState(null);

  useEffect(() => {
    api.getPaymentGatewayTelemetry().then(setGatewayStatus).catch(() => {});
  }, []);

  // Accessible IDs
  const titleId = useId();
  const checkInId = useId();
  const checkOutId = useId();
  const adultsId = useId();
  const childrenId = useId();
  const nameId = useId();
  const emailId = useId();
  const countryId = useId();
  const phoneId = useId();
  const requestsId = useId();

  // Synchronize incoming props if changed
  useEffect(() => {
    if (effectiveCheckIn && !checkIn) setCheckIn(effectiveCheckIn);
    if (effectiveCheckOut && !checkOut) setCheckOut(effectiveCheckOut);
  }, [effectiveCheckIn, effectiveCheckOut]);

  // Compute stay nights
  let nights = 0;
  if (checkIn && checkOut) {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = d2.getTime() - d1.getTime();
    if (diff > 0) {
      nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
  }

  // Capacity & unified pricing computations
  const totalGuests = Number(adults) + Number(children);
  const maxCapacity = room?.capacity?.guests || 2;
  const isOverCapacity = totalGuests > maxCapacity;

  const pricing = calculateBookingPrice(room, nights);

  const formatPrice = (amt) => {
    return pricing.isINR ? formatINR(amt) : formatCurrency(amt, pricing.currency);
  };

  // Comprehensive international validation
  const validateForm = () => {
    const errors = {};
    const today = new Date().toISOString().split("T")[0];

    if (!checkIn) {
      errors.checkIn = "Please select an arrival date.";
    } else if (checkIn < today) {
      errors.checkIn = "Arrival date cannot be in the past.";
    }

    if (!checkOut) {
      errors.checkOut = "Please select a departure date.";
    } else if (checkIn && checkOut <= checkIn) {
      errors.checkOut = "Departure must be at least 1 night after arrival.";
    }

    if (!guestName.trim()) {
      errors.guestName = "Full name of the lead guest is required.";
    }

    if (!guestEmail.trim()) {
      errors.guestEmail = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      errors.guestEmail = "Please enter a valid email address.";
    }

    // Validate phone number according to the selected country's numbering rules via libphonenumber-js
    const phoneCheck = validateAndFormatPhone(phoneNumber, selectedCountry);
    if (!phoneCheck.isValid) {
      errors.phoneNumber = phoneCheck.error;
    }

    if (isOverCapacity) {
      errors.capacity = `Maximum occupancy for this suite is ${maxCapacity} guests.`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const launchRazorpayCheckout = async (booking, contactInfo) => {
    try {
      setSubmitting(true);
      const orderRes = await api.createRazorpayOrder(booking._id);
      const isLoaded = await loadRazorpayScript();

      if (isLoaded && typeof window !== "undefined" && window.Razorpay) {
        const rzpOptions = {
          key: orderRes.order?.keyId || "rzp_test_placeholder",
          amount: orderRes.order?.amount,
          currency: orderRes.order?.currency || "INR",
          name: "HotelPro Luxury Hospitality",
          description: `Reservation for ${booking.roomName}`,
          order_id: orderRes.order?.orderId,
          handler: async function (response) {
            try {
              setSubmitting(true);
              const verifyRes = await api.verifyPayment(booking._id, {
                paymentMethod: "Razorpay",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: booking.totalPrice,
                currency: booking.currency || "INR"
              });
              setConfirmedBooking(verifyRes.booking || booking);
              notify("Payment verified and settled via Razorpay! Reservation confirmed.", "success");
            } catch (verifyErr) {
              notify(verifyErr.message || "Payment signature verification failed.", "error");
              setConfirmedBooking({
                ...booking,
                paymentStatus: "Failed",
                paymentError: verifyErr.message
              });
            } finally {
              setSubmitting(false);
            }
          },
          prefill: {
            name: contactInfo.name,
            email: contactInfo.email,
            contact: contactInfo.phone
          },
          theme: {
            color: "#173F35"
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
              setConfirmedBooking({
                ...booking,
                paymentStatus: "Pending",
                paymentError: "Payment checkout window was closed. Your reservation is held under Pending Payment."
              });
              notify("Payment window closed. Your reservation is held under Pending Payment.", "warning");
            }
          }
        };

        const rzp = new window.Razorpay(rzpOptions);
        rzp.on("payment.failed", function (response) {
          setSubmitting(false);
          notify(`Payment failed: ${response.error?.description || "Transaction declined"}`, "error");
          setConfirmedBooking({
            ...booking,
            paymentStatus: "Failed",
            paymentError: response.error?.description || "Transaction declined"
          });
        });
        rzp.open();
      } else {
        // Fallback development simulation
        const verified = await api.verifyPayment(booking._id, {
          paymentMethod: "Demo_Simulated",
          simulatedToken: `sim_${Date.now()}`
        });
        setConfirmedBooking(verified.booking || booking);
        notify("Development payment simulation settled.", "success");
        setSubmitting(false);
      }
    } catch (err) {
      setSubmitting(false);
      setConfirmedBooking({
        ...booking,
        paymentStatus: "Pending",
        paymentError: err.message
      });
      notify(err.message || "Failed to initialize payment gateway.", "error");
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!validateForm()) {
      notify("Please review and complete the required reservation details.", "error");
      return;
    }

    // Format normalized international phone number
    const phoneCheck = validateAndFormatPhone(phoneNumber, selectedCountry);
    const normalizedPhone = phoneCheck.isValid ? phoneCheck.formatted : `${selectedCountry.dialCode} ${phoneNumber.trim()}`;

    try {
      setSubmitting(true);
      const bookingData = {
        roomId: room._id,
        roomName: room.name,
        checkIn,
        checkOut,
        nights: pricing.nights,
        guests: { adults: Number(adults), children: Number(children) },
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: normalizedPhone,
        specialRequests: specialRequests.trim(),
        totalPrice: pricing.totalPrice
      };

      // 1. Create reservation on the server (holding inventory under Pending Payment)
      const createdBooking = await api.createBooking(bookingData, { skipVerify: true });

      // If stay is complimentary, no gateway payment needed
      if (createdBooking.totalPrice === 0 || createdBooking.status === "Confirmed") {
        setConfirmedBooking(createdBooking);
        notify("Reservation confirmed. Complimentary voucher active.", "success");
        setSubmitting(false);
        return;
      }

      // 2. Launch Razorpay payment checkout
      await launchRazorpayCheckout(createdBooking, {
        name: guestName.trim(),
        email: guestEmail.trim(),
        phone: normalizedPhone
      });
    } catch (err) {
      notify(err.message || "Failed to finalize reservation. Please try again.", "error");
      setSubmitting(false);
    }
  };

  if (!room) return null;

  return (
    <Dialog
      open={isOpen !== undefined ? isOpen : true}
      onClose={submitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      aria-labelledby={titleId}
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 28px 70px rgba(23, 63, 53, 0.22)",
          maxHeight: { xs: "96vh", sm: "90vh" },
          display: "flex",
          flexDirection: "column",
          m: { xs: 1.5, sm: 3 }
        }
      }}
    >
      {/* ============================================================ */}
      {/* 1. STICKY HEADER                                             */}
      {/* ============================================================ */}
      <DialogTitle
        component="header"
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexShrink: 0
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
          {/* Room Thumbnail */}
          <Box
            component="img"
            src={room.heroImage || room.image}
            alt={room.name}
            sx={{
              width: { xs: 52, sm: 64 },
              height: { xs: 52, sm: 64 },
              objectFit: "cover",
              flexShrink: 0,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "grey.100"
            }}
          />

          {/* Room Title, Location & Metadata */}
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.25 }}>
              <Typography
                variant="overline"
                sx={{
                  color: "secondary.main",
                  fontWeight: 700,
                  fontSize: "0.6875rem",
                  letterSpacing: "0.14em",
                  lineHeight: 1
                }}
              >
                {room.category || "Luxury Suite"}
              </Typography>
              {room.location && (
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6875rem" }}>
                  &bull; {room.location}
                </Typography>
              )}
            </Box>

            <Typography
              id={titleId}
              variant="h6"
              sx={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 600,
                color: "primary.main",
                fontSize: { xs: "1.1rem", sm: "1.3rem" },
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {room.name}
            </Typography>

            {/* Pricing & Occupancy Badges */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5, flexWrap: "wrap" }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main", fontSize: "0.8125rem" }}>
                {formatPrice(pricePerNight)}
                <Typography component="span" variant="caption" sx={{ color: "text.secondary", fontWeight: 400, ml: 0.5 }}>
                  / night
                </Typography>
              </Typography>
              <Chip
                label={`Max ${maxCapacity} Guests`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  backgroundColor: "background.default",
                  color: "text.primary",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 0
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Accessible Close Button */}
        <IconButton
          onClick={onClose}
          aria-label="Close reservation modal"
          disabled={submitting}
          sx={{
            color: "text.secondary",
            border: "1px solid transparent",
            transition: "all 0.2s ease",
            p: 1,
            "&:hover": {
              color: "primary.main",
              backgroundColor: "background.default",
              borderColor: "divider"
            }
          }}
        >
          <CloseIcon size={20} />
        </IconButton>
      </DialogTitle>

      {/* ============================================================ */}
      {/* 2. SCROLLABLE DIALOG CONTENT                                 */}
      {/* ============================================================ */}
      <DialogContent
        dividers
        sx={{
          p: { xs: 2.5, sm: 3.5, md: 4 },
          backgroundColor: "#FFFFFF",
          overflowY: "auto"
        }}
      >
        {confirmedBooking ? (
          /* ============================================================ */
          /* SUCCESS OR PENDING STATE: CONCIERGE VOUCHER                  */
          /* ============================================================ */
          (() => {
            const isBookingPaid = confirmedBooking.paymentStatus === "Paid";
            return (
              <Box sx={{ textAlign: "center", py: { xs: 2, sm: 3 } }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: isBookingPaid ? "primary.main" : "#B45309",
                    color: "secondary.main",
                    border: "1px solid",
                    borderColor: isBookingPaid ? "secondary.main" : "#F59E0B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2.5,
                    boxShadow: isBookingPaid ? "0 8px 24px rgba(23, 63, 53, 0.2)" : "0 8px 24px rgba(180, 83, 9, 0.2)"
                  }}
                >
                  {isBookingPaid ? <CheckCircle2 size={36} /> : <Clock size={36} color="#FFFFFF" />}
                </Box>

                <Typography
                  variant="overline"
                  sx={{ color: isBookingPaid ? "secondary.main" : "#B45309", fontWeight: 700, letterSpacing: "0.18em", fontSize: "0.75rem", display: "block" }}
                >
                  {isBookingPaid ? "Reservation Confirmed &bull; HotelPro Atelier" : "Reservation Held &bull; Payment Pending"}
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    color: "primary.main",
                    fontSize: { xs: "1.75rem", sm: "2.25rem" },
                    fontWeight: 500,
                    mt: 0.5,
                    mb: 1.5
                  }}
                >
                  Welcome, {guestName.split(" ")[0]}
                </Typography>

                <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 480, mx: "auto", mb: 4, lineHeight: 1.6 }}>
                  {isBookingPaid ? (
                    <>
                      Your suite reservation for <strong style={{ color: "#173F35" }}>{room.name}</strong> is confirmed and payment verified.
                      An official voucher and stay itinerary have been assigned to your guest account portfolio.
                    </>
                  ) : (
                    <>
                      Your suite reservation for <strong style={{ color: "#173F35" }}>{room.name}</strong> has been created.
                      However, payment verification is pending settlement.
                    </>
                  )}
                </Typography>

                {/* Official Voucher Card */}
                <Box
                  sx={{
                    bgcolor: "background.default",
                    border: "1px solid",
                    borderColor: "divider",
                    p: { xs: 2.5, sm: 3.5 },
                    maxWidth: 480,
                    mx: "auto",
                    textAlign: "left",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)"
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Box>
                      <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 700, fontSize: "0.625rem", display: "block" }}>
                        Voucher Reference
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700, color: "primary.main", fontSize: "0.9375rem" }}>
                        HP-{confirmedBooking._id.slice(-8).toUpperCase()}
                      </Typography>
                    </Box>
                    <Chip
                      label={isBookingPaid ? "Confirmed & Paid" : "Payment Pending"}
                      size="small"
                      sx={{
                        bgcolor: isBookingPaid ? "success.light" : "warning.light",
                        color: isBookingPaid ? "success.main" : "warning.dark",
                        fontWeight: 700,
                        fontSize: "0.6875rem",
                        borderRadius: 0,
                        border: "1px solid",
                        borderColor: isBookingPaid ? "success.main" : "warning.main"
                      }}
                    />
                  </Box>

                  <Box sx={{ py: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontSize: "0.6875rem", display: "block" }}>
                        Arrival
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {checkIn}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontSize: "0.6875rem", display: "block" }}>
                        Departure
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {checkOut} ({nights} night{nights > 1 ? "s" : ""})
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontSize: "0.6875rem", display: "block" }}>
                        Lead Guest
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {guestName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontSize: "0.6875rem", display: "block" }}>
                        Party Size
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {adults} Adult{adults > 1 ? "s" : ""}{children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ pt: 2, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <Typography variant="body2" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: "primary.main" }}>
                      Total Settlement Amount
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "primary.main" }}>
                      {formatPrice(confirmedBooking?.totalPrice || pricing.totalPrice)}
                    </Typography>
                  </Box>

                  {!isBookingPaid && (
                    <Alert
                      severity="warning"
                      sx={{
                        mt: 2,
                        borderRadius: 0,
                        fontSize: "0.75rem",
                        "& .MuiAlert-icon": { color: "#B45309" }
                      }}
                    >
                      {confirmedBooking.paymentError
                        ? `Notice: Online payment verification was incomplete (${confirmedBooking.paymentError}). Your reservation is held, and payment can be settled upon arrival or via your guest dashboard.`
                        : "Notice: Payment verification is currently pending settlement. Please settle with the concierge desk upon arrival or via your guest dashboard."}
                    </Alert>
                  )}
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center", mt: 4 }}>
                  {!isBookingPaid && (
                    <Button
                      variant="contained"
                      disabled={submitting}
                      onClick={() => {
                        const phoneCheck = validateAndFormatPhone(phoneNumber, selectedCountry);
                        const normalizedPhone = phoneCheck.isValid ? phoneCheck.formatted : `${selectedCountry.dialCode} ${phoneNumber.trim()}`;
                        launchRazorpayCheckout(confirmedBooking, {
                          name: guestName.trim(),
                          email: guestEmail.trim(),
                          phone: normalizedPhone
                        });
                      }}
                      sx={{
                        px: 3.5,
                        py: 1.25,
                        bgcolor: "secondary.main",
                        color: "primary.main",
                        fontWeight: 700,
                        "&:hover": { bgcolor: "#b3935b" }
                      }}
                    >
                      {submitting ? "Opening Razorpay..." : "Complete Payment via Razorpay"}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      onClose();
                      navigate("/dashboard");
                    }}
                    sx={{ px: 3.5, py: 1.25 }}
                  >
                    View in Guest Portfolio
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{ px: 3.5, py: 1.25, borderColor: "divider", color: "text.primary" }}
                  >
                    Close Voucher
                  </Button>
                </Box>
              </Box>
            );
          })()
        ) : (
          /* ============================================================ */
          /* INTERACTIVE RESERVATION FORM                                 */
          /* ============================================================ */
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
            {/* ---------------------------------------------------------- */}
            {/* SECTION A: STAY SCHEDULE & OCCUPANCY                       */}
            {/* ---------------------------------------------------------- */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.75 }}>
                <Calendar size={16} color="#C4A46B" />
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    fontSize: "0.75rem"
                  }}
                >
                  1. Stay Schedule &amp; Party Size
                </Typography>
                {nights > 0 && (
                  <Chip
                    label={`${nights} Night${nights > 1 ? "s" : ""} Stay`}
                    size="small"
                    sx={{
                      ml: "auto",
                      height: 20,
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      bgcolor: "secondary.main",
                      color: "primary.main",
                      borderRadius: 0
                    }}
                  />
                )}
              </Box>

              <Grid container spacing={2}>
                {/* Arrival Date */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography
                      component="label"
                      htmlFor={checkInId}
                      variant="caption"
                      sx={{
                        display: "block",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        color: fieldErrors.checkIn ? "error.main" : "text.secondary",
                        mb: 0.75,
                        fontSize: "0.6875rem"
                      }}
                    >
                      Arrival Date *
                    </Typography>
                    <TextField
                      id={checkInId}
                      fullWidth
                      size="small"
                      type="date"
                      required
                      value={checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        if (fieldErrors.checkIn) {
                          setFieldErrors((prev) => ({ ...prev, checkIn: null }));
                        }
                      }}
                      error={Boolean(fieldErrors.checkIn)}
                      helperText={fieldErrors.checkIn}
                      InputProps={{
                        sx: { bgcolor: "background.default", fontSize: "0.8125rem", height: 42 }
                      }}
                    />
                  </Box>
                </Grid>

                {/* Departure Date */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography
                      component="label"
                      htmlFor={checkOutId}
                      variant="caption"
                      sx={{
                        display: "block",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        color: fieldErrors.checkOut ? "error.main" : "text.secondary",
                        mb: 0.75,
                        fontSize: "0.6875rem"
                      }}
                    >
                      Departure Date *
                    </Typography>
                    <TextField
                      id={checkOutId}
                      fullWidth
                      size="small"
                      type="date"
                      required
                      value={checkOut}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        setCheckOut(e.target.value);
                        if (fieldErrors.checkOut) {
                          setFieldErrors((prev) => ({ ...prev, checkOut: null }));
                        }
                      }}
                      error={Boolean(fieldErrors.checkOut)}
                      helperText={fieldErrors.checkOut}
                      InputProps={{
                        sx: { bgcolor: "background.default", fontSize: "0.8125rem", height: 42 }
                      }}
                    />
                  </Box>
                </Grid>

                {/* Adults */}
                <Grid item xs={6} sm={6} md={3}>
                  <Box>
                    <Typography
                      component="label"
                      htmlFor={adultsId}
                      variant="caption"
                      sx={{
                        display: "block",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        color: "text.secondary",
                        mb: 0.75,
                        fontSize: "0.6875rem"
                      }}
                    >
                      Adults *
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        id={adultsId}
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        sx={{ bgcolor: "background.default", fontSize: "0.8125rem", height: 42 }}
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <MenuItem key={n} value={n}>
                            {n} Adult{n > 1 ? "s" : ""}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                {/* Children */}
                <Grid item xs={6} sm={6} md={3}>
                  <Box>
                    <Typography
                      component="label"
                      htmlFor={childrenId}
                      variant="caption"
                      sx={{
                        display: "block",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        color: "text.secondary",
                        mb: 0.75,
                        fontSize: "0.6875rem"
                      }}
                    >
                      Children
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        id={childrenId}
                        value={children}
                        onChange={(e) => setChildren(Number(e.target.value))}
                        sx={{ bgcolor: "background.default", fontSize: "0.8125rem", height: 42 }}
                      >
                        {[0, 1, 2, 3, 4].map((n) => (
                          <MenuItem key={n} value={n}>
                            {n} {n === 1 ? "Child" : "Children"}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>

              {/* Over-capacity alert */}
              {isOverCapacity && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 0, fontSize: "0.75rem" }}>
                  Selected party size ({totalGuests} guests) exceeds the suite's permitted maximum of{" "}
                  <strong>{maxCapacity} guests</strong>. Please reduce occupant count or contact the concierge for adjoining suites.
                </Alert>
              )}
            </Box>

            <Divider sx={{ borderColor: "divider" }} />

            {/* ---------------------------------------------------------- */}
            {/* SECTION B: LEAD GUEST & SEARCHABLE INTERNATIONAL CONTACT   */}
            {/* ---------------------------------------------------------- */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.75 }}>
                <User size={16} color="#C4A46B" />
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    fontSize: "0.75rem"
                  }}
                >
                  2. Lead Guest &amp; International Contact
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {/* Full Name */}
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      component="label"
                      htmlFor={nameId}
                      variant="caption"
                      sx={{
                        display: "block",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        color: fieldErrors.guestName ? "error.main" : "text.secondary",
                        mb: 0.75,
                        fontSize: "0.6875rem"
                      }}
                    >
                      Full Name *
                    </Typography>
                    <TextField
                      id={nameId}
                      fullWidth
                      size="small"
                      required
                      placeholder="Eleanor Vance"
                      value={guestName}
                      onChange={(e) => {
                        setGuestName(e.target.value);
                        if (fieldErrors.guestName) {
                          setFieldErrors((prev) => ({ ...prev, guestName: null }));
                        }
                      }}
                      error={Boolean(fieldErrors.guestName)}
                      helperText={fieldErrors.guestName}
                      InputProps={{
                        sx: { bgcolor: "background.default", fontSize: "0.8125rem", height: 42 }
                      }}
                    />
                  </Box>
                </Grid>

                {/* Email Address */}
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      component="label"
                      htmlFor={emailId}
                      variant="caption"
                      sx={{
                        display: "block",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        color: fieldErrors.guestEmail ? "error.main" : "text.secondary",
                        mb: 0.75,
                        fontSize: "0.6875rem"
                      }}
                    >
                      Email Address *
                    </Typography>
                    <TextField
                      id={emailId}
                      fullWidth
                      size="small"
                      type="email"
                      required
                      placeholder="eleanor@atelier-hospitality.com"
                      value={guestEmail}
                      onChange={(e) => {
                        setGuestEmail(e.target.value);
                        if (fieldErrors.guestEmail) {
                          setFieldErrors((prev) => ({ ...prev, guestEmail: null }));
                        }
                      }}
                      error={Boolean(fieldErrors.guestEmail)}
                      helperText={fieldErrors.guestEmail}
                      InputProps={{
                        sx: { bgcolor: "background.default", fontSize: "0.8125rem", height: 42 }
                      }}
                    />
                  </Box>
                </Grid>

                {/* Searchable International Calling Code & Phone Number Input */}
                <Grid item xs={12}>
                  <Box>
                    <Typography
                      component="label"
                      htmlFor={phoneId}
                      variant="caption"
                      sx={{
                        display: "block",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        color: fieldErrors.phoneNumber ? "error.main" : "text.secondary",
                        mb: 0.75,
                        fontSize: "0.6875rem"
                      }}
                    >
                      Contact Phone (International Calling Code &amp; National Number) *
                    </Typography>

                    <Grid container spacing={1.5}>
                      {/* Searchable Country Selector */}
                      <Grid item xs={12} sm={5} md={4.5}>
                        <Autocomplete
                          id={countryId}
                          size="small"
                          options={COUNTRIES}
                          autoHighlight
                          disableClearable
                          value={selectedCountry}
                          onChange={(_, newCountry) => {
                            if (newCountry) {
                              setSelectedCountry(newCountry);
                              if (fieldErrors.phoneNumber) {
                                setFieldErrors((prev) => ({ ...prev, phoneNumber: null }));
                              }
                            }
                          }}
                          isOptionEqualToValue={(option, val) => option.iso2 === val.iso2}
                          getOptionLabel={(option) => `${option.flag} ${option.name} (${option.dialCode})`}
                          filterOptions={(options, state) => {
                            const query = state.inputValue.toLowerCase().trim();
                            return options.filter(
                              (opt) =>
                                opt.name.toLowerCase().includes(query) ||
                                opt.dialCode.includes(query) ||
                                opt.iso2.toLowerCase().includes(query)
                            );
                          }}
                          renderOption={(props, option) => (
                            <Box
                              component="li"
                              {...props}
                              key={option.iso2}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.25,
                                py: 1,
                                fontSize: "0.8125rem"
                              }}
                            >
                              <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{option.flag}</span>
                              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.8125rem" }}>
                                {option.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "secondary.main",
                                  ml: "auto",
                                  fontFamily: "monospace",
                                  fontWeight: 700
                                }}
                              >
                                {option.dialCode}
                              </Typography>
                            </Box>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Search country..."
                              inputProps={{
                                ...params.inputProps,
                                "aria-label": "Select Country Dialing Code"
                              }}
                              sx={{
                                bgcolor: "background.default",
                                "& .MuiOutlinedInput-root": { height: 42, fontSize: "0.8125rem" }
                              }}
                            />
                          )}
                        />
                      </Grid>

                      {/* Separate National Phone Number Input */}
                      <Grid item xs={12} sm={7} md={7.5}>
                        <TextField
                          id={phoneId}
                          fullWidth
                          size="small"
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            if (fieldErrors.phoneNumber) {
                              setFieldErrors((prev) => ({ ...prev, phoneNumber: null }));
                            }
                          }}
                          placeholder={selectedCountry.placeholder || "98765 43210"}
                          error={Boolean(fieldErrors.phoneNumber)}
                          helperText={
                            fieldErrors.phoneNumber ||
                            `National number format for ${selectedCountry.name} (${selectedCountry.flag})`
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <span style={{ fontSize: "1rem" }}>{selectedCountry.flag}</span>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "primary.main",
                                      fontWeight: 700,
                                      fontSize: "0.8125rem",
                                      fontFamily: "monospace"
                                    }}
                                  >
                                    {selectedCountry.dialCode}
                                  </Typography>
                                </Box>
                              </InputAdornment>
                            ),
                            sx: { bgcolor: "background.default", fontSize: "0.8125rem", height: 42 }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                {/* Special Requests */}
                <Grid item xs={12}>
                  <Box>
                    <Typography
                      component="label"
                      htmlFor={requestsId}
                      variant="caption"
                      sx={{
                        display: "block",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        color: "text.secondary",
                        mb: 0.75,
                        fontSize: "0.6875rem"
                      }}
                    >
                      Special Requests (Optional)
                    </Typography>
                    <TextField
                      id={requestsId}
                      fullWidth
                      size="small"
                      placeholder="High floor, feather-free pillows, late arrival, quiet courtyard view..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      InputProps={{
                        sx: { bgcolor: "background.default", fontSize: "0.8125rem", height: 42 }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderColor: "divider" }} />

            {/* ---------------------------------------------------------- */}
            {/* SECTION C: PRICE SUMMARY & INCLUDED AMENITIES              */}
            {/* ---------------------------------------------------------- */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.75 }}>
                <Sparkles size={16} color="#C4A46B" />
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    fontSize: "0.75rem"
                  }}
                >
                  3. Price Calculation &amp; Atelier Inclusions
                </Typography>
              </Box>

              <Box
                sx={{
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                  p: { xs: 2.5, sm: 3 }
                }}
              >
                {/* Stay subtotal */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
                    Room Subtotal ({formatPrice(pricing.pricePerNight)} &times; {pricing.nights} night{pricing.nights > 1 ? "s" : ""})
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.8125rem" }}>
                    {formatPrice(pricing.basePrice)}
                  </Typography>
                </Box>

                {/* Taxes & GST */}
                {pricing.isINR ? (
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
                        Goods &amp; Services Tax (GST {pricing.gstPercent}%)
                      </Typography>
                      <Typography variant="caption" sx={{ color: "secondary.main", fontSize: "0.625rem", fontWeight: 600 }}>
                        {pricing.gstPercent === 0
                          ? "(Tariff under ₹1,000 exempt)"
                          : pricing.gstPercent >= 18
                          ? "(Luxury tier ≥ ₹7,500/night)"
                          : "(Boutique tier ₹1,000–₹7,499/night)"}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.8125rem" }}>
                      {formatPrice(pricing.taxAmount)}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
                      Taxes &amp; Surcharges
                    </Typography>
                    <Typography variant="body2" sx={{ color: "success.main", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>
                      Included
                    </Typography>
                  </Box>
                )}

                {/* Included Services and Amenities */}
                {pricing.includedServices.map((service, idx) => (
                  <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
                      ✦ {service.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "success.main", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>
                      {pricing.isINR ? "₹0 (Included)" : "$0 (Included)"}
                    </Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 1.75, borderColor: "divider" }} />

                {/* Final Payable Amount */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontWeight: 600,
                        color: "primary.main",
                        fontSize: "1.05rem"
                      }}
                    >
                      Final Payable Amount
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6875rem" }}>
                      All inclusive &bull; Exact checkout total &bull; No surprise fees
                    </Typography>
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontWeight: 700,
                      color: "primary.main",
                      fontSize: { xs: "1.35rem", sm: "1.6rem" }
                    }}
                  >
                    {formatPrice(pricing.totalPrice)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* ============================================================ */}
      {/* 3. STICKY MODAL FOOTER                                       */}
      {/* ============================================================ */}
      {!confirmedBooking && (
        <DialogActions
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "#FFFFFF",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            flexShrink: 0
          }}
        >
          {/* Quick Summary Pill in Footer */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontSize: "0.625rem", display: "block" }}>
                Total Payable ({pricing.nights} night{pricing.nights > 1 ? "s" : ""}, incl. taxes)
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700,
                  color: "primary.main",
                  fontSize: "1.15rem",
                  lineHeight: 1.1
                }}
              >
                {formatPrice(pricing.totalPrice)}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 1.5, justifyContent: { xs: "stretch", sm: "flex-end" } }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={submitting}
              sx={{
                px: { xs: 2, sm: 3 },
                py: 1.1,
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                color: "text.primary",
                borderColor: "divider",
                "&:hover": {
                  borderColor: "text.secondary",
                  backgroundColor: "background.default"
                }
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={submitting || isOverCapacity}
              endIcon={
                submitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <ArrowRight size={16} />
                )
              }
              sx={{
                px: { xs: 3, sm: 4 },
                py: 1.1,
                fontSize: "0.8125rem",
                letterSpacing: "0.12em",
                fontWeight: 700,
                boxShadow: "0 6px 20px rgba(23, 63, 53, 0.22)",
                "&:hover": {
                  backgroundColor: "#102E28",
                  boxShadow: "0 8px 24px rgba(23, 63, 53, 0.3)"
                }
              }}
            >
              {submitting ? "Securing Reservation..." : "Confirm Reservation"}
            </Button>
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
}
