import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotify } from "../../context/NotificationContext";
import { api, loadRazorpayScript } from "../../services/api";
import { formatINR } from "../../utils/currency";
import {
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
  Clock,
  Ban,
  FileText,
  MapPin,
  CheckCircle2,
  X,
  Compass,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Crown,
  Award,
  PhoneCall,
  Gift,
  Printer,
  LogOut
} from "lucide-react";

export default function GuestDashboard() {
  const { user, setUser, logout } = useAuth();
  const { notify } = useNotify();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
      notify("You have signed out securely.", "info");
      navigate("/login");
    } catch (e) {
      navigate("/login");
    }
  };

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [confirmCancelModalBooking, setConfirmCancelModalBooking] = useState(null);
  const [payingBookingId, setPayingBookingId] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // "active" | "history" | "privileges" | "profile" | "support"

  // Profile management state
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Security password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Concierge support state
  const [supportBookingId, setSupportBookingId] = useState("");
  const [supportCategory, setSupportCategory] = useState("Reservation Inquiry");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportTickets, setSupportTickets] = useState([
    {
      id: "TKT-8291",
      category: "Early Check-in Request",
      bookingRef: "ATG-9842",
      status: "Resolved",
      response: "Front Desk has prepared complimentary 11:00 AM early arrival for your suite.",
      date: "2 days ago"
    }
  ]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const updated = await api.updateProfile({ name: profileName, phone: profilePhone });
      if (updated) setUser(updated);
      notify("Your patron profile details have been saved.", "success");
    } catch (err) {
      notify(err.message || "Failed to update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      notify("New password must be at least 6 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      notify("New passwords do not match.", "error");
      return;
    }
    try {
      setChangingPassword(true);
      await api.changePassword(currentPassword, newPassword);
      notify("Password updated successfully! Please use it for future sign-ins.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      notify(err.message || "Failed to change password.", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) {
      notify("Please enter your inquiry details.", "error");
      return;
    }
    setSupportSubmitting(true);
    setTimeout(() => {
      const newTicket = {
        id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        category: supportCategory,
        bookingRef: supportBookingId || "General Stay Inquiry",
        status: "Open - Concierge Reviewing",
        response: "Your dedicated butler desk has received this inquiry. Expected response within 30 minutes.",
        date: "Just now"
      };
      setSupportTickets([newTicket, ...supportTickets]);
      setSupportMessage("");
      setSupportSubmitting(false);
      notify("Concierge support inquiry submitted! Ticket created.", "success");
    }, 600);
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const data = await api.getMyBookings();
      setBookings(data || []);
    } catch (err) {
      setFetchError(err.message || "Failed to retrieve your reservations.");
      notify(err.message || "Failed to retrieve your reservations.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const executeCancelBooking = async (id) => {
    try {
      setCancellingId(id);
      await api.cancelBooking(id);
      notify("Your reservation has been cancelled. Flexible refund initiated.", "success");
      setConfirmCancelModalBooking(null);
      fetchBookings();
    } catch (err) {
      notify(err.message || "Failed to cancel reservation.", "error");
    } finally {
      setCancellingId(null);
    }
  };

  const handlePayWithRazorpay = async (booking) => {
    try {
      setPayingBookingId(booking._id);
      const orderRes = await api.createRazorpayOrder(booking._id);
      const isLoaded = await loadRazorpayScript();
      if (isLoaded && typeof window !== "undefined" && window.Razorpay) {
        const options = {
          key: orderRes.order?.keyId || "rzp_test_placeholder",
          amount: orderRes.order?.amount,
          currency: orderRes.order?.currency || "INR",
          name: "AtithiGo Sanctuaries & Suites",
          description: `Settlement for ${booking.roomName}`,
          order_id: orderRes.order?.orderId,
          handler: async function (response) {
            try {
              await api.verifyPayment(booking._id, {
                paymentMethod: "Razorpay",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: booking.totalPrice,
                currency: booking.currency || "INR"
              });
              notify("Payment settled via Razorpay! Reservation confirmed.", "success");
              fetchBookings();
            } catch (verifyErr) {
              notify(verifyErr.message || "Payment verification failed.", "error");
              fetchBookings();
            }
          },
          prefill: {
            name: booking.guestName,
            email: booking.guestEmail,
            contact: booking.guestPhone
          },
          theme: {
            color: "#0A1628"
          },
          modal: {
            ondismiss: function () {
              notify("Payment window closed. Reservation remains held under Pending Payment.", "warning");
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          notify(`Payment failed: ${response.error?.description || "Transaction declined"}`, "error");
        });
        rzp.open();
      } else {
        // Fallback development simulation
        await api.verifyPayment(booking._id, {
          paymentMethod: "Demo_Simulated",
          simulatedToken: `sim_${Date.now()}`
        });
        notify("Development payment simulation settled.", "success");
        fetchBookings();
      }
    } catch (err) {
      notify(err.message || "Failed to initiate Razorpay checkout.", "error");
    } finally {
      setPayingBookingId(null);
    }
  };

  const upcomingStays = bookings.filter((b) => b.status === "Confirmed" || b.status === "Pending Payment");
  const pastStays = bookings.filter((b) => b.status === "Completed" || b.status === "Cancelled");

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Subh Prabhat (Good Morning)" : hour < 18 ? "Good Afternoon" : "Shubh Sandhya (Good Evening)";

  // Days until stay calculation
  const getDaysUntil = (checkInStr) => {
    if (!checkInStr) return null;
    const checkIn = new Date(checkInStr);
    const today = new Date();
    const diffTime = checkIn - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Ongoing";
    if (diffDays === 0) return "Arriving Today";
    if (diffDays === 1) return "Arriving Tomorrow";
    return `In ${diffDays} days`;
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#071020] text-[#FAF8F3]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-8">

        {/* ── TOP PATRON PROFILE & ROYAL TIERS BANNER ── */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(10,22,40,0.9) 0%, rgba(23,63,53,0.3) 100%)",
            border: "1px solid rgba(212,175,107,0.25)",
            borderRadius: "6px",
            padding: "2rem 2.25rem",
            boxShadow: "0 15px 40px rgba(0,0,0,0.4)"
          }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-5">
            {/* Patron Avatar Monogram */}
            <div
              style={{
                width: "68px",
                height: "68px",
                background: "linear-gradient(135deg, #173F35 0%, #0A1628 100%)",
                border: "2px solid #D4AF6B",
                borderRadius: "4px",
                color: "#D4AF6B",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "2rem",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(212,175,107,0.25)",
                flexShrink: 0
              }}
            >
              {user?.name ? user.name.charAt(0) : "A"}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  style={{
                    padding: "0.22rem 0.65rem",
                    background: "rgba(212,175,107,0.15)",
                    border: "1px solid rgba(212,175,107,0.35)",
                    borderRadius: "100px",
                    color: "#D4AF6B",
                    fontSize: "0.62rem",
                    fontWeight: "700",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}
                >
                  <Crown size={12} className="text-[#D4AF6B]" />
                  Royal Atelier Diamond Patron
                </span>
                <span className="text-xs text-[#10B981] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Identity
                </span>
              </div>

              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.75rem, 3vw, 2.4rem)",
                  fontWeight: "400",
                  color: "#FAF8F3",
                  margin: 0,
                  lineHeight: "1.2"
                }}
              >
                {greeting}, {user?.name || "Distinguished Patron"}
              </h1>

              <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(240,237,230,0.65)" }}>
                {user?.email} {user?.phone ? `• ${user.phone}` : ""} &bull; Concierge PIN: #ATG-{(user?._id || "9283").slice(-4).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Quick Actions & Concierge Support */}
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="tel:+911800284844"
              onClick={(e) => { e.preventDefault(); notify("Connecting to 24/7 AtithiGo Royal Concierge Desk...", "info"); }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1.25rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(212,175,107,0.3)",
                borderRadius: "3px",
                color: "#D4AF6B",
                fontSize: "0.72rem",
                fontWeight: "600",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none"
              }}
            >
              <PhoneCall size={13} />
              24/7 Butler Desk
            </a>

            <Link
              to="/explore"
              className="btn-primary"
              style={{
                borderRadius: "3px",
                padding: "0.65rem 1.35rem",
                fontSize: "0.72rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase"
              }}
            >
              <Compass size={14} />
              Book New Stay
            </Link>

            <button
              onClick={handleSignOut}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1.15rem",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.35)",
                borderRadius: "3px",
                color: "#F87171",
                fontSize: "0.72rem",
                fontWeight: "600",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </div>

        {/* ── EXECUTIVE STATS GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Upcoming Stays",
              value: upcomingStays.length,
              sub: "Guaranteed Escapes",
              icon: <Calendar size={18} className="text-[#D4AF6B]" />
            },
            {
              label: "Atelier Loyalty Points",
              value: "12,450",
              sub: "Diamond Tier Progress: 82%",
              icon: <Crown size={18} className="text-[#D4AF6B]" />
            },
            {
              label: "Voyages Completed",
              value: pastStays.filter(s => s.status === "Completed").length || "3",
              sub: "Historical Sanctuaries",
              icon: <Award size={18} className="text-[#D4AF6B]" />
            },
            {
              label: "Concierge Status",
              value: "Active",
              sub: "VIP Priority Check-in",
              icon: <ShieldCheck size={18} className="text-[#10B981]" />
            }
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: "rgba(10,22,40,0.6)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "5px",
                padding: "1.25rem 1.5rem"
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(240,237,230,0.6)" }}>
                  {stat.label}
                </span>
                {stat.icon}
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.85rem", fontWeight: "600", color: "#FAF8F3", lineHeight: 1.1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "0.68rem", color: "#D4AF6B", marginTop: "0.35rem" }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── NAVIGATION TABS ── */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: "2rem" }}>
          <button
            onClick={() => setActiveTab("active")}
            style={{
              paddingBottom: "0.85rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === "active" ? "2px solid #D4AF6B" : "2px solid transparent",
              color: activeTab === "active" ? "#D4AF6B" : "rgba(240,237,230,0.6)",
              fontSize: "0.82rem",
              fontWeight: "600",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <Calendar size={15} />
            <span>Active Voyages ({upcomingStays.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            style={{
              paddingBottom: "0.85rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === "history" ? "2px solid #D4AF6B" : "2px solid transparent",
              color: activeTab === "history" ? "#D4AF6B" : "rgba(240,237,230,0.6)",
              fontSize: "0.82rem",
              fontWeight: "600",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <FileText size={15} />
            <span>Stay Archive ({pastStays.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("privileges")}
            style={{
              paddingBottom: "0.85rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === "privileges" ? "2px solid #D4AF6B" : "2px solid transparent",
              color: activeTab === "privileges" ? "#D4AF6B" : "rgba(240,237,230,0.6)",
              fontSize: "0.82rem",
              fontWeight: "600",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <Gift size={15} />
            <span>Atelier Privileges</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            style={{
              paddingBottom: "0.85rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === "profile" ? "2px solid #D4AF6B" : "2px solid transparent",
              color: activeTab === "profile" ? "#D4AF6B" : "rgba(240,237,230,0.6)",
              fontSize: "0.82rem",
              fontWeight: "600",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <User size={15} />
            <span>Profile &amp; Security</span>
          </button>

          <button
            onClick={() => setActiveTab("support")}
            style={{
              paddingBottom: "0.85rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === "support" ? "2px solid #D4AF6B" : "2px solid transparent",
              color: activeTab === "support" ? "#D4AF6B" : "rgba(240,237,230,0.6)",
              fontSize: "0.82rem",
              fontWeight: "600",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <PhoneCall size={15} />
            <span>Concierge Support</span>
          </button>
        </div>

        {/* ── TAB 1: ACTIVE STAYS ── */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {loading ? (
              <div
                style={{
                  height: "200px",
                  background: "rgba(10,22,40,0.5)",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#D4AF6B"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Sparkles size={20} className="animate-spin" />
                  <span>Retrieving your confirmed sanctuaries...</span>
                </div>
              </div>
            ) : fetchError ? (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "6px",
                  padding: "2rem",
                  textAlign: "center"
                }}
              >
                <AlertCircle size={32} className="text-red-400 mx-auto mb-2" />
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem" }}>Unable to load reservations</h3>
                <p style={{ fontSize: "0.8rem", color: "rgba(240,237,230,0.7)" }}>{fetchError}</p>
                <button onClick={fetchBookings} className="btn-primary mt-4 text-xs py-2 px-5">
                  Retry Loading
                </button>
              </div>
            ) : upcomingStays.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {upcomingStays.map((booking) => {
                  const isPaid = booking.paymentStatus === "Paid";
                  const countdown = getDaysUntil(booking.checkIn);

                  return (
                    <div
                      key={booking._id}
                      style={{
                        background: "rgba(10,22,40,0.85)",
                        border: "1px solid rgba(212,175,107,0.25)",
                        borderRadius: "6px",
                        padding: "1.75rem 2rem",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                        transition: "all 0.3s ease"
                      }}
                      className="flex flex-col md:flex-row justify-between gap-6"
                    >
                      <div className="space-y-3 max-w-xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            style={{
                              padding: "0.22rem 0.65rem",
                              borderRadius: "3px",
                              fontSize: "0.62rem",
                              fontWeight: "700",
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              background: isPaid ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                              border: `1px solid ${isPaid ? "rgba(16,185,129,0.4)" : "rgba(245,158,11,0.4)"}`,
                              color: isPaid ? "#34D399" : "#FBBF24"
                            }}
                          >
                            {isPaid ? "Confirmed Sanctuary Stay" : "Payment Pending"}
                          </span>

                          {countdown && (
                            <span
                              style={{
                                padding: "0.22rem 0.65rem",
                                borderRadius: "3px",
                                fontSize: "0.62rem",
                                fontWeight: "600",
                                background: "rgba(212,175,107,0.12)",
                                border: "1px solid rgba(212,175,107,0.3)",
                                color: "#F0D08A"
                              }}
                            >
                              <Clock size={10} className="inline mr-1" />
                              {countdown}
                            </span>
                          )}

                          <span style={{ fontSize: "0.72rem", color: "rgba(240,237,230,0.5)", fontFamily: "monospace" }}>
                            Folio: #{booking._id.slice(-8).toUpperCase()}
                          </span>
                        </div>

                        <h3
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: "1.75rem",
                            fontWeight: "500",
                            color: "#FAF8F3",
                            margin: 0
                          }}
                        >
                          {booking.roomName}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#FAF8F3]/80">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-[#D4AF6B]" />
                            <span>
                              {typeof booking.checkIn === "string" ? booking.checkIn.split("T")[0] : ""} &rarr;{" "}
                              {typeof booking.checkOut === "string" ? booking.checkOut.split("T")[0] : ""}{" "}
                              ({booking.nights} night{booking.nights > 1 ? "s" : ""})
                            </span>
                          </div>
                          <span>&bull;</span>
                          <div className="flex items-center gap-1.5">
                            <User size={14} className="text-[#D4AF6B]" />
                            <span>
                              {booking.guests?.adults || 1} Adult(s)
                              {booking.guests?.children ? `, ${booking.guests.children} Children` : ""}
                            </span>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "4px",
                              padding: "0.65rem 0.85rem",
                              fontSize: "0.75rem",
                              color: "rgba(240,237,230,0.85)"
                            }}
                          >
                            <span style={{ color: "#D4AF6B", fontWeight: "600" }}>Concierge Note: </span>
                            {booking.specialRequests}
                          </div>
                        )}
                      </div>

                      {/* Financial & Action Buttons */}
                      <div className="flex flex-col justify-between items-start md:items-end gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                        <div className="text-left md:text-right">
                          <span style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(240,237,230,0.5)", display: "block" }}>
                            Stay Investment
                          </span>
                          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.85rem", fontWeight: "600", color: "#FAF8F3" }}>
                            {formatINR(booking.totalPrice)}
                          </span>
                          <span style={{ fontSize: "0.72rem", display: "block", color: isPaid ? "#34D399" : "#FBBF24" }}>
                            &bull; {isPaid ? "Settled via Razorpay" : "Pending UPI / Card Settlement"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {!isPaid && (
                            <button
                              onClick={() => handlePayWithRazorpay(booking)}
                              disabled={payingBookingId === booking._id}
                              style={{
                                padding: "0.55rem 1rem",
                                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                                border: "none",
                                borderRadius: "3px",
                                color: "#FFFFFF",
                                fontSize: "0.72rem",
                                fontWeight: "700",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.4rem"
                              }}
                            >
                              <CreditCard size={14} />
                              <span>{payingBookingId === booking._id ? "Opening Razorpay..." : "Pay with Razorpay"}</span>
                            </button>
                          )}

                          <button
                            onClick={() => setActiveReceipt(booking)}
                            style={{
                              padding: "0.55rem 0.9rem",
                              background: "rgba(212,175,107,0.12)",
                              border: "1px solid rgba(212,175,107,0.35)",
                              borderRadius: "3px",
                              color: "#D4AF6B",
                              fontSize: "0.72rem",
                              fontWeight: "600",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.4rem"
                            }}
                          >
                            <FileText size={14} />
                            <span>Voucher</span>
                          </button>

                          <button
                            onClick={() => setConfirmCancelModalBooking(booking)}
                            style={{
                              padding: "0.55rem 0.85rem",
                              background: "rgba(239,68,68,0.08)",
                              border: "1px solid rgba(239,68,68,0.25)",
                              borderRadius: "3px",
                              color: "#F87171",
                              fontSize: "0.72rem",
                              fontWeight: "600",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.4rem"
                            }}
                          >
                            <Ban size={14} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  background: "rgba(10,22,40,0.6)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  padding: "3.5rem 2rem",
                  textAlign: "center"
                }}
              >
                <Compass size={40} className="text-[#D4AF6B] mx-auto mb-3" />
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", margin: "0 0 0.5rem 0" }}>
                  No Active Voyages Scheduled
                </h3>
                <p style={{ fontSize: "0.85rem", color: "rgba(240,237,230,0.6)", maxWidth: "480px", margin: "0 auto 1.5rem" }}>
                  Your sanctuary portfolio is open. Explore our 53+ handcrafted palaces, havelis, and coastal cliff pavilions across India.
                </p>
                <Link to="/explore" className="btn-primary" style={{ borderRadius: "3px", padding: "0.75rem 1.75rem" }}>
                  Explore Sanctuaries
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: STAY ARCHIVE ── */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {pastStays.length > 0 ? (
              <div
                style={{
                  background: "rgba(10,22,40,0.7)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  overflow: "hidden"
                }}
              >
                <table style={{ width: "100%", textAlign: "left", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                  <thead style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#D4AF6B" }}>
                    <tr>
                      <th style={{ padding: "0.85rem 1rem", fontWeight: "600", textTransform: "uppercase", fontSize: "0.68rem" }}>Sanctuary</th>
                      <th style={{ padding: "0.85rem 1rem", fontWeight: "600", textTransform: "uppercase", fontSize: "0.68rem" }}>Dates &amp; Nights</th>
                      <th style={{ padding: "0.85rem 1rem", fontWeight: "600", textTransform: "uppercase", fontSize: "0.68rem" }}>Status</th>
                      <th style={{ padding: "0.85rem 1rem", fontWeight: "600", textTransform: "uppercase", fontSize: "0.68rem" }}>Investment</th>
                      <th style={{ padding: "0.85rem 1rem", fontWeight: "600", textTransform: "uppercase", fontSize: "0.68rem", textAlign: "right" }}>Folio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastStays.map((booking) => (
                      <tr key={booking._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "1rem", color: "#FAF8F3", fontWeight: "500" }}>{booking.roomName}</td>
                        <td style={{ padding: "1rem", color: "rgba(240,237,230,0.7)" }}>
                          {typeof booking.checkIn === "string" ? booking.checkIn.split("T")[0] : ""} &bull; {booking.nights} night(s)
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.2rem 0.5rem",
                              borderRadius: "3px",
                              fontSize: "0.62rem",
                              fontWeight: "700",
                              textTransform: "uppercase",
                              background: booking.status === "Cancelled" ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.08)",
                              color: booking.status === "Cancelled" ? "#F87171" : "#FAF8F3",
                              border: `1px solid ${booking.status === "Cancelled" ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.15)"}`
                            }}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ padding: "1rem", color: "#D4AF6B", fontWeight: "600" }}>{formatINR(booking.totalPrice)}</td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          <button
                            onClick={() => setActiveReceipt(booking)}
                            style={{ background: "none", border: "none", color: "#D4AF6B", textDecoration: "underline", cursor: "pointer", fontSize: "0.75rem" }}
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem", background: "rgba(10,22,40,0.6)", borderRadius: "6px", color: "rgba(240,237,230,0.6)" }}>
                No prior voyage history found in this portfolio.
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: ATELIER PRIVILEGES ── */}
        {activeTab === "privileges" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Royal Butler Privileges",
                desc: "Direct private line to your destination estate concierge before arrival. Unpacking assistance and evening turndown ceremonies.",
                badge: "Included"
              },
              {
                title: "Flexible Sanctuary Cancellation",
                desc: "Modify or cancel your dates up to 48 hours prior with instantaneous automated refund crediting to your original method.",
                badge: "Guaranteed"
              },
              {
                title: "Traditional Welcome Rituals",
                desc: "Aarti tikka ceremonies, rosewater towels, and regionally curated spiced saffron or kahwa tea upon entering every haven.",
                badge: "Complimentary"
              }
            ].map((priv, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(10,22,40,0.7)",
                  border: "1px solid rgba(212,175,107,0.25)",
                  borderRadius: "6px",
                  padding: "1.75rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <Sparkles size={18} className="text-[#D4AF6B]" />
                  <span style={{ fontSize: "0.62rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.14em", color: "#D4AF6B", background: "rgba(212,175,107,0.12)", padding: "0.2rem 0.5rem", borderRadius: "100px" }}>
                    {priv.badge}
                  </span>
                </div>
                <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", margin: "0 0 0.5rem 0", color: "#FAF8F3" }}>
                  {priv.title}
                </h4>
                <p style={{ fontSize: "0.82rem", color: "rgba(240,237,230,0.7)", lineHeight: "1.6", margin: 0 }}>
                  {priv.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 4: PROFILE & SECURITY MANAGEMENT ── */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Details */}
            <div
              style={{
                background: "rgba(10,22,40,0.7)",
                border: "1px solid rgba(212,175,107,0.25)",
                borderRadius: "6px",
                padding: "2rem"
              }}
              className="space-y-6"
            >
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", color: "#FAF8F3", margin: "0 0 0.25rem 0" }}>
                  Personal Information
                </h3>
                <p style={{ fontSize: "0.8rem", color: "rgba(240,237,230,0.6)", margin: 0 }}>
                  Update your contact details for reservation confirmations and concierge communications.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(240,237,230,0.7)", marginBottom: "0.4rem" }}>
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(212,175,107,0.3)",
                      borderRadius: "3px",
                      color: "#FAF8F3",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(240,237,230,0.7)", marginBottom: "0.4rem" }}>
                    Registered Email Address (Fixed)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      background: "rgba(255,255,255,0.01)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "3px",
                      color: "rgba(240,237,230,0.5)",
                      fontSize: "0.85rem",
                      cursor: "not-allowed"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(240,237,230,0.7)", marginBottom: "0.4rem" }}>
                    Mobile Number (SMS Updates)
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(212,175,107,0.3)",
                      borderRadius: "3px",
                      color: "#FAF8F3",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn-primary"
                    style={{
                      padding: "0.65rem 1.5rem",
                      fontSize: "0.75rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase"
                    }}
                  >
                    {savingProfile ? "Saving Profile..." : "Save Patron Details"}
                  </button>
                </div>
              </form>
            </div>

            {/* Security & Password Change */}
            <div
              style={{
                background: "rgba(10,22,40,0.7)",
                border: "1px solid rgba(212,175,107,0.25)",
                borderRadius: "6px",
                padding: "2rem"
              }}
              className="space-y-6"
            >
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", color: "#FAF8F3", margin: "0 0 0.25rem 0" }}>
                  Account Security
                </h3>
                <p style={{ fontSize: "0.8rem", color: "rgba(240,237,230,0.6)", margin: 0 }}>
                  Update your authentication credentials. Uses 256-bit hash encryption.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(240,237,230,0.7)", marginBottom: "0.4rem" }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(212,175,107,0.3)",
                      borderRadius: "3px",
                      color: "#FAF8F3",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(240,237,230,0.7)", marginBottom: "0.4rem" }}>
                    New Security Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(212,175,107,0.3)",
                      borderRadius: "3px",
                      color: "#FAF8F3",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(240,237,230,0.7)", marginBottom: "0.4rem" }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(212,175,107,0.3)",
                      borderRadius: "3px",
                      color: "#FAF8F3",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="btn-primary"
                    style={{
                      padding: "0.65rem 1.5rem",
                      fontSize: "0.75rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase"
                    }}
                  >
                    {changingPassword ? "Updating..." : "Update Security Password"}
                  </button>
                </div>
              </form>

              <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                <div>
                  <span className="text-xs text-[#FAF8F3] font-semibold block">Terminate Active Session</span>
                  <span className="text-[11px] text-stone-400">Sign out across devices</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-1.5 border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: CONCIERGE & SUPPORT DESK ── */}
        {activeTab === "support" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Submit Support Request */}
            <div
              style={{
                background: "rgba(10,22,40,0.7)",
                border: "1px solid rgba(212,175,107,0.25)",
                borderRadius: "6px",
                padding: "2rem"
              }}
              className="space-y-5"
            >
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", color: "#FAF8F3", margin: "0 0 0.25rem 0" }}>
                  Bespoke Concierge Support
                </h3>
                <p style={{ fontSize: "0.8rem", color: "rgba(240,237,230,0.6)", margin: 0 }}>
                  Direct assistance for customized itineraries, airport royal pick-ups, dining requests, and booking inquiries.
                </p>
              </div>

              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(240,237,230,0.7)", marginBottom: "0.4rem" }}>
                    Inquiry Category
                  </label>
                  <select
                    value={supportCategory}
                    onChange={(e) => setSupportCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      background: "#0A1628",
                      border: "1px solid rgba(212,175,107,0.3)",
                      borderRadius: "3px",
                      color: "#FAF8F3",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="Reservation Inquiry">Reservation Inquiry &amp; Dates</option>
                    <option value="Special Suite Preparation">Special Suite Preparation &amp; Amenities</option>
                    <option value="Royal Dining & Dietary">Royal Dining &amp; Dietary Preferences</option>
                    <option value="Airport Chauffeur Service">Airport Chauffeur &amp; Arrival</option>
                    <option value="Billing & Invoicing">Billing, GST &amp; Invoicing</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(240,237,230,0.7)", marginBottom: "0.4rem" }}>
                    Reference Booking (Optional)
                  </label>
                  <select
                    value={supportBookingId}
                    onChange={(e) => setSupportBookingId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      background: "#0A1628",
                      border: "1px solid rgba(212,175,107,0.3)",
                      borderRadius: "3px",
                      color: "#FAF8F3",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="">General Sanctuary Inquiry (No booking)</option>
                    {bookings.map((b) => (
                      <option key={b._id} value={b.bookingConfirmation || b._id.slice(-6).toUpperCase()}>
                        {b.roomName} &bull; Confirmation: {b.bookingConfirmation || b._id.slice(-6).toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(240,237,230,0.7)", marginBottom: "0.4rem" }}>
                    Your Message / Special Request
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide detailed preferences or inquiries..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(212,175,107,0.3)",
                      borderRadius: "3px",
                      color: "#FAF8F3",
                      fontSize: "0.85rem",
                      fontFamily: "inherit"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={supportSubmitting}
                  className="btn-primary"
                  style={{
                    padding: "0.65rem 1.5rem",
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase"
                  }}
                >
                  {supportSubmitting ? "Submitting Inquiry..." : "Dispatch to Butler Desk"}
                </button>
              </form>
            </div>

            {/* Support History */}
            <div
              style={{
                background: "rgba(10,22,40,0.7)",
                border: "1px solid rgba(212,175,107,0.25)",
                borderRadius: "6px",
                padding: "2rem"
              }}
              className="space-y-4"
            >
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", color: "#FAF8F3", margin: "0 0 0.25rem 0" }}>
                  Active Concierge Tickets ({supportTickets.length})
                </h3>
                <p style={{ fontSize: "0.8rem", color: "rgba(240,237,230,0.6)", margin: 0 }}>
                  Real-time replies from duty managers and estate concierges.
                </p>
              </div>

              <div className="space-y-3">
                {supportTickets.map((t) => (
                  <div key={t.id} className="p-3.5 bg-white/5 border border-white/10 rounded space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-[#D4AF6B] font-semibold">{t.id}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase ${t.status.includes("Resolved") ? "text-[#10B981] bg-emerald-500/10 border border-emerald-500/30" : "text-[#F59E0B] bg-amber-500/10 border border-amber-500/30"}`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#FAF8F3] font-semibold">{t.category}</div>
                    <div className="text-[11px] text-stone-400">Ref: {t.bookingRef} &bull; {t.date}</div>
                    <div className="p-2 bg-black/30 text-xs text-stone-300 italic border-l-2 border-[#D4AF6B]">
                      "{t.response}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CANCELLATION CONFIRMATION MODAL ── */}
        {confirmCancelModalBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div
              style={{
                background: "#0A1628",
                border: "1px solid rgba(212,175,107,0.3)",
                borderRadius: "6px",
                maxWidth: "460px",
                width: "100%",
                padding: "2rem",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6)"
              }}
              className="space-y-4"
            >
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", color: "#FAF8F3", margin: 0 }}>
                Cancel Sanctuary Reservation
              </h3>
              <p style={{ fontSize: "0.82rem", color: "rgba(240,237,230,0.75)", lineHeight: "1.6" }}>
                Are you certain you wish to cancel your reservation for{" "}
                <strong style={{ color: "#D4AF6B" }}>{confirmCancelModalBooking.roomName}</strong>?
                Under our flexible patron guarantee, any settled funds will be automatically credited to your original payment method.
              </p>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  onClick={() => setConfirmCancelModalBooking(null)}
                  style={{
                    padding: "0.6rem 1.25rem",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "3px",
                    color: "#FAF8F3",
                    fontSize: "0.75rem",
                    cursor: "pointer"
                  }}
                >
                  Keep Reservation
                </button>
                <button
                  onClick={() => executeCancelBooking(confirmCancelModalBooking._id)}
                  disabled={cancellingId === confirmCancelModalBooking._id}
                  style={{
                    padding: "0.6rem 1.25rem",
                    background: "#B83D3D",
                    border: "none",
                    borderRadius: "3px",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    cursor: cancellingId === confirmCancelModalBooking._id ? "wait" : "pointer"
                  }}
                >
                  {cancellingId === confirmCancelModalBooking._id ? "Processing..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ATITHIGO ROYAL STAY VOUCHER & FOLIO MODAL ── */}
        {activeReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div
              style={{
                background: "#0A1628",
                border: "1px solid #D4AF6B",
                borderRadius: "6px",
                maxWidth: "520px",
                width: "100%",
                padding: "2.5rem 2rem",
                boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 35px rgba(212,175,107,0.15)",
                position: "relative"
              }}
              className="space-y-6"
            >
              <button
                onClick={() => setActiveReceipt(null)}
                style={{
                  position: "absolute",
                  top: "1.25rem",
                  right: "1.25rem",
                  background: "none",
                  border: "none",
                  color: "rgba(240,237,230,0.6)",
                  cursor: "pointer"
                }}
              >
                <X size={18} />
              </button>

              <div style={{ textAlign: "center", borderBottom: "1px solid rgba(212,175,107,0.3)", paddingBottom: "1.25rem" }}>
                <div style={{ color: "#D4AF6B", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.85rem", fontWeight: "700", letterSpacing: "0.08em" }}>
                  Atithi<span style={{ color: "#FAF8F3" }}>Go</span>
                </div>
                <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#D4AF6B", marginTop: "0.25rem" }}>
                  Official Sanctuary Stay Voucher &amp; Folio
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.82rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.5rem" }}>
                  <span style={{ color: "rgba(240,237,230,0.5)", textTransform: "uppercase", fontSize: "0.7rem" }}>Voucher Folio ID</span>
                  <span style={{ fontFamily: "monospace", color: "#D4AF6B", fontWeight: "700" }}>{activeReceipt._id.toUpperCase()}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.5rem" }}>
                  <span style={{ color: "rgba(240,237,230,0.5)", textTransform: "uppercase", fontSize: "0.7rem" }}>Lead Patron</span>
                  <span style={{ color: "#FAF8F3", fontWeight: "500" }}>{activeReceipt.guestName}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.5rem" }}>
                  <span style={{ color: "rgba(240,237,230,0.5)", textTransform: "uppercase", fontSize: "0.7rem" }}>Residence</span>
                  <span style={{ color: "#FAF8F3", fontWeight: "600" }}>{activeReceipt.roomName}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.5rem" }}>
                  <span style={{ color: "rgba(240,237,230,0.5)", textTransform: "uppercase", fontSize: "0.7rem" }}>Duration</span>
                  <span style={{ color: "#FAF8F3" }}>
                    {typeof activeReceipt.checkIn === "string" ? activeReceipt.checkIn.split("T")[0] : ""} to{" "}
                    {typeof activeReceipt.checkOut === "string" ? activeReceipt.checkOut.split("T")[0] : ""}{" "}
                    ({activeReceipt.nights} nights)
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.5rem" }}>
                  <span style={{ color: "rgba(240,237,230,0.5)", textTransform: "uppercase", fontSize: "0.7rem" }}>Reservation Status</span>
                  <span style={{ color: "#10B981", fontWeight: "700" }}>{activeReceipt.status}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "#FAF8F3" }}>Total Stay Value</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", color: "#D4AF6B", fontWeight: "700" }}>
                    {formatINR(activeReceipt.totalPrice)}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: "center", fontSize: "0.7rem", color: "rgba(240,237,230,0.5)", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
                Thank you for journeying with AtithiGo. Present this digital voucher or reference number upon arrival at the estate concierge pavilion.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: "0.6rem 1.25rem",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "3px",
                    color: "#FAF8F3",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem"
                  }}
                >
                  <Printer size={13} />
                  Print Folio
                </button>
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="btn-primary"
                  style={{ borderRadius: "3px", padding: "0.6rem 1.5rem", fontSize: "0.75rem" }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
