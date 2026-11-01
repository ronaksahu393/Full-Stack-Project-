import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotify } from "../../context/NotificationContext";
import {
  Menu as MenuIcon, X, ChevronDown, LogOut, User,
  Compass, ShieldCheck, Briefcase, Sparkles, MapPin,
  Phone, Globe, Star, ArrowRight
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  {
    label: "Destinations",
    to: "/explore",
    mega: [
      { label: "Rajasthan", sub: "Havelis & Palaces", icon: "🏰", to: "/explore?state=Rajasthan" },
      { label: "Goa", sub: "Coastal Villas", icon: "🌊", to: "/explore?state=Goa" },
      { label: "Kerala", sub: "Backwater Retreats", icon: "🌿", to: "/explore?state=Kerala" },
      { label: "Himachal", sub: "Mountain Lodges", icon: "🏔️", to: "/explore?state=Himachal Pradesh" },
      { label: "Kashmir", sub: "Dal Lake & Snow", icon: "❄️", to: "/explore?state=Jammu & Kashmir" },
      { label: "Karnataka", sub: "Coffee & Heritage", icon: "☕", to: "/explore?state=Karnataka" },
    ]
  },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(null);
  const userMenuRef = useRef(null);

  const { user, logout, isAuthenticated } = useAuth();
  const { notify } = useNotify();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setMegaOpen(null);
  }, [location.pathname]);

  // Click outside to dismiss user menu
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    try {
      await logout();
      if (notify) notify("You have signed out successfully.", "info");
      navigate("/login");
    } catch (err) {
      navigate("/login");
    }
  };

  const getDashLink = () => {
    if (user?.role === "admin") return { label: "Admin Portal", to: "/admin-portal", icon: ShieldCheck };
    if (user?.role === "staff") return { label: "Staff Portal", to: "/staff-portal", icon: Briefcase };
    return { label: "My Stays", to: "/dashboard", icon: Compass };
  };
  const dash = getDashLink();
  const DashIcon = dash.icon;

  const hidden = false; // Never hide the primary navigation bar

  return (
    <>
      {/* ── ANNOUNCEMENT TICKER ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1300,
        height: "32px",
        background: "linear-gradient(90deg, #0A1628 0%, #132040 50%, #0A1628 100%)",
        borderBottom: "1px solid rgba(212,175,107,0.2)",
        display: "flex", alignItems: "center", overflow: "hidden",
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 0.4s ease"
      }}>
        <div style={{
          display: "flex", gap: "4rem", alignItems: "center",
          animation: "marquee 28s linear infinite",
          whiteSpace: "nowrap", paddingLeft: "100%"
        }}>
          {["✦ Free cancellation on all bookings", "✦ Exclusive member rates — up to 30% off", "✦ 53 luxury sanctuaries across India", "✦ अतिथि देवो भव — Guest is Divine", "✦ 24/7 Concierge • Instant Confirmation", "✦ Razorpay Secured Payments"].map((t, i) => (
            <span key={i} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.16em", color: "#D4AF6B" }}>{t}</span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </div>

      {/* ── MAIN NAVBAR ── */}
      <header style={{
        position: "fixed", top: "32px", left: 0, right: 0, zIndex: 1200,
        transform: hidden ? "translateY(calc(-100% - 32px))" : "translateY(0)",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        background: scrolled ? "rgba(7, 12, 26, 0.98)" : "rgba(10, 22, 40, 0.6)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: scrolled ? "1px solid rgba(212,175,107,0.2)" : "1px solid rgba(255,255,255,0.04)",
        boxShadow: scrolled ? "0 8px 48px rgba(0,0,0,0.5)" : "none"
      }}>
        {/* Top accent line */}
        {scrolled && (
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,175,107,0.6), transparent)" }} />
        )}

        <div style={{
          maxWidth: "1440px", margin: "0 auto",
          padding: "0 2rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: scrolled ? "62px" : "74px",
          transition: "height 0.35s ease"
        }}>
          {/* ── LOGO ── */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.85rem", textDecoration: "none" }}>
            <div style={{
              position: "relative", width: "40px", height: "40px",
              background: "linear-gradient(135deg, #D4AF6B 0%, #B8924A 100%)",
              borderRadius: "8px", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: "#0A1628",
              boxShadow: "0 4px 20px rgba(212,175,107,0.4)",
              transition: "all 0.3s ease"
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "rotate(-5deg) scale(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "rotate(0) scale(1)"; }}
            >
              A
              <div style={{ position: "absolute", inset: "-2px", borderRadius: "10px", border: "1px solid rgba(212,175,107,0.4)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "1px" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.45rem", fontWeight: 600, color: "#FAF8F3", letterSpacing: "0.05em", textTransform: "uppercase" }}>Atithi</span>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.45rem", fontWeight: 700, color: "#D4AF6B", letterSpacing: "0.05em", textTransform: "uppercase" }}>Go</span>
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.52rem", fontWeight: 600, letterSpacing: "0.26em", textTransform: "uppercase", color: "#8A9BAE" }}>Luxury Sanctuaries · India</span>
            </div>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} className="hidden md:flex">
            {NAV_LINKS.map(link => {
              const isActive = location.pathname === link.to;
              const hasMega = !!link.mega;
              return (
                <div
                  key={link.to}
                  style={{ position: "relative" }}
                  onMouseEnter={() => hasMega && setMegaOpen(link.label)}
                  onMouseLeave={() => hasMega && setMegaOpen(null)}
                >
                  <Link
                    to={link.to}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.35rem",
                      padding: "0.5rem 0.875rem",
                      fontFamily: "'Inter', sans-serif", fontSize: "0.75rem",
                      fontWeight: isActive ? 600 : 400,
                      letterSpacing: "0.12em", textTransform: "uppercase",
                      color: isActive ? "#D4AF6B" : "#C8D6E8",
                      textDecoration: "none",
                      borderRadius: "4px",
                      background: isActive ? "rgba(212,175,107,0.1)" : "transparent",
                      transition: "all 0.2s ease",
                      position: "relative"
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = "#F0EDE6"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = "#C8D6E8"; e.currentTarget.style.background = "transparent"; } }}
                  >
                    {link.label}
                    {hasMega && <ChevronDown size={11} style={{ opacity: 0.7, marginTop: "1px", transition: "transform 0.2s", transform: megaOpen === link.label ? "rotate(180deg)" : "rotate(0)" }} />}
                    {isActive && <span style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: "20px", height: "1px", background: "#D4AF6B", borderRadius: "1px" }} />}
                  </Link>

                  {/* Mega dropdown */}
                  {hasMega && megaOpen === link.label && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                      width: "480px", background: "rgba(8,16,32,0.98)", backdropFilter: "blur(24px)",
                      border: "1px solid rgba(212,175,107,0.2)", borderRadius: "10px",
                      boxShadow: "0 32px 80px rgba(0,0,0,0.6)", padding: "1.25rem",
                      display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem",
                      zIndex: 9999,
                      animation: "fadeInUp 0.25s ease"
                    }}>
                      <div style={{ gridColumn: "1/-1", marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Compass size={13} style={{ color: "#D4AF6B" }} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "#D4AF6B" }}>Choose Your Destination</span>
                      </div>
                      {link.mega.map(dest => (
                        <Link key={dest.label} to={dest.to} style={{ textDecoration: "none", padding: "0.75rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.04)", transition: "all 0.2s ease", display: "flex", flexDirection: "column", gap: "0.25rem" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,107,0.08)"; e.currentTarget.style.borderColor = "rgba(212,175,107,0.25)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"; }}>
                          <span style={{ fontSize: "1.25rem" }}>{dest.icon}</span>
                          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.9375rem", fontWeight: 500, color: "#FAF8F3" }}>{dest.label}</span>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 300, color: "#8A9BAE" }}>{dest.sub}</span>
                        </Link>
                      ))}
                      <Link to="/explore" style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.625rem", marginTop: "0.25rem", background: "rgba(212,175,107,0.08)", border: "1px solid rgba(212,175,107,0.2)", borderRadius: "6px", textDecoration: "none", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#D4AF6B", transition: "all 0.2s ease" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,107,0.16)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(212,175,107,0.08)"; }}>
                        View All 53 Sanctuaries <ArrowRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* ── RIGHT ACTIONS ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            {/* Live badge */}
            <div className="hidden lg:flex" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0.75rem", background: "rgba(46,204,137,0.08)", border: "1px solid rgba(46,204,137,0.2)", borderRadius: "20px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2ECC89", flexShrink: 0, animation: "goldPulse 2s infinite" }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2ECC89" }}>Live Availability</span>
            </div>

            {/* Always visible Book a Stay button */}
            <Link to="/explore" style={{
              fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#0A1628", textDecoration: "none", padding: "0.55rem 1.15rem",
              background: "linear-gradient(135deg, #D4AF6B 0%, #E8C98A 50%, #B8924A 100%)",
              backgroundSize: "200% auto", borderRadius: "5px",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 14px rgba(212,175,107,0.35)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(212,175,107,0.55)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 14px rgba(212,175,107,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <Sparkles size={13} />
              Book a Stay
            </Link>

            {isAuthenticated ? (
              <div ref={userMenuRef} style={{ position: "relative" }}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  background: "rgba(212,175,107,0.1)", border: "1px solid rgba(212,175,107,0.25)",
                  borderRadius: "6px", padding: "0.45rem 0.875rem",
                  color: "#D4AF6B", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 500,
                  letterSpacing: "0.06em", cursor: "pointer", transition: "all 0.2s ease"
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,107,0.18)"; e.currentTarget.style.borderColor = "rgba(212,175,107,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(212,175,107,0.1)"; e.currentTarget.style.borderColor = "rgba(212,175,107,0.25)"; }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "linear-gradient(135deg, #D4AF6B, #B8924A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#0A1628" }}>
                    {(user?.name || "U")[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{user?.name ? (user.name.length > 12 ? user.name.slice(0, 10) + ".." : user.name) : "Account"}</span>
                  <ChevronDown size={12} style={{ transform: userMenuOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 10px)", right: 0, width: "240px",
                    background: "rgba(8,16,32,0.99)", border: "1px solid rgba(212,175,107,0.25)",
                    borderRadius: "10px", boxShadow: "0 24px 64px rgba(0,0,0,0.6)", overflow: "hidden", zIndex: 9999
                  }}>
                    <div style={{ padding: "1rem 1.125rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(212,175,107,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #D4AF6B, #B8924A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 700, color: "#0A1628", flexShrink: 0 }}>
                          {(user?.name || "U")[0].toUpperCase()}
                        </div>
                        <div style={{ overflow: "hidden" }}>
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.9375rem", fontWeight: 600, color: "#FAF8F3", lineHeight: 1.2, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{user?.name}</p>
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "#8A9BAE", letterSpacing: "0.04em", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: "0.5rem" }}>
                      <Link to={dash.to} onClick={() => setUserMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 0.875rem", color: "#C8D6E8", textDecoration: "none", fontSize: "0.8125rem", borderRadius: "6px", transition: "all 0.15s ease" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#FAF8F3"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C8D6E8"; }}>
                        <DashIcon size={14} style={{ color: "#D4AF6B" }} />
                        {dash.label}
                      </Link>
                      <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 0.875rem", color: "#E05252", background: "transparent", border: "none", fontSize: "0.8125rem", cursor: "pointer", borderRadius: "6px", transition: "all 0.15s ease", textAlign: "left" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(224,82,82,0.08)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Link to="/login" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FAF8F3", textDecoration: "none", padding: "0.5rem 0.875rem", borderRadius: "4px", border: "1px solid rgba(212,175,107,0.3)", transition: "all 0.2s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#D4AF6B"; e.currentTarget.style.background = "rgba(212,175,107,0.12)"; e.currentTarget.style.borderColor = "#D4AF6B"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#FAF8F3"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(212,175,107,0.3)"; }}>
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "0.55rem", color: "#F0EDE6", cursor: "pointer", display: "flex", alignItems: "center" }}>
              {mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE FULL-SCREEN MENU ── */}
      {mobileOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 1400,
          background: "rgba(7,16,32,0.98)",
          backdropFilter: "blur(24px)",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem 1.5rem 2rem",
          overflowY: "auto"
        }}>
          {/* Mobile Top Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #173F35, #0A1628)", border: "1.5px solid #D4AF6B", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF6B", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: "700" }}>
                A
              </div>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: "600", color: "#FAF8F3" }}>
                Atithi<span style={{ color: "#D4AF6B" }}>Go</span>
              </span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#FAF8F3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <X size={18} />
            </button>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {NAV_LINKS.map((link, i) => (
              <div key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "2rem",
                    fontWeight: 300,
                    color: location.pathname === link.to ? "#D4AF6B" : "#FAF8F3",
                    textDecoration: "none",
                    padding: "0.5rem 0",
                    display: "block",
                    borderBottom: "1px solid rgba(255,255,255,0.04)"
                  }}
                >
                  {link.label}
                </Link>
                {link.mega && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.4rem", margin: "0.6rem 0 0.8rem 0" }}>
                    {link.mega.slice(0, 4).map(dest => (
                      <Link
                        key={dest.label}
                        to={dest.to}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          padding: "0.5rem 0.6rem",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: "4px",
                          textDecoration: "none",
                          fontSize: "0.72rem",
                          color: "#FAF8F3",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem"
                        }}
                      >
                        <span>{dest.icon}</span>
                        <span style={{ color: "#D4AF6B", fontWeight: "500" }}>{dest.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {isAuthenticated ? (
              <>
                <Link
                  to={dash.to}
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary"
                  style={{ justifyContent: "center", padding: "0.75rem" }}
                >
                  <DashIcon size={15} />
                  {dash.label}
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="btn-outline"
                  style={{ color: "#E05252", borderColor: "rgba(224,82,82,0.4)", justifyContent: "center", cursor: "pointer", padding: "0.75rem" }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-outline"
                  style={{ justifyContent: "center", padding: "0.75rem" }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary"
                  style={{ justifyContent: "center", padding: "0.75rem" }}
                >
                  Book a Stay
                </Link>
              </>
            )}
          </div>

          <div style={{ marginTop: "auto", textAlign: "center", paddingTop: "2rem" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", color: "#D4AF6B", margin: 0 }}>
              अतिथि देवो भव
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,237,230,0.5)", marginTop: "4px" }}>
              53 Luxury Sanctuaries Across India
            </p>
          </div>
        </div>
      )}

      {(userMenuOpen || megaOpen) && <div onClick={() => { setUserMenuOpen(false); setMegaOpen(null); }} style={{ position: "fixed", inset: 0, zIndex: 9990 }} />}
    </>
  );
}
