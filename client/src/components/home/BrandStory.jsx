import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Compass, Sparkles, Gem, ShieldCheck, Crown } from "lucide-react";
import { handleImageFallback } from "../../utils/imageFallback";

export default function BrandStory() {
  return (
    <section
      style={{
        padding: "6.5rem 0",
        background: "linear-gradient(180deg, #071020 0%, #0A1628 50%, #071020 100%)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* Decorative radial lighting */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "550px",
          height: "550px",
          background: "radial-gradient(circle, rgba(212,175,107,0.08) 0%, transparent 65%)",
          pointerEvents: "none"
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(23,63,53,0.15) 0%, transparent 70%)",
          pointerEvents: "none"
        }}
      />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem", position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "4.5rem",
            alignItems: "center"
          }}
        >
          {/* Photo Column with 16K Master Imagery */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "relative",
                borderRadius: "6px",
                overflow: "hidden",
                border: "1px solid rgba(212,175,107,0.28)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.6)"
              }}
              className="editorial-zoom"
            >
              <img
                src="/images/hotels/hotel-7.jpg"
                alt="AtithiGo Royal Palace Heritage"
                style={{ width: "100%", height: "480px", objectFit: "cover", display: "block", filter: "brightness(0.85) saturate(1.15)" }}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageFallback(e, "hotel", "AtithiGo Royal Palace")}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(7,16,32,0.85) 0%, rgba(7,16,32,0.2) 50%, transparent 80%)"
                }}
              />
            </div>

            {/* Floating Stat Card */}
            <div
              style={{
                position: "absolute",
                bottom: "-1.75rem",
                right: "-1.25rem",
                background: "rgba(10,22,40,0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(212,175,107,0.35)",
                borderRadius: "6px",
                padding: "1.35rem 1.75rem",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {[
                  { value: "53+", label: "Verified Sanctuaries" },
                  { value: "14", label: "Indian States" },
                  { value: "2026", label: "Living Heritage Charter" }
                ].map(stat => (
                  <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "1.5rem",
                        fontWeight: "600",
                        color: "#D4AF6B",
                        lineHeight: 1,
                        minWidth: "48px"
                      }}
                    >
                      {stat.value}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.7rem",
                        fontWeight: "500",
                        color: "rgba(240,237,230,0.75)",
                        letterSpacing: "0.08em"
                      }}
                    >
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gold Corner Accent */}
            <div
              style={{
                position: "absolute",
                top: "-0.85rem",
                left: "-0.85rem",
                width: "70px",
                height: "70px",
                borderTop: "2px solid rgba(212,175,107,0.5)",
                borderLeft: "2px solid rgba(212,175,107,0.5)"
              }}
            />
          </div>

          {/* Text Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Compass size={14} style={{ color: "#D4AF6B" }} />
              <span className="section-label">The AtithiGo Heritage Story</span>
            </div>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.25rem, 4.5vw, 3.6rem)",
                fontWeight: "400",
                color: "#FAF8F3",
                letterSpacing: "-0.02em",
                lineHeight: "1.12",
                margin: 0
              }}
            >
              Crafted for Stillness,{" "}
              <span style={{ fontStyle: "italic", color: "#D4AF6B" }}>Space,</span>{" "}
              and Human Grace.
            </h2>

            <div
              style={{
                width: "80px",
                height: "1px",
                background: "linear-gradient(90deg, #D4AF6B, transparent)"
              }}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                "In an era of formulaic luxury, AtithiGo was born with a singular purpose — to reconnect hospitality with architectural honesty, natural landscapes, and unhurried human presence.",
                "Every stay in our collection is shaped by indigenous materials: hand-dressed sandstone, lime-washed courtyards, teak compounds, and artisanal handloom textiles. We curate properties that celebrate their Indian surroundings rather than insulate guests from them.",
                "From the moment your reservation is confirmed, your journey is seamlessly orchestrated by a dedicated concierge team — ensuring every detail is an act of intentional care."
              ].map((para, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.9375rem",
                    fontWeight: "300",
                    color: "rgba(240,237,230,0.75)",
                    lineHeight: "1.8",
                    margin: 0
                  }}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Features Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", paddingTop: "0.5rem" }}>
              {[
                "Handpicked by our architectural curatorial committee",
                "100% verified provenance and local heritage stewardship",
                "Dedicated royal butler desk available 24 hours daily"
              ].map(feat => (
                <div key={feat} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#D4AF6B",
                      boxShadow: "0 0 8px #D4AF6B",
                      flexShrink: 0
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: "400",
                      color: "rgba(240,237,230,0.85)"
                    }}
                  >
                    {feat}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "1.5rem", paddingTop: "0.75rem" }}>
              <Link to="/about" className="btn-primary" style={{ borderRadius: "4px", padding: "0.75rem 1.75rem" }}>
                <span>Read Full Philosophy</span>
                <ArrowRight size={14} />
              </Link>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.05rem",
                  fontStyle: "italic",
                  color: "#D4AF6B"
                }}
              >
                ✦ अतिथि देवो भव &bull; Where the Guest is Divine
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
