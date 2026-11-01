import React, { useState } from "react";
import { useNotify } from "../context/NotificationContext";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Sparkles,
  Crown,
  Plane,
  HeartHandshake,
  Clock,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function ContactPage() {
  const { notify } = useNotify();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    destination: "Rajasthan Palaces",
    occasion: "Private Leisure Retreat",
    guests: "2 Guests",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      notify("Your royal inquiry has been received. Our Master Concierge will connect with you within 2 hours.", "success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        destination: "Rajasthan Palaces",
        occasion: "Private Leisure Retreat",
        guests: "2 Guests",
        message: ""
      });
      setSubmitting(false);
    }, 600);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#071020",
        color: "#FAF8F3",
        position: "relative",
        overflowX: "hidden"
      }}
    >
      {/* ── 1. 8K HERO SECTION ── */}
      <section
        style={{
          position: "relative",
          minHeight: "65vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8.5rem 1.5rem 4rem",
          overflow: "hidden"
        }}
      >
        {/* 8K Lake Palace Background Image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=3840&q=95')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.35) saturate(1.2)"
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              linear-gradient(180deg, rgba(7,16,32,0.85) 0%, rgba(7,16,32,0.4) 45%, rgba(7,16,32,0.98) 100%),
              radial-gradient(circle at 50% 30%, rgba(212,175,107,0.15) 0%, transparent 60%)
            `
          }}
        />

        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 1.15rem",
              background: "rgba(212,175,107,0.14)",
              border: "1px solid rgba(212,175,107,0.35)",
              borderRadius: "100px",
              marginBottom: "1.5rem",
              backdropFilter: "blur(12px)"
            }}
          >
            <Sparkles size={13} className="text-[#D4AF6B]" />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.68rem",
                fontWeight: "700",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#D4AF6B"
              }}
            >
              24/7 Dedicated Concierge &bull; Royal Liaison Desk
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
              fontWeight: "300",
              lineHeight: "1.1",
              color: "#FAF8F3",
              letterSpacing: "-0.02em",
              marginBottom: "1.25rem"
            }}
          >
            Connect with Our{" "}
            <span
              style={{
                fontStyle: "italic",
                fontWeight: "400",
                background: "linear-gradient(120deg, #D4AF6B 0%, #F0D08A 35%, #D4AF6B 70%, #FAF8F3 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Royal Concierge
            </span>
          </h1>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(0.95rem, 1.6vw, 1.125rem)",
              fontWeight: "300",
              lineHeight: "1.75",
              color: "rgba(240,237,230,0.8)",
              maxWidth: "680px",
              margin: "0 auto"
            }}
          >
            Whether planning a private palace buyout in Udaipur, an oceanfront Konkan villa stay, or private helicopter transfers, our concierge team is at your complete disposal.
          </p>
        </div>
      </section>

      {/* ── 2. SPECIALIZED CONCIERGE CHANNELS ── */}
      <section style={{ maxWidth: "1280px", margin: "-2rem auto 4rem", padding: "0 1.5rem", position: "relative", zIndex: 3 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
          {[
            {
              icon: <Crown size={20} className="text-[#D4AF6B]" />,
              title: "Royal Butler Desk",
              desc: "Direct private line for suite upgrades and bespoke dining.",
              contact: "+91 1800 284 844",
              type: "tel"
            },
            {
              icon: <Plane size={20} className="text-[#60A5FA]" />,
              title: "Helicopter & Jet Transfers",
              desc: "Direct airfield to palace rooftop transfers across India.",
              contact: "aviation@atithigo.com",
              type: "email"
            },
            {
              icon: <HeartHandshake size={20} className="text-[#F472B6]" />,
              title: "Palace Buyouts & Weddings",
              desc: "Exclusive fortress reservations and regal ceremonies.",
              contact: "weddings@atithigo.com",
              type: "email"
            },
            {
              icon: <MessageSquare size={20} className="text-[#34D399]" />,
              title: "Instant VIP WhatsApp",
              desc: "Immediate 2-minute response from on-duty concierge.",
              contact: "+91 98765 43210",
              type: "tel"
            }
          ].map((channel, idx) => (
            <div
              key={idx}
              style={{
                background: "rgba(10,22,40,0.85)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(212,175,107,0.25)",
                borderRadius: "6px",
                padding: "1.5rem",
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#D4AF6B";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(212,175,107,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ marginBottom: "0.85rem" }}>{channel.icon}</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", color: "#FAF8F3", margin: "0 0 0.35rem 0" }}>
                {channel.title}
              </h3>
              <p style={{ fontSize: "0.78rem", color: "rgba(240,237,230,0.65)", lineHeight: "1.5", margin: "0 0 1rem 0" }}>
                {channel.desc}
              </p>
              <a
                href={channel.type === "tel" ? `tel:${channel.contact.replace(/\s+/g, "")}` : `mailto:${channel.contact}`}
                style={{
                  color: "#D4AF6B",
                  fontSize: "0.78rem",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem"
                }}
              >
                <span>{channel.contact}</span>
                <ArrowRight size={12} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. MAIN FORM & FLAGSHIP PAVILIONS ── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto 5rem", padding: "0 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "3rem", alignItems: "flex-start" }}>

          {/* Left Column: Bespoke Inquiry Form */}
          <div
            style={{
              background: "rgba(10,22,40,0.9)",
              border: "1px solid rgba(212,175,107,0.3)",
              borderRadius: "6px",
              padding: "2.5rem 2.25rem",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
            }}
          >
            <div style={{ marginBottom: "2rem" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.18em", color: "#D4AF6B", display: "block", marginBottom: "0.5rem" }}>
                Direct Liaison Dispatch
              </span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.1rem", fontWeight: "400", color: "#FAF8F3", margin: 0 }}>
                Request Bespoke Arrangements
              </h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Name & Phone */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.68rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.12em", color: "#D4AF6B", marginBottom: "0.4rem" }}>
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Maharaj Vikramaditya"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "4px",
                      color: "#FAF8F3",
                      fontSize: "0.85rem",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    onFocus={e => e.target.style.borderColor = "#D4AF6B"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.68rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.12em", color: "#D4AF6B", marginBottom: "0.4rem" }}>
                    Telephone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "4px",
                      color: "#FAF8F3",
                      fontSize: "0.85rem",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    onFocus={e => e.target.style.borderColor = "#D4AF6B"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label style={{ display: "block", fontSize: "0.68rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.12em", color: "#D4AF6B", marginBottom: "0.4rem" }}>
                  Patron Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="patron@atithigo.com"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "4px",
                    color: "#FAF8F3",
                    fontSize: "0.85rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={e => e.target.style.borderColor = "#D4AF6B"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                />
              </div>

              {/* Destination & Occasion Selects */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.68rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.12em", color: "#D4AF6B", marginBottom: "0.4rem" }}>
                    Sanctuary Region
                  </label>
                  <select
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      background: "#0A1628",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "4px",
                      color: "#FAF8F3",
                      fontSize: "0.85rem",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="Rajasthan Palaces">Rajasthan Palaces (Jaipur, Udaipur, Jodhpur)</option>
                    <option value="Goa Coastal Villas">Goa Coastal &amp; Cliffside Villas</option>
                    <option value="Kerala Backwaters">Kerala Mist &amp; Backwater Sanctuaries</option>
                    <option value="Kashmir Snow Chalets">Kashmir Cedar Houseboats &amp; Chalets</option>
                    <option value="Himachal Lodges">Himachal Mountain Lodges</option>
                    <option value="Pan-India Itinerary">Custom Multi-Destination Tour</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.68rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.12em", color: "#D4AF6B", marginBottom: "0.4rem" }}>
                    Voyage Purpose
                  </label>
                  <select
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      background: "#0A1628",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "4px",
                      color: "#FAF8F3",
                      fontSize: "0.85rem",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="Private Leisure Retreat">Private Leisure Retreat</option>
                    <option value="Honeymoon & Celebrations">Honeymoon &amp; Intimate Celebration</option>
                    <option value="Royal Wedding Buyout">Royal Wedding Buyout</option>
                    <option value="Corporate Executive Conclave">Executive Conclave</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={{ display: "block", fontSize: "0.68rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.12em", color: "#D4AF6B", marginBottom: "0.4rem" }}>
                  Bespoke Notes / Dietary &amp; Aviation Needs
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your flight arrivals, preferred suite view, culinary preferences, or private excursions..."
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "4px",
                    color: "#FAF8F3",
                    fontSize: "0.85rem",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "'Inter', sans-serif"
                  }}
                  onFocus={e => e.target.style.borderColor = "#D4AF6B"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "0.9rem 1.5rem",
                  background: "linear-gradient(135deg, #D4AF6B 0%, #B8924A 100%)",
                  border: "none",
                  borderRadius: "4px",
                  color: "#071020",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  cursor: submitting ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.6rem",
                  boxShadow: "0 6px 20px rgba(212,175,107,0.3)",
                  transition: "all 0.25s ease"
                }}
              >
                {submitting ? "Transmitting to Concierge..." : "Dispatch to Master Concierge"}
                <Send size={15} />
              </button>
            </form>
          </div>

          {/* Right Column: Atelier Regional Pavilions */}
          <div className="space-y-6">
            <div>
              <span style={{ fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.18em", color: "#D4AF6B", display: "block", marginBottom: "0.5rem" }}>
                Regional Diplomatic Presence
              </span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.1rem", fontWeight: "400", color: "#FAF8F3", margin: 0 }}>
                Atelier Flagship Pavilions
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                {
                  city: "New Delhi",
                  pavilion: "Lutyens' Heritage Liaison Bureau",
                  address: "24 Dr. APJ Abdul Kalam Road, New Delhi 110011",
                  phone: "+91 11 4983 2000",
                  hours: "24/7 Operations"
                },
                {
                  city: "Mumbai",
                  pavilion: "Nariman Point Waterfront Suite",
                  address: "Floor 18, Maker Chambers VI, Nariman Point, Mumbai 400021",
                  phone: "+91 22 6620 4000",
                  hours: "08:00 - 22:00 IST"
                },
                {
                  city: "Udaipur",
                  pavilion: "Lake Pichola Private Boat Dock & Bureau",
                  address: "Triguna Ghat, City Palace Enclave, Udaipur, Rajasthan 313001",
                  phone: "+91 294 242 8000",
                  hours: "24/7 Butler Desk"
                },
                {
                  city: "Bengaluru",
                  pavilion: "Sankey Road Highgrove Suite",
                  address: "Palace Road Corridor, Bengaluru, Karnataka 560052",
                  phone: "+91 80 4120 7000",
                  hours: "09:00 - 20:00 IST"
                }
              ].map((office, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(10,22,40,0.6)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "6px",
                    padding: "1.25rem 1.5rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <span style={{ color: "#D4AF6B", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: "600" }}>
                      {office.city}
                    </span>
                    <span style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#10B981", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                      <Clock size={10} />
                      {office.hours}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#FAF8F3", fontWeight: "500", marginBottom: "0.25rem" }}>
                    {office.pavilion}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(240,237,230,0.6)", lineHeight: "1.4", marginBottom: "0.5rem" }}>
                    <MapPin size={11} className="inline mr-1 text-[#D4AF6B]" />
                    {office.address}
                  </div>
                  <a
                    href={`tel:${office.phone.replace(/\s+/g, "")}`}
                    style={{ color: "#D4AF6B", fontSize: "0.72rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                  >
                    <Phone size={11} />
                    <span>{office.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── 4. CONCIERGE FAQ ACCORDION ── */}
      <section style={{ maxWidth: "900px", margin: "0 auto 6rem", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span style={{ fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.18em", color: "#D4AF6B", display: "block", marginBottom: "0.5rem" }}>
            Patron Inquiries
          </span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: "400", margin: 0 }}>
            Frequently Addressed Questions
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {[
            {
              q: "How does the flexible cancellation and refund policy work?",
              a: "Under the AtithiGo Patron Charter, reservations can be amended or cancelled with full credit back to your original payment method up to 48 hours prior to check-in. Refunds via Razorpay settle in 24 to 48 hours."
            },
            {
              q: "Can AtithiGo arrange private airport chauffeured or helicopter transfers?",
              a: "Yes. Our concierge liaises with private aviation charters and luxury sedan fleets (Mercedes S-Class, BMW 7, Range Rover) in all primary Indian metropolitan areas, delivering direct tarmac or doorstep pick-ups."
            },
            {
              q: "Do your properties cater to customized royal culinary requirements?",
              a: "Every estate executive chef coordinates with you prior to arrival to design tailored feasts — including Royal Rajasthani Thalis, pure Jain satvik feasts, coastal Konkan seafood, and plant-based Ayurvedic regimens."
            },
            {
              q: "Are the historical havelis and palaces family and child friendly?",
              a: "Indeed. Many of our sanctuaries feature expansive courtyards, heritage puppet storytelling evenings, starlit astronomy sessions, and dedicated junior patron suites."
            }
          ].map((faq, i) => (
            <div
              key={i}
              style={{
                background: "rgba(10,22,40,0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "5px",
                overflow: "hidden"
              }}
            >
              <button
                type="button"
                onClick={() => toggleFaq(i)}
                style={{
                  width: "100%",
                  padding: "1.15rem 1.25rem",
                  background: "none",
                  border: "none",
                  color: "#FAF8F3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.92rem",
                  fontWeight: "500"
                }}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={16}
                  style={{
                    color: "#D4AF6B",
                    transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease"
                  }}
                />
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 1.25rem 1.25rem", fontSize: "0.82rem", color: "rgba(240,237,230,0.7)", lineHeight: "1.7" }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
