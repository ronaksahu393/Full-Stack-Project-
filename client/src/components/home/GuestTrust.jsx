import React from "react";
import { ShieldCheck, CalendarCheck, CreditCard, Headphones, Check, Zap } from "lucide-react";

export default function GuestTrust() {
  const pillars = [
    {
      icon: CalendarCheck,
      title: "Effortless Reservations",
      description: "Real-time suite availability, instant confirmation vouchers, and flexible cancellation policies — all managed through your personal guest dashboard.",
      accent: "#D4AF6B"
    },
    {
      icon: ShieldCheck,
      title: "Transparent Pricing",
      description: "No hidden resort surcharges or surprise taxes at arrival. Every rate you see represents the complete agreed stay figure — fully inclusive of GST.",
      accent: "#2ECC89"
    },
    {
      icon: CreditCard,
      title: "Encrypted & Secure",
      description: "All payments are processed via Razorpay's bank-grade encryption with server-side HMAC signature verification and instant digital receipts.",
      accent: "#5B8CFF"
    },
    {
      icon: Headphones,
      title: "24/7 Concierge",
      description: "Direct assistance from on-property concierge teams for dining, spa reservations, and private airport transfers.",
      accent: "#E8A04A"
    }
  ];

  return (
    <section
      style={{
        padding: "6rem 0",
        background: "linear-gradient(180deg, #0D1F3C 0%, #0A1628 100%)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Decorative background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          pointerEvents: "none"
        }}
      />

      {/* Glow center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(212,175,107,0.04) 0%, transparent 70%)",
          pointerEvents: "none"
        }}
      />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.25rem"
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "24px",
                height: "1px",
                background: "#D4AF6B"
              }}
            />
            <span className="section-label">The AtithiGo Standard</span>
            <span
              style={{
                display: "inline-block",
                width: "24px",
                height: "1px",
                background: "#D4AF6B"
              }}
            />
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              fontWeight: "400",
              color: "#FAF8F3",
              letterSpacing: "-0.01em",
              marginBottom: "1rem",
              lineHeight: "1.15"
            }}
          >
            Hospitality Rooted in{" "}
            <span style={{ fontStyle: "italic", color: "#D4AF6B" }}>Integrity & Care</span>
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "1rem",
              fontWeight: "300",
              color: "rgba(240,237,230,0.6)",
              maxWidth: "520px",
              margin: "0 auto",
              lineHeight: "1.7"
            }}
          >
            Every reservation and stay is held to rigorous standards of transparency, comfort, and genuine warmth.
          </p>
        </div>

        {/* Pillars Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem"
          }}
        >
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "6px",
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.borderColor = `${item.accent}40`;
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px ${item.accent}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Top accent line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)`,
                    opacity: 0.4
                  }}
                />

                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    background: `${item.accent}15`,
                    border: `1px solid ${item.accent}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Icon size={22} style={{ color: item.accent }} />
                </div>

                <div>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.25rem",
                      fontWeight: "500",
                      color: "#FAF8F3",
                      marginBottom: "0.625rem"
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: "300",
                      color: "rgba(240,237,230,0.6)",
                      lineHeight: "1.7"
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.6875rem",
                    fontWeight: "600",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: item.accent
                  }}
                >
                  <Check size={12} />
                  Guaranteed Standard
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
