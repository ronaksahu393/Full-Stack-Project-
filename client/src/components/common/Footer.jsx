import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Mail,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  ShieldCheck,
  CreditCard,
  Lock,
  Compass,
  Crown,
  Phone,
  MapPin,
  ChevronUp,
  Sparkles,
  Send,
  CheckCircle2
} from "lucide-react";
import { useNotify } from "../../context/NotificationContext";

export default function Footer() {
  const { notify } = useNotify();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    notify("Welcome to the Royal Circle. Your private invitation dispatch is confirmed.", "success");
    setEmail("");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      style={{
        background: "linear-gradient(180deg, #071020 0%, #050B16 45%, #03070E 100%)",
        borderTop: "1px solid rgba(212,175,107,0.25)",
        position: "relative",
        overflow: "hidden",
        color: "#FAF8F3"
      }}
    >
      {/* ── AMBIENT GOLD RADIANT GLOW ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "280px",
          background: "radial-gradient(ellipse at 50% 0%, rgba(212,175,107,0.1) 0%, transparent 70%)",
          pointerEvents: "none"
        }}
      />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "5rem 2rem 2.5rem", position: "relative", zIndex: 1 }}>

        {/* ── 1. VIP ATELIER NEWSLETTER BANNER ── */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(10,22,40,0.95) 0%, rgba(23,63,53,0.3) 100%)",
            border: "1px solid rgba(212,175,107,0.35)",
            borderRadius: "6px",
            padding: "2.5rem",
            marginBottom: "4.5rem",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2.5rem",
            alignItems: "center"
          }}
        >
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.8rem", background: "rgba(212,175,107,0.12)", border: "1px solid rgba(212,175,107,0.3)", borderRadius: "100px", marginBottom: "0.85rem", color: "#D4AF6B", fontSize: "0.65rem", fontWeight: "700", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              <Crown size={12} className="text-[#D4AF6B]" />
              The AtithiGo Royal Circle
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.75rem, 3vw, 2.4rem)", fontWeight: "400", margin: "0 0 0.5rem 0", color: "#FAF8F3", lineHeight: "1.2" }}>
              Private Dispatches &amp; Sovereign Invitations
            </h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(240,237,230,0.65)", margin: 0, lineHeight: "1.6" }}>
              Receive seasonal palace openings, private jet concierge bulletins, and unpublished heritage suites before public availability.
            </p>
          </div>

          <div>
            <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: "1 1 240px" }}>
                <Mail size={15} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "rgba(212,175,107,0.7)" }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patron@royalvoyage.com"
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem 0.85rem 2.75rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(212,175,107,0.3)",
                    borderRadius: "4px",
                    color: "#FAF8F3",
                    fontSize: "0.82rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={e => e.target.style.borderColor = "#D4AF6B"}
                  onBlur={e => e.target.style.borderColor = "rgba(212,175,107,0.3)"}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: "0.85rem 1.6rem",
                  background: "linear-gradient(135deg, #D4AF6B 0%, #B8924A 100%)",
                  border: "none",
                  borderRadius: "4px",
                  color: "#071020",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 15px rgba(212,175,107,0.3)",
                  transition: "all 0.2s ease"
                }}
              >
                <span>Enter Circle</span>
                <Send size={13} />
              </button>
            </form>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem", fontSize: "0.68rem", color: "rgba(240,237,230,0.45)" }}>
              <CheckCircle2 size={12} className="text-[#10B981]" />
              <span>Strictly confidential. No marketing solicitations.</span>
            </div>
          </div>
        </div>

        {/* ── 2. MAIN 5-COLUMN DIRECTORY ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "3rem",
            paddingBottom: "4rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          {/* Brand Column */}
          <div style={{ gridColumn: "span 1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.25rem" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  background: "linear-gradient(135deg, #173F35, #0A1628)",
                  border: "1.5px solid #D4AF6B",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.75rem",
                  fontWeight: "700",
                  color: "#D4AF6B",
                  boxShadow: "0 0 20px rgba(212,175,107,0.2)"
                }}
              >
                A
              </div>
              <div>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.45rem", fontWeight: "600", color: "#FAF8F3", letterSpacing: "0.06em", display: "block" }}>
                  Atithi<span style={{ color: "#D4AF6B" }}>Go</span>
                </span>
                <span style={{ fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#D4AF6B" }}>
                  Atelier of Indian Sanctuaries
                </span>
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "rgba(240,237,230,0.65)", lineHeight: "1.75", marginBottom: "1.25rem" }}>
              An anthology of 53+ living palaces, coastal cliff pavilions, and misty tea estates across the Indian subcontinent.
            </p>

            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#D4AF6B", fontSize: "1rem", marginBottom: "1.5rem" }}>
              ✦ अतिथि देवो भव &bull; Where the Guest Is Divine
            </div>

            {/* Social Icons */}
            <div style={{ display: "flex", gap: "0.6rem" }}>
              {[
                { icon: <Instagram size={14} />, link: "https://instagram.com" },
                { icon: <Twitter size={14} />, link: "https://twitter.com" },
                { icon: <Linkedin size={14} />, link: "https://linkedin.com" },
                { icon: <Youtube size={14} />, link: "https://youtube.com" }
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(240,237,230,0.7)",
                    transition: "all 0.2s ease",
                    textDecoration: "none"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(212,175,107,0.18)";
                    e.currentTarget.style.borderColor = "#D4AF6B";
                    e.currentTarget.style.color = "#D4AF6B";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "rgba(240,237,230,0.7)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 style={{ fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.2em", color: "#D4AF6B", marginBottom: "1.25rem" }}>
              Signature Destinations
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { label: "Jaipur Sandstone Havelis", to: "/explore?destination=Jaipur" },
                { label: "Udaipur Lake Pichola Palaces", to: "/explore?destination=Udaipur" },
                { label: "Goa Cliffside Azure Villas", to: "/explore?destination=Goa" },
                { label: "Munnar Cloud Forest Lodges", to: "/explore?destination=Munnar" },
                { label: "Kashmir Cedar Houseboats", to: "/explore?destination=Kashmir" },
                { label: "Coorg Arabica Mist Estates", to: "/explore?destination=Coorg" }
              ].map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    style={{ fontSize: "0.82rem", color: "rgba(240,237,230,0.65)", textDecoration: "none", transition: "color 0.2s ease" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#D4AF6B"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,230,0.65)"}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Patron Privileges */}
          <div>
            <h4 style={{ fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.2em", color: "#D4AF6B", marginBottom: "1.25rem" }}>
              Patron Services
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { label: "Guest Portfolio & Dashboard", to: "/dashboard" },
                { label: "24/7 Concierge Desk", to: "/contact" },
                { label: "Explore Luxury Stays", to: "/explore" },
                { label: "About HotelPro", to: "/about" },
                { label: "Concierge & Staff Portal", to: "/staff-portal" },
                { label: "Atelier Estate Administration", to: "/admin-portal" }
              ].map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    style={{ fontSize: "0.82rem", color: "rgba(240,237,230,0.65)", textDecoration: "none", transition: "color 0.2s ease" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#D4AF6B"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,230,0.65)"}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Regional Flagships */}
          <div>
            <h4 style={{ fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.2em", color: "#D4AF6B", marginBottom: "1.25rem" }}>
              Diplomatic Bureaus
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.8rem", color: "rgba(240,237,230,0.65)" }}>
              <div>
                <span style={{ color: "#FAF8F3", fontWeight: "600", display: "block" }}>New Delhi Pavilion</span>
                <span style={{ fontSize: "0.72rem" }}>24 Dr. APJ Abdul Kalam Road &bull; 110011</span>
              </div>
              <div>
                <span style={{ color: "#FAF8F3", fontWeight: "600", display: "block" }}>Mumbai Waterfront Suite</span>
                <span style={{ fontSize: "0.72rem" }}>Maker Chambers VI, Nariman Point &bull; 400021</span>
              </div>
              <div>
                <span style={{ color: "#FAF8F3", fontWeight: "600", display: "block" }}>Udaipur Lake Dock</span>
                <span style={{ fontSize: "0.72rem" }}>Triguna Ghat, City Palace Enclave &bull; 313001</span>
              </div>
              <div>
                <a href="tel:+911800284844" style={{ color: "#D4AF6B", textDecoration: "none", fontSize: "0.78rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <Phone size={12} />
                  <span>+91 1800 284 844 (Toll-Free)</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. PAYMENT & SECURITY GUARANTEES STRIP ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
            padding: "2rem 0",
            borderBottom: "1px solid rgba(255,255,255,0.06)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(240,237,230,0.5)" }}>
              Certified Secure Settlement:
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <span style={{ padding: "0.25rem 0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "3px", fontSize: "0.68rem", fontWeight: "700", color: "#38BDF8" }}>
                Razorpay Verified
              </span>
              <span style={{ padding: "0.25rem 0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "3px", fontSize: "0.68rem", fontWeight: "700", color: "#34D399" }}>
                Instant UPI &amp; NetBanking
              </span>
              <span style={{ padding: "0.25rem 0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "3px", fontSize: "0.68rem", fontWeight: "700", color: "#F59E0B" }}>
                RuPay &bull; Visa &bull; Mastercard
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: "#10B981" }}>
            <ShieldCheck size={16} />
            <span>256-Bit SSL Encrypted Banking Channel</span>
          </div>
        </div>

        {/* ── 4. COPYRIGHT & BACK TO TOP ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.25rem",
            paddingTop: "2rem"
          }}
        >
          <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(240,237,230,0.5)", lineHeight: "1.5" }}>
            &copy; {new Date().getFullYear()} AtithiGo Luxury Hospitality Atelier Pvt Ltd. All international rights reserved.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "1.75rem", fontSize: "0.72rem", color: "rgba(240,237,230,0.5)" }}>
            <a href="#privacy" onClick={e => e.preventDefault()} style={{ color: "rgba(240,237,230,0.5)", textDecoration: "none" }}>Privacy Charter</a>
            <a href="#terms" onClick={e => e.preventDefault()} style={{ color: "rgba(240,237,230,0.5)", textDecoration: "none" }}>Patron Terms</a>
            <a href="#heritage" onClick={e => e.preventDefault()} style={{ color: "rgba(240,237,230,0.5)", textDecoration: "none" }}>Heritage Preservation</a>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              title="Return to peak"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.35rem 0.75rem",
                background: "rgba(212,175,107,0.12)",
                border: "1px solid rgba(212,175,107,0.3)",
                borderRadius: "3px",
                color: "#D4AF6B",
                fontSize: "0.7rem",
                fontWeight: "600",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#D4AF6B";
                e.currentTarget.style.color = "#071020";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(212,175,107,0.12)";
                e.currentTarget.style.color = "#D4AF6B";
              }}
            >
              <span>Peak</span>
              <ChevronUp size={13} />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
