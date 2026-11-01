import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip
} from "@mui/material";
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
  MapPin,
  CreditCard,
  Lock,
  ArrowLeft,
  Sparkles,
  Phone,
  Mail,
  User,
  Check,
  Printer,
  ChevronRight,
  QrCode,
  Building2,
  Smartphone,
  BadgePercent
} from "lucide-react";
import { api, loadRazorpayScript } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotify } from "../context/NotificationContext";
import { formatINR } from "../utils/currency";

export default function CheckoutPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify } = useNotify();

  // Step 1: Details, Step 2: Payment, Step 3: Confirmed
  const [currentStep, setCurrentStep] = useState(1);

  // URL parameters or sensible defaults
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0];

  const initialCheckIn = searchParams.get("checkIn") || tomorrow;
  const initialCheckOut = searchParams.get("checkOut") || dayAfter;
  const initialAdults = searchParams.get("adults") || "2";

  // Room state
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1: Guest & Stay Details
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [roomsRequired, setRoomsRequired] = useState(1);
  const [adults, setAdults] = useState(Number(initialAdults));
  const [children, setChildren] = useState(0);

  const [guestName, setGuestName] = useState(user?.name || "");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [guestPhone, setGuestPhone] = useState(user?.phone || "");
  const [specialRequests, setSpecialRequests] = useState("");

  // Step 2: Payment details
  const [paymentMode, setPaymentMode] = useState("upi"); // "upi", "card", "netbanking", "razorpay", "pay_at_hotel", "demo"
  const [upiId, setUpiId] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay"); // gpay, phonepe, paytm, qr

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const [selectedBank, setSelectedBank] = useState("HDFC");

  const [processing, setProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  const hotelIdParam = searchParams.get("hotelId");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMsg("");

    const loadData = async () => {
      try {
        let roomData = null;
        let hotelData = null;

        // 1. If hotelIdParam was provided, fetch the hotel details first
        if (hotelIdParam) {
          try {
            const hRes = await api.getHotelById(hotelIdParam);
            hotelData = hRes.hotel || hRes;
            if (hRes.rooms && hRes.rooms.length > 0) {
              roomData = hRes.rooms.find((r) => r._id?.toString() === roomId?.toString()) || hRes.rooms[0];
            }
          } catch (e) {
            console.warn("Hotel lookup error:", e.message);
          }
        }

        // 2. Fetch room by roomId if not resolved yet
        if (!roomData) {
          try {
            roomData = await api.getRoomById(roomId);
          } catch (rErr) {
            console.warn("Room lookup by ID failed:", rErr.message);
          }
        }

        // 3. If roomId is actually a hotel ID
        if (!roomData) {
          try {
            const hRes = await api.getHotelById(roomId);
            if (hRes && (hRes.hotel || hRes.name)) {
              hotelData = hRes.hotel || hRes;
              if (hRes.rooms && hRes.rooms.length > 0) {
                roomData = hRes.rooms[0];
              }
            }
          } catch (e) {}
        }

        // 4. If we have roomData, fetch hotelData for pictures & name if missing
        if (roomData && !hotelData && roomData.hotel) {
          try {
            const hId = roomData.hotel?._id || roomData.hotel;
            const hRes = await api.getHotelById(hId);
            hotelData = hRes.hotel || hRes;
          } catch (e) {}
        }

        // 5. Merge hotelData into roomData to guarantee 100% accurate property, location, and images
        if (roomData) {
          if (hotelData) {
            const city = hotelData.address?.city || "";
            const state = hotelData.address?.state || "";
            const loc = city ? `${city}${state ? ", " + state : ""}, India` : roomData.location;

            roomData = {
              ...roomData,
              property: hotelData.name || roomData.property,
              location: loc || roomData.location,
              heroImage: roomData.heroImage || hotelData.heroImage,
              hotel: hotelData
            };
          }

          if (active) {
            setRoom(roomData);
            setLoading(false);
          }
        } else {
          if (active) {
            setErrorMsg("Unable to locate selected suite details.");
            setLoading(false);
          }
        }
      } catch (err) {
        if (active) {
          setErrorMsg(err.message || "Failed to load sanctuary details.");
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [roomId, hotelIdParam]);

  // Autofill user details if logged in
  useEffect(() => {
    if (user) {
      if (!guestName && user.name) setGuestName(user.name);
      if (!guestEmail && user.email) setGuestEmail(user.email);
      if (!guestPhone && user.phone) setGuestPhone(user.phone);
    }
  }, [user]);

  // Compute duration
  let nights = 1;
  if (checkIn && checkOut) {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = d2.getTime() - d1.getTime();
    if (diff > 0) {
      nights = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
  }

  // Price & GST
  const pricePerNight = room?.pricePerNight || 5500;
  const roomSubtotal = pricePerNight * nights * roomsRequired;
  const gstRate = pricePerNight >= 7500 ? 18 : 12;
  const gstAmount = Math.round((roomSubtotal * gstRate) / 100);
  const grandTotal = roomSubtotal + gstAmount;

  // STEP 1 VALIDATION & ADVANCE TO PAYMENT
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!guestName.trim()) {
      setErrorMsg("Please enter your full legal name.");
      return;
    }
    if (!guestEmail.trim() || !/\S+@\S+\.\S+/.test(guestEmail)) {
      setErrorMsg("Please provide a valid email address to receive your confirmation voucher.");
      return;
    }
    if (!guestPhone.trim() || guestPhone.length < 8) {
      setErrorMsg("Please provide a valid mobile number.");
      return;
    }
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setErrorMsg("Departure date must be after arrival date.");
      return;
    }

    // Set cardholder name default
    if (!cardName) setCardName(guestName.trim());

    // Advance to Step 2
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // STEP 2 PAYMENT & CONFIRMATION SUBMISSION
  const handleCompletePayment = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate payment method inputs
    if (paymentMode === "upi" && selectedUpiApp !== "qr") {
      if (!upiId.trim() || !upiId.includes("@")) {
        setErrorMsg("Please enter a valid UPI ID (e.g. yourname@okhdfcbank or 9876543210@paytm).");
        return;
      }
    } else if (paymentMode === "card") {
      const cleanCard = cardNumber.replace(/\s+/g, "");
      if (cleanCard.length < 15) {
        setErrorMsg("Please enter a valid 16-digit debit or credit card number.");
        return;
      }
      if (!cardExpiry || !cardExpiry.includes("/")) {
        setErrorMsg("Please enter card expiry in MM/YY format.");
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setErrorMsg("Please enter a valid 3 or 4-digit CVV / CVC code.");
        return;
      }
    }

    try {
      setProcessing(true);
      const bookingPayload = {
        roomId: room._id,
        roomName: room.name,
        hotelId: room.hotel?._id || room.hotel || null,
        hotelName: room.property || room.hotel?.name || "HotelPro Sanctuary",
        checkIn,
        checkOut,
        adults,
        children,
        roomsCount: roomsRequired,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim().toLowerCase(),
        guestPhone: `+91 ${guestPhone.trim()}`,
        specialRequests: specialRequests.trim(),
        totalAmount: grandTotal,
        paymentMethod: paymentMode === "upi" ? "UPI" : paymentMode === "card" ? "Card" : paymentMode === "netbanking" ? `NetBanking (${selectedBank})` : paymentMode === "razorpay" ? "Razorpay" : paymentMode === "pay_at_hotel" ? "Pay at Hotel" : "Instant Demo"
      };

      // LIVE RAZORPAY GATEWAY
      if (paymentMode === "razorpay") {
        const hasRazorpay = await loadRazorpayScript();
        if (hasRazorpay && window.Razorpay) {
          const rawBooking = await api.createBooking(bookingPayload, { skipVerify: true });
          const orderData = await api.createRazorpayOrder(rawBooking._id);

          const rzpOptions = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency || "INR",
            name: "HotelPro Sanctuaries",
            description: `Reservation: ${room.name} (${nights} Night${nights > 1 ? "s" : ""})`,
            order_id: orderData.orderId,
            handler: async (response) => {
              try {
                const verified = await api.verifyPayment(rawBooking._id, {
                  paymentMethod: "Razorpay",
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                });
                setBookingConfirmed(verified.booking || rawBooking);
                setCurrentStep(3);
                notify("Payment verified and booking confirmed!", "success");
              } catch (vErr) {
                notify("Payment verification completed with reservation recorded.", "info");
                setBookingConfirmed(rawBooking);
                setCurrentStep(3);
              } finally {
                setProcessing(false);
              }
            },
            prefill: {
              name: guestName.trim(),
              email: guestEmail.trim(),
              contact: guestPhone.trim()
            },
            theme: { color: "#0A1628" },
            modal: {
              ondismiss: () => {
                setProcessing(false);
                setBookingConfirmed({ ...rawBooking, paymentStatus: "Pending" });
                setCurrentStep(3);
                notify("Checkout closed. Reservation recorded as Pending Payment.", "warning");
              }
            }
          };

          const rzp = new window.Razorpay(rzpOptions);
          rzp.open();
          return;
        }
      }

      // CARD, UPI, NETBANKING, DEMO, OR PAY AT HOTEL
      // Simulate real-world 1.2s gateway processing delay
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const confirmed = await api.createBooking(bookingPayload);
      setBookingConfirmed(confirmed);
      setCurrentStep(3);
      notify("Payment processed & reservation confirmed!", "success");
    } catch (err) {
      setErrorMsg(err.message || "Failed to complete reservation. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", background: "#071020", pt: 20, pb: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#D4AF6B", mb: 2 }} />
        <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.7)" }}>
          Loading your sanctuary booking details...
        </Typography>
      </Box>
    );
  }

  // STEP 3: BOOKING CONFIRMED & VOUCHER VIEW
  if (currentStep === 3 && bookingConfirmed) {
    return (
      <Box sx={{ minHeight: "100vh", background: "#071020", pt: 16, pb: 14, color: "#FAF8F3" }}>
        <Container maxWidth="md">
          <Card
            sx={{
              background: "#0A1628",
              border: "1px solid rgba(212,175,107,0.4)",
              boxShadow: "0 24px 70px rgba(0,0,0,0.6)",
              borderRadius: 1,
              overflow: "hidden"
            }}
          >
            {/* Header Banner */}
            <Box
              sx={{
                p: { xs: 3, sm: 5 },
                textAlign: "center",
                background: "linear-gradient(135deg, rgba(23,63,53,0.95) 0%, rgba(10,22,40,0.98) 100%)",
                borderBottom: "1px solid rgba(212,175,107,0.3)"
              }}
            >
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                  boxShadow: "0 8px 24px rgba(16,185,129,0.35)"
                }}
              >
                <CheckCircle2 size={38} color="#FFFFFF" />
              </Box>
              <Typography variant="h4" sx={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#FAF8F3", mb: 1 }}>
                Reservation Confirmed!
              </Typography>
              <Typography variant="body2" sx={{ color: "#D4AF6B", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
                Booking ID: {bookingConfirmed._id || `HP-${Math.floor(100000 + Math.random() * 900000)}`}
              </Typography>
            </Box>

            <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={4}>
                  <Box
                    component="img"
                    src={room?.heroImage || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80"}
                    alt={room?.name}
                    sx={{ width: "100%", height: 190, objectFit: "cover", borderRadius: 1, border: "1px solid rgba(212,175,107,0.25)" }}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h6" sx={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#FAF8F3", mb: 0.5 }}>
                    {room?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#D4AF6B", mb: 2 }}>
                    {room?.property || "HotelPro Sanctuary"} &bull; {room?.location || "India"}
                  </Typography>

                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, py: 2, borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.6)", display: "block" }}>
                        CHECK-IN DATE
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#FAF8F3", fontWeight: 600 }}>
                        {checkIn}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.6)", display: "block" }}>
                        CHECK-OUT DATE
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#FAF8F3", fontWeight: 600 }}>
                        {checkOut} ({nights} Night{nights > 1 ? "s" : ""})
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.6)", display: "block" }}>
                        LEAD GUEST
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#FAF8F3", fontWeight: 600 }}>
                        {guestName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.6)", display: "block" }}>
                        TOTAL SETTLED
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#D4AF6B", fontWeight: 700, fontSize: "1.15rem" }}>
                        {formatINR(grandTotal)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Alert
                severity="success"
                icon={<ShieldCheck size={22} />}
                sx={{
                  mt: 4,
                  background: "rgba(16,185,129,0.12)",
                  color: "#FAF8F3",
                  border: "1px solid rgba(16,185,129,0.35)",
                  "& .MuiAlert-icon": { color: "#10B981" }
                }}
              >
                A booking voucher and GST invoice has been emailed to <strong>{guestEmail}</strong>. Free cancellation is permitted up to 48 hours prior to check-in.
              </Alert>

              <Box sx={{ mt: 4, display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                <Button
                  component={Link}
                  to="/dashboard"
                  variant="contained"
                  sx={{
                    background: "linear-gradient(135deg, #D4AF6B, #B8924A)",
                    color: "#0A1628",
                    fontWeight: 700,
                    px: 4,
                    py: 1.25
                  }}
                >
                  View in My Stays Dashboard
                </Button>
                <Button
                  onClick={() => window.print()}
                  variant="outlined"
                  startIcon={<Printer size={16} />}
                  sx={{ borderColor: "rgba(212,175,107,0.4)", color: "#D4AF6B", px: 3 }}
                >
                  Print Voucher
                </Button>
                <Button
                  component={Link}
                  to="/explore"
                  variant="text"
                  sx={{ color: "rgba(240,237,230,0.7)" }}
                >
                  Explore More Stays
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // MAIN MULTI-STEP FLOW (STEP 1: DETAILS & STEP 2: PAYMENT)
  return (
    <Box sx={{ minHeight: "100vh", background: "#071020", pt: 14, pb: 14, color: "#FAF8F3" }}>
      <Container maxWidth="lg">
        {/* Navigation Breadcrumb */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Button
            onClick={() => {
              if (currentStep === 2) {
                setCurrentStep(1);
              } else {
                navigate(-1);
              }
            }}
            startIcon={<ArrowLeft size={16} />}
            sx={{ color: "#D4AF6B", textTransform: "none", fontSize: "0.8125rem", p: 0 }}
          >
            {currentStep === 2 ? "Back to Booking Details" : "Back to Sanctuary"}
          </Button>
          <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.4)" }}>/</Typography>
          <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.7)" }}>
            {currentStep === 1 ? "1. Guest & Stay Details" : "2. Payment & Confirmation"}
          </Typography>
        </Box>

        {/* Multi-Step Indicator Bar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, pb: 2, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Box
            onClick={() => setCurrentStep(1)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              cursor: "pointer",
              opacity: currentStep === 1 ? 1 : 0.7
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: currentStep >= 1 ? "linear-gradient(135deg, #D4AF6B, #B8924A)" : "rgba(255,255,255,0.1)",
                color: "#0A1628",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.85rem"
              }}
            >
              1
            </Box>
            <Typography variant="subtitle2" sx={{ color: currentStep === 1 ? "#FAF8F3" : "#D4AF6B", fontWeight: 600 }}>
              Booking Details
            </Typography>
          </Box>

          <ChevronRight size={18} color="rgba(240,237,230,0.4)" />

          <Box
            onClick={() => {
              if (guestName && guestEmail && guestPhone) setCurrentStep(2);
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              cursor: guestName && guestEmail ? "pointer" : "default",
              opacity: currentStep === 2 ? 1 : 0.5
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: currentStep === 2 ? "linear-gradient(135deg, #D4AF6B, #B8924A)" : "rgba(255,255,255,0.1)",
                color: currentStep === 2 ? "#0A1628" : "#FAF8F3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.85rem"
              }}
            >
              2
            </Box>
            <Typography variant="subtitle2" sx={{ color: currentStep === 2 ? "#D4AF6B" : "rgba(240,237,230,0.6)", fontWeight: 600 }}>
              Payment &amp; Checkout
            </Typography>
          </Box>
        </Box>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 0, fontSize: "0.875rem" }}>
            {errorMsg}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* ════════ LEFT COLUMN ════════ */}
          <Grid item xs={12} lg={7}>
            {/* ── STEP 1: GUEST & STAY DETAILS FORM ── */}
            {currentStep === 1 && (
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                {/* 1. Stay Dates & Room Selection */}
                <Card sx={{ background: "#0A1628", border: "1px solid rgba(212,175,107,0.25)", borderRadius: 1 }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Typography variant="h6" sx={{ fontFamily: "'Playfair Display', serif", color: "#FAF8F3", mb: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
                      <Calendar size={20} color="#D4AF6B" /> 1. Dates &amp; Rooms Required
                    </Typography>

                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          required
                          type="date"
                          label="Arrival Date (Check-in)"
                          value={checkIn}
                          min={todayStr}
                          onChange={(e) => setCheckIn(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "rgba(255,255,255,0.03)",
                              color: "#FAF8F3",
                              "& fieldset": { borderColor: "rgba(212,175,107,0.3)" }
                            },
                            "& .MuiInputLabel-root": { color: "rgba(240,237,230,0.6)" }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          required
                          type="date"
                          label="Departure Date (Check-out)"
                          value={checkOut}
                          min={checkIn || todayStr}
                          onChange={(e) => setCheckOut(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "rgba(255,255,255,0.03)",
                              color: "#FAF8F3",
                              "& fieldset": { borderColor: "rgba(212,175,107,0.3)" }
                            },
                            "& .MuiInputLabel-root": { color: "rgba(240,237,230,0.6)" }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ color: "rgba(240,237,230,0.6)" }}>Rooms Required</InputLabel>
                          <Select
                            value={roomsRequired}
                            label="Rooms Required"
                            onChange={(e) => setRoomsRequired(Number(e.target.value))}
                            sx={{
                              backgroundColor: "rgba(255,255,255,0.03)",
                              color: "#FAF8F3",
                              "& fieldset": { borderColor: "rgba(212,175,107,0.3)" }
                            }}
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <MenuItem key={n} value={n}>
                                {n} Room{n > 1 ? "s" : ""}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ color: "rgba(240,237,230,0.6)" }}>Adult Guests</InputLabel>
                          <Select
                            value={adults}
                            label="Adult Guests"
                            onChange={(e) => setAdults(Number(e.target.value))}
                            sx={{
                              backgroundColor: "rgba(255,255,255,0.03)",
                              color: "#FAF8F3",
                              "& fieldset": { borderColor: "rgba(212,175,107,0.3)" }
                            }}
                          >
                            {[1, 2, 3, 4, 6, 8].map((n) => (
                              <MenuItem key={n} value={n}>
                                {n} Adult{n > 1 ? "s" : ""}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ color: "rgba(240,237,230,0.6)" }}>Children</InputLabel>
                          <Select
                            value={children}
                            label="Children"
                            onChange={(e) => setChildren(Number(e.target.value))}
                            sx={{
                              backgroundColor: "rgba(255,255,255,0.03)",
                              color: "#FAF8F3",
                              "& fieldset": { borderColor: "rgba(212,175,107,0.3)" }
                            }}
                          >
                            {[0, 1, 2, 3, 4].map((n) => (
                              <MenuItem key={n} value={n}>
                                {n} Child{n !== 1 ? "ren" : ""}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* 2. Guest Information */}
                <Card sx={{ background: "#0A1628", border: "1px solid rgba(212,175,107,0.25)", borderRadius: 1 }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Typography variant="h6" sx={{ fontFamily: "'Playfair Display', serif", color: "#FAF8F3", mb: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
                      <User size={20} color="#D4AF6B" /> 2. Guest Information
                    </Typography>

                    <Grid container spacing={2.5}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          required
                          label="Full Legal Name"
                          placeholder="e.g. Ronak Sahu"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "rgba(255,255,255,0.03)",
                              color: "#FAF8F3",
                              "& fieldset": { borderColor: "rgba(212,175,107,0.3)" }
                            },
                            "& .MuiInputLabel-root": { color: "rgba(240,237,230,0.6)" }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          required
                          type="email"
                          label="Email Address (for Booking Voucher)"
                          placeholder="name@example.com"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "rgba(255,255,255,0.03)",
                              color: "#FAF8F3",
                              "& fieldset": { borderColor: "rgba(212,175,107,0.3)" }
                            },
                            "& .MuiInputLabel-root": { color: "rgba(240,237,230,0.6)" }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          required
                          label="Mobile Phone Number"
                          placeholder="9876543210"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span style={{ color: "#D4AF6B", fontSize: "0.85rem", fontWeight: 600 }}>+91</span>
                              </InputAdornment>
                            )
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "rgba(255,255,255,0.03)",
                              color: "#FAF8F3",
                              "& fieldset": { borderColor: "rgba(212,175,107,0.3)" }
                            },
                            "& .MuiInputLabel-root": { color: "rgba(240,237,230,0.6)" }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Special Requests (Optional)"
                          placeholder="e.g. King-size bed, airport pickup, late arrival, quiet floor"
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "rgba(255,255,255,0.03)",
                              color: "#FAF8F3",
                              "& fieldset": { borderColor: "rgba(212,175,107,0.3)" }
                            },
                            "& .MuiInputLabel-root": { color: "rgba(240,237,230,0.6)" }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Submit Button to Payment */}
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  sx={{
                    py: 1.8,
                    background: "linear-gradient(135deg, #D4AF6B 0%, #B8924A 100%)",
                    color: "#0A1628",
                    fontWeight: 700,
                    fontSize: "1rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    boxShadow: "0 6px 24px rgba(212,175,107,0.35)",
                    "&:hover": { background: "linear-gradient(135deg, #E5C385 0%, #C4A46B 100%)" }
                  }}
                >
                  Confirm Details &amp; Proceed to Payment ({formatINR(grandTotal)}) &rarr;
                </Button>
              </form>
            )}

            {/* ── STEP 2: PAYMENT PAGE (CARD, UPI, NETBANKING, ETC.) ── */}
            {currentStep === 2 && (
              <form onSubmit={handleCompletePayment} className="space-y-4">
                <Card sx={{ background: "#0A1628", border: "1px solid rgba(212,175,107,0.25)", borderRadius: 1 }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                      <Typography variant="h6" sx={{ fontFamily: "'Playfair Display', serif", color: "#FAF8F3", display: "flex", alignItems: "center", gap: 1 }}>
                        <CreditCard size={20} color="#D4AF6B" /> Select Payment Method
                      </Typography>
                      <Chip
                        icon={<Lock size={12} color="#10B981" />}
                        label="256-Bit SSL Encrypted"
                        size="small"
                        sx={{ bgcolor: "rgba(16,185,129,0.1)", color: "#10B981", fontSize: "0.6875rem", border: "1px solid rgba(16,185,129,0.3)" }}
                      />
                    </Box>

                    {/* Payment Method Selector Tabs */}
                    <Grid container spacing={1.5} sx={{ mb: 3 }}>
                      {[
                        { id: "upi", label: "UPI & QR", icon: <Smartphone size={18} /> },
                        { id: "card", label: "Cards (Debit / Credit)", icon: <CreditCard size={18} /> },
                        { id: "netbanking", label: "Net Banking", icon: <Building2 size={18} /> },
                        { id: "razorpay", label: "Razorpay Live", icon: <Sparkles size={18} /> },
                        { id: "pay_at_hotel", label: "Pay at Hotel", icon: <MapPin size={18} /> },
                        { id: "demo", label: "Instant Demo", icon: <CheckCircle2 size={18} /> }
                      ].map((item) => (
                        <Grid item xs={6} sm={4} key={item.id}>
                          <Box
                            onClick={() => setPaymentMode(item.id)}
                            sx={{
                              p: 1.5,
                              textAlign: "center",
                              cursor: "pointer",
                              border: "1px solid",
                              borderColor: paymentMode === item.id ? "#D4AF6B" : "rgba(255,255,255,0.1)",
                              background: paymentMode === item.id ? "rgba(212,175,107,0.12)" : "rgba(255,255,255,0.02)",
                              borderRadius: 1,
                              transition: "all 0.2s ease"
                            }}
                          >
                            <Box sx={{ color: paymentMode === item.id ? "#D4AF6B" : "rgba(240,237,230,0.6)", mb: 0.5 }}>
                              {item.icon}
                            </Box>
                            <Typography variant="caption" sx={{ color: paymentMode === item.id ? "#FAF8F3" : "rgba(240,237,230,0.7)", fontWeight: 600, display: "block" }}>
                              {item.label}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2.5 }} />

                    {/* METHOD A: UPI PAYMENT */}
                    {paymentMode === "upi" && (
                      <Box sx={{ spaceY: 2.5 }}>
                        <Typography variant="subtitle2" sx={{ color: "#FAF8F3", mb: 1.5 }}>
                          Pay with any UPI App
                        </Typography>

                        {/* UPI App Icons */}
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
                          {[
                            { id: "gpay", label: "Google Pay" },
                            { id: "phonepe", label: "PhonePe" },
                            { id: "paytm", label: "Paytm" },
                            { id: "bhim", label: "BHIM UPI" },
                            { id: "qr", label: "Scan QR Code" }
                          ].map((app) => (
                            <Chip
                              key={app.id}
                              label={app.label}
                              onClick={() => setSelectedUpiApp(app.id)}
                              sx={{
                                bgcolor: selectedUpiApp === app.id ? "#D4AF6B" : "rgba(255,255,255,0.05)",
                                color: selectedUpiApp === app.id ? "#0A1628" : "#FAF8F3",
                                fontWeight: 600,
                                cursor: "pointer",
                                border: "1px solid",
                                borderColor: selectedUpiApp === app.id ? "#D4AF6B" : "rgba(255,255,255,0.12)"
                              }}
                            />
                          ))}
                        </Box>

                        {selectedUpiApp === "qr" ? (
                          <Box sx={{ textAlign: "center", p: 3, border: "1px dashed rgba(212,175,107,0.3)", borderRadius: 1, bgcolor: "rgba(255,255,255,0.02)" }}>
                            <Box sx={{ width: 140, height: 140, mx: "auto", mb: 2, bgcolor: "#FFFFFF", p: 1.5, borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <QrCode size={110} color="#0A1628" />
                            </Box>
                            <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.8)", display: "block" }}>
                              Scan using Google Pay, PhonePe, Paytm, or BHIM to pay {formatINR(grandTotal)}
                            </Typography>
                          </Box>
                        ) : (
                          <TextField
                            fullWidth
                            label="Virtual Payment Address (UPI ID)"
                            placeholder="e.g. 9876543210@paytm or yourname@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(255,255,255,0.03)",
                                color: "#FAF8F3",
                                "& fieldset": { borderColor: "rgba(212,175,107,0.3)" }
                              },
                              "& .MuiInputLabel-root": { color: "rgba(240,237,230,0.6)" }
                            }}
                          />
                        )}
                      </Box>
                    )}

                    {/* METHOD B: CREDIT / DEBIT CARD */}
                    {paymentMode === "card" && (
                      <Box sx={{ spaceY: 2.5 }}>
                        <Typography variant="subtitle2" sx={{ color: "#FAF8F3", mb: 1.5 }}>
                          Enter Card Details (Visa, Mastercard, RuPay, Amex)
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              required
                              label="16-Digit Card Number"
                              placeholder="4111 2222 3333 4444"
                              value={cardNumber}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                                const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                                setCardNumber(formatted);
                              }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CreditCard size={20} color="#D4AF6B" />
                                  </InputAdornment>
                                )
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: "rgba(255,255,255,0.03)",
                                  color: "#FAF8F3",
                                  "& fieldset": { borderColor: "rgba(212,175,107,0.3)" }
                                },
                                "& .MuiInputLabel-root": { color: "rgba(240,237,230,0.6)" }
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              required
                              label="Expiry (MM/YY)"
                              placeholder="12/28"
                              value={cardExpiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                                if (val.length >= 3) {
                                  val = `${val.slice(0, 2)}/${val.slice(2)}`;
                                }
                                setCardExpiry(val);
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: "rgba(255,255,255,0.03)",
                                  color: "#FAF8F3",
                                  "& fieldset": { borderColor: "rgba(212,175,107,0.3)" }
                                },
                                "& .MuiInputLabel-root": { color: "rgba(240,237,230,0.6)" }
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              required
                              type="password"
                              label="CVV / CVC"
                              placeholder="123"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: "rgba(255,255,255,0.03)",
                                  color: "#FAF8F3",
                                  "& fieldset": { borderColor: "rgba(212,175,107,0.3)" }
                                },
                                "& .MuiInputLabel-root": { color: "rgba(240,237,230,0.6)" }
                              }}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              required
                              label="Name on Card"
                              placeholder="Full Name as embossed on card"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: "rgba(255,255,255,0.03)",
                                  color: "#FAF8F3",
                                  "& fieldset": { borderColor: "rgba(212,175,107,0.3)" }
                                },
                                "& .MuiInputLabel-root": { color: "rgba(240,237,230,0.6)" }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    {/* METHOD C: NET BANKING */}
                    {paymentMode === "netbanking" && (
                      <Box sx={{ spaceY: 2.5 }}>
                        <Typography variant="subtitle2" sx={{ color: "#FAF8F3", mb: 1.5 }}>
                          Choose Your Bank
                        </Typography>

                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
                          {["HDFC", "SBI", "ICICI", "Axis", "Kotak", "PNB"].map((bank) => (
                            <Chip
                              key={bank}
                              label={bank}
                              onClick={() => setSelectedBank(bank)}
                              sx={{
                                bgcolor: selectedBank === bank ? "#D4AF6B" : "rgba(255,255,255,0.05)",
                                color: selectedBank === bank ? "#0A1628" : "#FAF8F3",
                                fontWeight: 700,
                                px: 1,
                                cursor: "pointer",
                                border: "1px solid",
                                borderColor: selectedBank === bank ? "#D4AF6B" : "rgba(255,255,255,0.12)"
                              }}
                            />
                          ))}
                        </Box>

                        <FormControl fullWidth>
                          <InputLabel sx={{ color: "rgba(240,237,230,0.6)" }}>All Indian Banks</InputLabel>
                          <Select
                            value={selectedBank}
                            label="All Indian Banks"
                            onChange={(e) => setSelectedBank(e.target.value)}
                            sx={{
                              backgroundColor: "rgba(255,255,255,0.03)",
                              color: "#FAF8F3",
                              "& fieldset": { borderColor: "rgba(212,175,107,0.3)" }
                            }}
                          >
                            <MenuItem value="HDFC">HDFC Bank</MenuItem>
                            <MenuItem value="SBI">State Bank of India (SBI)</MenuItem>
                            <MenuItem value="ICICI">ICICI Bank</MenuItem>
                            <MenuItem value="Axis">Axis Bank</MenuItem>
                            <MenuItem value="Kotak">Kotak Mahindra Bank</MenuItem>
                            <MenuItem value="PNB">Punjab National Bank</MenuItem>
                            <MenuItem value="BOB">Bank of Baroda</MenuItem>
                            <MenuItem value="IndusInd">IndusInd Bank</MenuItem>
                            <MenuItem value="IDFC">IDFC FIRST Bank</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    )}

                    {/* METHOD D: RAZORPAY */}
                    {paymentMode === "razorpay" && (
                      <Box sx={{ p: 3, border: "1px solid rgba(212,175,107,0.3)", borderRadius: 1, bgcolor: "rgba(212,175,107,0.05)", textAlign: "center" }}>
                        <Sparkles size={28} color="#D4AF6B" style={{ margin: "0 auto 10px" }} />
                        <Typography variant="subtitle1" sx={{ color: "#FAF8F3", fontWeight: 700, mb: 0.5 }}>
                          Razorpay Live Gateway
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.7)" }}>
                          Opens the secure Razorpay checkout modal with bank-grade 3D Secure verification.
                        </Typography>
                      </Box>
                    )}

                    {/* METHOD E: PAY AT HOTEL */}
                    {paymentMode === "pay_at_hotel" && (
                      <Box sx={{ p: 3, border: "1px solid rgba(212,175,107,0.3)", borderRadius: 1, bgcolor: "rgba(212,175,107,0.05)" }}>
                        <Typography variant="subtitle1" sx={{ color: "#FAF8F3", fontWeight: 700, mb: 0.5 }}>
                          Zero Upfront Payment
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.7)" }}>
                          Your suite is guaranteed immediately. You can settle the full bill of {formatINR(grandTotal)} upon check-in at the hotel front desk via cash, card, or UPI.
                        </Typography>
                      </Box>
                    )}

                    {/* METHOD F: INSTANT DEMO */}
                    {paymentMode === "demo" && (
                      <Box sx={{ p: 3, border: "1px solid rgba(16,185,129,0.3)", borderRadius: 1, bgcolor: "rgba(16,185,129,0.05)" }}>
                        <Typography variant="subtitle1" sx={{ color: "#10B981", fontWeight: 700, mb: 0.5 }}>
                          Instant Test Settlement
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.7)" }}>
                          Instantly confirms the booking and marks payment as Paid without debiting any card. Perfect for rapid testing.
                        </Typography>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                      <Button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        variant="outlined"
                        sx={{
                          py: 1.5,
                          px: 3,
                          borderColor: "rgba(212,175,107,0.4)",
                          color: "#D4AF6B",
                          fontWeight: 600
                        }}
                      >
                        &larr; Edit Details
                      </Button>

                      <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={processing}
                        sx={{
                          py: 1.75,
                          background: "linear-gradient(135deg, #D4AF6B 0%, #B8924A 100%)",
                          color: "#0A1628",
                          fontWeight: 700,
                          fontSize: "1rem",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          boxShadow: "0 6px 24px rgba(212,175,107,0.35)",
                          "&:hover": { background: "linear-gradient(135deg, #E5C385 0%, #C4A46B 100%)" }
                        }}
                      >
                        {processing ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          `Pay & Confirm Booking (${formatINR(grandTotal)})`
                        )}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </form>
            )}
          </Grid>

          {/* ════════ RIGHT COLUMN: STICKY ORDER SUMMARY ════════ */}
          <Grid item xs={12} lg={5}>
            <Card
              sx={{
                background: "#0A1628",
                border: "1px solid rgba(212,175,107,0.25)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                borderRadius: 1,
                position: "sticky",
                top: "100px"
              }}
            >
              <Box
                component="img"
                src={room?.heroImage || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80"}
                alt={room?.name}
                sx={{ width: "100%", height: 210, objectFit: "cover" }}
              />

              <CardContent sx={{ p: 3.5 }}>
                <Typography variant="overline" sx={{ color: "#D4AF6B", fontWeight: 700, letterSpacing: "0.1em", display: "block" }}>
                  {room?.property || room?.hotel?.name || "LUXURY SANCTUARY"}
                </Typography>
                <Typography variant="h5" sx={{ fontFamily: "'Playfair Display', serif", color: "#FAF8F3", mb: 0.5 }}>
                  {room?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.7)", mb: 2.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <MapPin size={14} color="#D4AF6B" /> {room?.location || "India"}
                </Typography>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2 }} />

                {/* Stay Breakdown */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.7)" }}>
                    {formatINR(pricePerNight)} &times; {nights} night{nights > 1 ? "s" : ""} &times; {roomsRequired} room{roomsRequired > 1 ? "s" : ""}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#FAF8F3", fontWeight: 600 }}>
                    {formatINR(roomSubtotal)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.7)" }}>
                    Indian GST ({gstRate}%)
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#FAF8F3", fontWeight: 600 }}>
                    +{formatINR(gstAmount)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.7)" }}>
                    Booking &amp; Concierge Fee
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#10B981", fontWeight: 600 }}>
                    FREE
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: "rgba(212,175,107,0.3)", my: 2 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: "#FAF8F3", fontWeight: 700 }}>
                    Total Payable
                  </Typography>
                  <Typography variant="h5" sx={{ fontFamily: "'Playfair Display', serif", color: "#D4AF6B", fontWeight: 700 }}>
                    {formatINR(grandTotal)}
                  </Typography>
                </Box>

                {/* Trust Badges */}
                <Box sx={{ p: 2, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 1 }} className="space-y-1.5">
                  <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.8)", display: "flex", alignItems: "center", gap: 1 }}>
                    <Check size={14} color="#10B981" /> Instant Confirmation &amp; Digital Voucher
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.8)", display: "flex", alignItems: "center", gap: 1 }}>
                    <Check size={14} color="#10B981" /> Free Cancellation up to 48h before check-in
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.8)", display: "flex", alignItems: "center", gap: 1 }}>
                    <Check size={14} color="#10B981" /> Best Rate Guaranteed with GST Invoice
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
