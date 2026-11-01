import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import BookingSearchPanel from "./BookingSearchPanel";
import {
  ArrowRight,
  Star,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Compass,
  CheckCircle2,
  CloudSun,
  Wind,
  Volume2,
  VolumeX
} from "lucide-react";

// High-Resolution Local Master Imagery (Guaranteed Offline & Fast)
const HERO_SLIDES = [
  {
    image: "/images/hero/slide-1.jpg",
    location: "The Rajputana Royal Haveli",
    city: "Jaipur, Rajasthan",
    tagline: "Sandstone Courtyards & Heritage Suites",
    weather: "24°C • Starlit Thar Sky",
    ambience: "Sitar & Rose Petal Courtyard",
    accent: "#D4AF6B"
  },
  {
    image: "/images/hero/slide-2.jpg",
    location: "Azure Konkan Cliffside Villa",
    city: "Anjuna Coast, Goa",
    tagline: "Ocean Terraces & Infinity Horizon",
    weather: "27°C • Gentle Arabian Sea Breeze",
    ambience: "Bioluminescent Waves & Palms",
    accent: "#60A5FA"
  },
  {
    image: "/images/hero/slide-3.jpg",
    location: "Lake Pichola Marble Residence",
    city: "Udaipur, Rajasthan",
    tagline: "Regal Waterfront Balconies & Boat Transfers",
    weather: "22°C • Mirrored Waters & Lanterns",
    ambience: "Private Royal Boat Landing",
    accent: "#F0D08A"
  },
  {
    image: "/images/hotels/hotel-1.jpg",
    location: "Cloud Forest Tea Sanctuary",
    city: "Munnar, Kerala",
    tagline: "Mist-Swathed Highlands & Spice Sanctuaries",
    weather: "18°C • Nilgiri Mountain Mist",
    ambience: "Cardamom & Cedar Breeze",
    accent: "#34D399"
  },
  {
    image: "/images/hero/slide-5.jpg",
    location: "Kashmir Cedar Houseboat & Chalet",
    city: "Dal Lake, Srinagar",
    tagline: "Hand-Carved Walnut Decks & Snow Peaks",
    weather: "12°C • Alpine Himalayan Snow Air",
    ambience: "Chinar Leaves & Shikara Ripples",
    accent: "#A78BFA"
  }
];

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const navigate = useNavigate();

  const SLIDE_DURATION = 6500; // ms

  useEffect(() => {
    setTimeout(() => setLoaded(true), 120);
    resetSlideTimer();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(progressIntervalRef.current);
    };
  }, [activeSlide]);

  const resetSlideTimer = () => {
    clearInterval(timerRef.current);
    clearInterval(progressIntervalRef.current);
    setSlideProgress(0);

    const stepMs = 50;
    let elapsed = 0;
    progressIntervalRef.current = setInterval(() => {
      elapsed += stepMs;
      setSlideProgress(Math.min(100, (elapsed / SLIDE_DURATION) * 100));
    }, stepMs);

    timerRef.current = setTimeout(() => {
      handleNext();
    }, SLIDE_DURATION);
  };

  const handleNext = () => {
    if (transitioning) return;
    setTransitioning(true);
    setPrevSlide(activeSlide);
    setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length);
    setTimeout(() => { setPrevSlide(null); setTransitioning(false); }, 1000);
  };

  const handlePrev = () => {
    if (transitioning) return;
    setTransitioning(true);
    setPrevSlide(activeSlide);
    setActiveSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setTimeout(() => { setPrevSlide(null); setTransitioning(false); }, 1000);
  };

  const goToSlide = (idx) => {
    if (transitioning || idx === activeSlide) return;
    setTransitioning(true);
    setPrevSlide(activeSlide);
    setActiveSlide(idx);
    setTimeout(() => { setPrevSlide(null); setTransitioning(false); }, 1000);
  };

  const currentSlide = HERO_SLIDES[activeSlide];

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#071020"
      }}
    >
      {/* ── 16K ULTRA-FIDELITY SLIDES WITH SLOW CINEMATIC PAN ── */}
      {HERO_SLIDES.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: i === activeSlide ? 2 : i === prevSlide ? 1 : 0,
            opacity: i === activeSlide ? 1 : 0,
            transition: "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "opacity"
          }}
        >
          <img
            src={s.image}
            alt={s.location}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80";
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              transform: i === activeSlide ? "scale(1.08)" : "scale(1)",
              transition: "transform 8s ease-out",
              filter: "brightness(0.80) saturate(1.15)"
            }}
          />
        </div>
      ))}

      {/* ── BALANCED LUXURY GRADIENTS (LEGIBLE TEXT WHILE KEEPING PHOTO CLEARLY VISIBLE) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          background: `
            linear-gradient(to right, rgba(7,16,32,0.85) 0%, rgba(10,22,40,0.55) 48%, rgba(10,22,40,0.2) 100%),
            linear-gradient(to top, rgba(7,16,32,0.92) 0%, rgba(7,16,32,0.3) 35%, transparent 70%)
          `
        }}
      />

      {/* Golden Stardust Ambient Glows */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "5%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,107,0.14) 0%, transparent 68%)",
          zIndex: 3,
          pointerEvents: "none"
        }}
      />

      {/* ── MAIN CONTENT ── */}
      <div
        style={{
          position: "relative",
          zIndex: 4,
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "8.5rem 2rem 3rem",
          width: "100%"
        }}
      >
        <div style={{ maxWidth: "800px" }}>

          {/* Top Row: Sanskrit Pill & Live Weather Micro-Widget */}
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.45rem 1.15rem",
                background: "rgba(212,175,107,0.12)",
                border: "1px solid rgba(212,175,107,0.35)",
                borderRadius: "100px",
                backdropFilter: "blur(12px)",
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(12px)",
                transition: "all 0.7s ease"
              }}
            >
              <Sparkles size={13} className="text-[#D4AF6B]" />
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
                अतिथि देवो भव &bull; AtithiGo Atelier 2026
              </span>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#10B981",
                  boxShadow: "0 0 8px #10B981"
                }}
              />
            </div>

            {/* Live Atmosphere Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.42rem 0.95rem",
                background: "rgba(10,22,40,0.75)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "100px",
                backdropFilter: "blur(12px)",
                color: "#FAF8F3",
                fontSize: "0.68rem"
              }}
            >
              <CloudSun size={13} className="text-[#FBBF24]" />
              <span>{currentSlide.weather}</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(3.2rem, 7.5vw, 6rem)",
              fontWeight: "300",
              lineHeight: "1.04",
              color: "#FAF8F3",
              letterSpacing: "-0.025em",
              marginBottom: "1.35rem",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(18px)",
              transition: "all 0.8s ease 0.1s"
            }}
          >
            Where Every<br />
            <span
              style={{
                fontStyle: "italic",
                fontWeight: "400",
                background: "linear-gradient(120deg, #D4AF6B 0%, #F0D08A 35%, #D4AF6B 70%, #FAF8F3 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              Guest Is Royal.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)",
              fontWeight: "300",
              lineHeight: "1.75",
              color: "rgba(240,237,230,0.8)",
              marginBottom: "1.75rem",
              maxWidth: "640px",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(14px)",
              transition: "all 0.8s ease 0.2s"
            }}
          >
            Discover and book India's finest luxury hotels, royal heritage havelis, and scenic resorts with instant confirmation.
          </p>

          {/* Stats Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "2rem",
              paddingTop: "0.5rem",
              paddingBottom: "1.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              marginBottom: "1.5rem",
              opacity: loaded ? 1 : 0,
              transition: "all 0.8s ease 0.3s"
            }}
          >
            {[
              { label: "Curated Escapes", value: "53+" },
              { label: "Indian States", value: "14" },
              { label: "Guest Satisfaction", value: "4.98★" }
            ].map(stat => (
              <div key={stat.label} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.65rem", fontWeight: "600", color: "#D4AF6B", lineHeight: 1 }}>
                  {stat.value}
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6875rem", fontWeight: "500", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A9BAE" }}>
                  {stat.label}
                </span>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.4rem 0.85rem",
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: "4px",
                color: "#6EE7B7",
                fontSize: "0.72rem",
                fontWeight: "600"
              }}
            >
              <ShieldCheck size={14} className="text-[#10B981]" />
              <span>100% Verified Sanctuaries</span>
            </div>
          </div>
        </div>

        {/* ── SLIDE TIMELINE CONTROLLER BAR ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            marginTop: "1.5rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          {/* Active slide metadata */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(212,175,107,0.15)",
                border: "1px solid rgba(212,175,107,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#D4AF6B"
              }}
            >
              <MapPin size={16} />
            </div>
            <div>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.6875rem",
                  fontWeight: "700",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#D4AF6B",
                  display: "block"
                }}
              >
                {currentSlide.tagline}
              </span>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.15rem",
                  fontWeight: "400",
                  color: "#FAF8F3",
                  display: "block"
                }}
              >
                {currentSlide.location} &bull; {currentSlide.city}
              </span>
            </div>
          </div>

          {/* Navigation Controls & Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={handlePrev}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#F0EDE6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,107,0.25)"; e.currentTarget.style.borderColor = "#D4AF6B"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Slide dots with live fill animation */}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  style={{
                    position: "relative",
                    width: i === activeSlide ? "2.5rem" : "0.45rem",
                    height: "0.45rem",
                    borderRadius: i === activeSlide ? "3px" : "50%",
                    background: "rgba(255,255,255,0.25)",
                    border: "none",
                    cursor: "pointer",
                    overflow: "hidden",
                    padding: 0
                  }}
                >
                  {i === activeSlide && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: `${slideProgress}%`,
                        background: "#D4AF6B",
                        transition: "width 50ms linear"
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#F0EDE6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,107,0.25)"; e.currentTarget.style.borderColor = "#D4AF6B"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ── ULTRA-REALISTIC SEARCH PANEL ── */}
        <div
          style={{
            marginTop: "2.25rem",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.9s ease 0.5s"
          }}
        >
          <BookingSearchPanel />
        </div>
      </div>

      {/* Scroll indicator cue */}
      <div
        style={{
          position: "absolute",
          bottom: "1rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.25rem",
          animation: "float 3s ease-in-out infinite",
          pointerEvents: "none"
        }}
      >
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
          Scroll to Explore Sanctuaries
        </span>
        <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
      </div>
    </section>
  );
}
