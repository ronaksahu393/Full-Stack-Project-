import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Compass, PhoneCall } from "lucide-react";

export default function BookingCTA() {
  return (
    <section
      style={{
        position: "relative",
        padding: "7rem 1.5rem",
        background: "linear-gradient(135deg, #071020 0%, #0D2620 50%, #071020 100%)",
        borderTop: "1px solid rgba(212,175,107,0.25)",
        overflow: "hidden",
        color: "#FAF8F3"
      }}
    >
      {/* 16K Master Background Ambience */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=3840&q=95')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.22) saturate(1.2)"
        }}
      />

      {/* Radiant Gold Glow Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(180deg, rgba(7,16,32,0.92) 0%, rgba(13,38,32,0.65) 50%, rgba(7,16,32,0.95) 100%),
            radial-gradient(circle at 50% 50%, rgba(212,175,107,0.14) 0%, transparent 60%)
          `
        }}
      />

      <div style={{ position: "relative", zIndex: 2, maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
        {/* AtithiGo Royal Crest */}
        <div
          style={{
            width: "50px",
            height: "50px",
            margin: "0 auto 1.5rem",
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
            boxShadow: "0 0 25px rgba(212,175,107,0.3)"
          }}
        >
          A
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.35rem 1rem",
            background: "rgba(212,175,107,0.12)",
            border: "1px solid rgba(212,175,107,0.3)",
            borderRadius: "100px",
            marginBottom: "1.5rem"
          }}
        >
          <Sparkles size={12} className="text-[#D4AF6B]" />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.68rem",
              fontWeight: "700",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#D4AF6B"
            }}
          >
            अतिथि देवो भव &bull; Your Sovereign Voyage Awaits
          </span>
        </div>

        <h2
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
          Your Next Chapter of{" "}
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
            Regal Stillness
          </span>{" "}
          Begins.
        </h2>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.95rem, 1.6vw, 1.125rem)",
            fontWeight: "300",
            lineHeight: "1.75",
            color: "rgba(240,237,230,0.8)",
            maxWidth: "650px",
            margin: "0 auto 2.5rem"
          }}
        >
          From secluded Lake Pichola marble suites to misty Nilgiri tea estates and starlit Thar dune pavilions, discover places where living Indian architecture and reverent hospitality exist in perfect harmony.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "1rem" }}>
          <Link
            to="/explore"
            className="btn-primary"
            style={{
              borderRadius: "4px",
              padding: "0.9rem 2.25rem",
              fontSize: "0.82rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              boxShadow: "0 6px 25px rgba(212,175,107,0.4)"
            }}
          >
            <span>Explore 53+ Sanctuaries</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            to="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.9rem 2rem",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(212,175,107,0.35)",
              borderRadius: "4px",
              color: "#FAF8F3",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.82rem",
              fontWeight: "600",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(212,175,107,0.15)";
              e.currentTarget.style.borderColor = "#D4AF6B";
              e.currentTarget.style.color = "#F0D08A";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.borderColor = "rgba(212,175,107,0.35)";
              e.currentTarget.style.color = "#FAF8F3";
            }}
          >
            <PhoneCall size={14} className="text-[#D4AF6B]" />
            <span>Speak with Concierge</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
