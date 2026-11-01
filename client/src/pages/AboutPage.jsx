import React from "react";
import { Link } from "react-router-dom";
import { handleImageFallback } from "../utils/imageFallback";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Heart,
  Award,
  Compass,
  Crown,
  Trees,
  Gem,
  MapPin,
  Clock,
  CheckCircle2,
  Users
} from "lucide-react";

export default function AboutPage() {
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
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8.5rem 1.5rem 5rem",
          overflow: "hidden"
        }}
      >
        {/* 8K Palace Background Image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=3840&q=95')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.38) saturate(1.2)"
          }}
        />

        {/* Dual Luxury Gradients */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              linear-gradient(180deg, rgba(7,16,32,0.85) 0%, rgba(7,16,32,0.4) 45%, rgba(7,16,32,0.98) 100%),
              radial-gradient(circle at 50% 40%, rgba(212,175,107,0.12) 0%, transparent 60%)
            `
          }}
        />

        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          {/* Sanskrit Tagline Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 1.15rem",
              background: "rgba(212,175,107,0.14)",
              border: "1px solid rgba(212,175,107,0.35)",
              borderRadius: "100px",
              marginBottom: "1.75rem",
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
              अतिथि देवो भव &bull; The Atelier Origin Story
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.75rem, 6.5vw, 5.25rem)",
              fontWeight: "300",
              lineHeight: "1.08",
              color: "#FAF8F3",
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem"
            }}
          >
            An Anthology of Living{" "}
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
              Indian Heritage
            </span>
          </h1>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
              fontWeight: "300",
              lineHeight: "1.8",
              color: "rgba(240,237,230,0.8)",
              maxWidth: "760px",
              margin: "0 auto 2.5rem"
            }}
          >
            AtithiGo was established on the eternal Indian premise that welcoming a traveler is an act of devotion. We meticulously preserve and operate 53+ historic havelis, oceanfront pavilions, and tea estates across the subcontinent.
          </p>

          {/* Quick Stats Strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "1.25rem",
              maxWidth: "750px",
              margin: "0 auto",
              padding: "1.5rem 1rem",
              background: "rgba(10,22,40,0.6)",
              border: "1px solid rgba(212,175,107,0.25)",
              borderRadius: "6px",
              backdropFilter: "blur(14px)"
            }}
          >
            {[
              { val: "53+", label: "Restored Sanctuaries" },
              { val: "14", label: "Indian States" },
              { val: "350+", label: "Master Artisans" },
              { val: "4.98★", label: "Patron Rating" }
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.85rem", fontWeight: "600", color: "#D4AF6B", lineHeight: 1 }}>
                  {stat.val}
                </div>
                <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(240,237,230,0.65)", marginTop: "0.35rem" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. OUR SACRED PHILOSOPHY ── */}
      <section style={{ padding: "6rem 1.5rem", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "4rem", alignItems: "center" }}>
          {/* Left Text */}
          <div className="space-y-6">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Crown size={15} style={{ color: "#D4AF6B" }} />
              <span style={{ fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.2em", color: "#D4AF6B" }}>
                Our Sacred Philosophy
              </span>
            </div>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                fontWeight: "400",
                color: "#FAF8F3",
                lineHeight: "1.15",
                margin: 0
              }}
            >
              Transcending Mere Stays into <span style={{ fontStyle: "italic", color: "#D4AF6B" }}>Timeless Sanctuaries</span>
            </h2>

            <p style={{ fontSize: "0.95rem", color: "rgba(240,237,230,0.75)", lineHeight: "1.8", margin: 0 }}>
              Hospitality in India is not a corporate protocol — it is an ancestral ceremony. When you cross the threshold of an AtithiGo property, you are received with hand-rolled rosewater compresses, fragrant marigold garlands, and the gentle chime of temple bells.
            </p>

            <p style={{ fontSize: "0.95rem", color: "rgba(240,237,230,0.75)", lineHeight: "1.8", margin: 0 }}>
              We partner directly with royal families, tribal cooperatives, and master stone masons to conserve rare architectural gems: 300-year-old Rajasthani jharokhas, Kerala teak nalukettu compounds, and Himalayan cedarwood chalets that would otherwise be lost to modern urbanization.
            </p>

            <div style={{ display: "flex", gap: "1rem", paddingTop: "1rem" }}>
              <Link to="/explore" className="btn-primary" style={{ borderRadius: "3px", padding: "0.75rem 1.75rem", fontSize: "0.75rem" }}>
                Browse Portfolio
                <ArrowRight size={14} />
              </Link>
              <Link to="/contact" className="btn-outline" style={{ borderRadius: "3px", padding: "0.75rem 1.5rem", fontSize: "0.75rem" }}>
                Speak to Butler
              </Link>
            </div>
          </div>

          {/* Right 8K Image Composition */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                height: "500px",
                borderRadius: "6px",
                overflow: "hidden",
                border: "1px solid rgba(212,175,107,0.3)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)"
              }}
            >
              <img
                src="/images/hotels/hotel-1.jpg"
                alt="Rajasthani Courtyard Heritage"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageFallback(e, "hotel", "Rajasthani Courtyard Heritage")}
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.85) saturate(1.15)" }}
              />
            </div>

            {/* Floating Gold Pill Badge */}
            <div
              style={{
                position: "absolute",
                bottom: "-1.5rem",
                left: "1.5rem",
                background: "rgba(10,22,40,0.92)",
                backdropFilter: "blur(14px)",
                border: "1px solid #D4AF6B",
                borderRadius: "4px",
                padding: "1rem 1.5rem",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                gap: "1rem"
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "rgba(212,175,107,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#D4AF6B"
                }}
              >
                <Gem size={20} />
              </div>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: "600", color: "#FAF8F3" }}>
                  100% Heritage Restoration
                </div>
                <div style={{ fontSize: "0.68rem", color: "#D4AF6B", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Zero Synthetic Alteration
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FOUR FOUNDATIONAL PILLARS ── */}
      <section
        style={{
          background: "linear-gradient(180deg, #0A1628 0%, #071020 100%)",
          padding: "6rem 1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)"
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 4rem" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.2em", color: "#D4AF6B", display: "block", marginBottom: "0.75rem" }}>
              Our Architectural Covenant
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: "400", margin: 0 }}>
              The Four Tenets of AtithiGo
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.75rem" }}>
            {[
              {
                icon: <Crown size={22} className="text-[#D4AF6B]" />,
                title: "Royal Lineage & Authenticity",
                desc: "Every sanctuary holds a documented royal or colonial provenance. Original frescoes, antique chandeliers, and hand-chiseled sandstone courtyards remain untouched."
              },
              {
                icon: <ShieldCheck size={22} className="text-[#10B981]" />,
                title: "Dedicated Butler Desk",
                desc: "Unscripted hospitality delivered by generational concierges. From private sunrise boat ceremonies on Lake Pichola to starlit Thar desert dining under constellations."
              },
              {
                icon: <Trees size={22} className="text-[#60A5FA]" />,
                title: "Ecological Custodianship",
                desc: "Zero single-use plastics across all properties. Fresh water sourced from mountain springs, farm-to-table organic dining, and active wildlife corridor preservation."
              },
              {
                icon: <Sparkles size={22} className="text-[#F59E0B]" />,
                title: "Frictionless Modern Ease",
                desc: "While our properties date back centuries, your digital journey is effortless: instant Razorpay/UPI settlement, encrypted guest portals, and automated reservation management."
              }
            ].map((pillar, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(10,22,40,0.7)",
                  border: "1px solid rgba(212,175,107,0.22)",
                  borderRadius: "6px",
                  padding: "2.25rem 1.75rem",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#D4AF6B";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(212,175,107,0.22)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ marginBottom: "1.25rem" }}>{pillar.icon}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.45rem", fontWeight: "500", color: "#FAF8F3", margin: "0 0 0.75rem 0" }}>
                  {pillar.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "rgba(240,237,230,0.7)", lineHeight: "1.7", margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. 8K VISUAL GALLERY OF INDIAN TERRAINS ── */}
      <section style={{ padding: "6rem 1.5rem", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1.5rem", marginBottom: "3rem" }}>
          <div>
            <span style={{ fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.2em", color: "#D4AF6B", display: "block", marginBottom: "0.5rem" }}>
              Geographical Canvas
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: "400", margin: 0 }}>
              From Thar Sands to Himalayan Snows
            </h2>
          </div>
          <Link to="/explore" style={{ color: "#D4AF6B", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: "600", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            Explore All 53+ Properties
            <ArrowRight size={13} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {[
            {
              title: "The Rajputana Royal Haveli",
              loc: "Jaipur, Rajasthan",
              img: "/images/destinations/jaipur.jpg",
              tag: "Sandstone Fortress"
            },
            {
              title: "Azure Konkan Cliffside Villa",
              loc: "Anjuna Coast, Goa",
              img: "/images/destinations/goa.jpg",
              tag: "Ocean Terraces"
            },
            {
              title: "Misty Nilgiri Tea Sanctuary",
              loc: "Munnar, Kerala",
              img: "/images/destinations/munnar.jpg",
              tag: "Cloud Forest Estates"
            }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                height: "360px",
                borderRadius: "6px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
              }}
            >
              <img
                src={item.img}
                alt={item.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageFallback(e, "destination", item.title)}
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.78) saturate(1.15)" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,16,32,0.92) 0%, transparent 60%)" }} />
              <div style={{ position: "absolute", top: "1rem", left: "1rem", padding: "0.3rem 0.75rem", background: "rgba(10,22,40,0.8)", border: "1px solid rgba(212,175,107,0.3)", borderRadius: "3px", fontSize: "0.62rem", color: "#D4AF6B", textTransform: "uppercase", fontWeight: "700" }}>
                {item.tag}
              </div>
              <div style={{ position: "absolute", bottom: "1.25rem", left: "1.25rem", right: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#D4AF6B", fontSize: "0.7rem", marginBottom: "0.25rem" }}>
                  <MapPin size={11} />
                  <span>{item.loc}</span>
                </div>
                <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem", color: "#FAF8F3", margin: 0 }}>
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. CURATOR'S PLEDGE & FOUNDER SIGNATURE ── */}
      <section
        style={{
          background: "linear-gradient(135deg, rgba(23,63,53,0.3) 0%, rgba(10,22,40,0.8) 100%)",
          borderTop: "1px solid rgba(212,175,107,0.25)",
          padding: "5rem 1.5rem",
          textAlign: "center"
        }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto", spaceY: "1.5rem" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 1.5rem",
              background: "linear-gradient(135deg, #173F35, #0A1628)",
              border: "1.5px solid #D4AF6B",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.85rem",
              color: "#D4AF6B"
            }}
          >
            A
          </div>

          <blockquote
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)",
              fontStyle: "italic",
              fontWeight: "300",
              color: "#FAF8F3",
              lineHeight: "1.4",
              marginBottom: "1.5rem"
            }}
          >
            "We do not merely sell rooms. We curate reverent chapters of Indian memory, ensuring that generations of global patrons find true peace inside our sandstone and marble walls."
          </blockquote>

          <div style={{ color: "#D4AF6B", fontSize: "0.78rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: "600" }}>
            The Board of Curators &bull; AtithiGo Atelier, New Delhi
          </div>
        </div>
      </section>
    </div>
  );
}
