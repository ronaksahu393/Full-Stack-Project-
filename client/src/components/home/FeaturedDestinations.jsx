import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Compass, ArrowRight, MapPin, RefreshCw, Flame, Sparkles, TrendingUp } from "lucide-react";
import { handleImageFallback } from "../../utils/imageFallback";

const MASTER_DESTINATIONS = [
  {
    name: "Jaipur",
    state: "Rajasthan",
    title: "Sandstone Havelis & Regal Fortresses",
    image: "/images/destinations/jaipur.jpg",
    stays: "12 Sanctuaries",
    tag: "Royal Heritage",
    pulse: "Trending: +42% Inquiries",
    rating: 4.96
  },
  {
    name: "Goa",
    state: "Konkan Coast",
    title: "Secluded Coastal Cliffs & Azure Terraces",
    image: "/images/destinations/goa.jpg",
    stays: "9 Beachfront Villas",
    tag: "Coastal Pavilions",
    pulse: "89% Booked This Weekend",
    rating: 4.94
  },
  {
    name: "Udaipur",
    state: "Rajasthan",
    title: "Lake Pichola Marble Residences",
    image: "/images/destinations/udaipur.jpg",
    stays: "8 Palaces",
    tag: "Lake Palaces",
    pulse: "VIP Guest Choice 2026",
    rating: 4.99
  },
  {
    name: "Munnar",
    state: "Kerala",
    title: "Misty Tea Slopes & Cloud Sanctuaries",
    image: "/images/destinations/munnar.jpg",
    stays: "7 Mountain Havens",
    tag: "Nature Sanctuaries",
    pulse: "Eco-Lodge of the Month",
    rating: 4.92
  },
  {
    name: "Varanasi",
    state: "Uttar Pradesh",
    title: "Ancient Ghats & Sacred Courtyard Havens",
    image: "/images/destinations/varanasi.jpg",
    stays: "5 Heritage Manors",
    tag: "Spiritual Culture",
    pulse: "Spiritual Solace Pick",
    rating: 4.91
  },
  {
    name: "Shimla",
    state: "Himachal Pradesh",
    title: "Himalayan Cedar & Ridge Verandas",
    image: "/images/destinations/shimla.jpg",
    stays: "6 Alpine Lodges",
    tag: "Mountain Lodges",
    pulse: "Snow Season Escapes",
    rating: 4.93
  },
  {
    name: "Jodhpur",
    state: "Rajasthan",
    title: "Blue City Vistas & Mehrangarh Ramparts",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=85",
    stays: "6 Fort Manors",
    tag: "Desert Bastion",
    pulse: "Trending Now in Heritage",
    rating: 4.95
  },
  {
    name: "Kashmir",
    state: "Jammu & Kashmir",
    title: "Dal Lake Carved Cedar Houseboats & Pine Slopes",
    image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=85",
    stays: "5 Alpine Chalets",
    tag: "Winter Wonderland",
    pulse: "🔥 96% Booked for Spring",
    rating: 4.98
  },
  {
    name: "Hampi",
    state: "Karnataka",
    title: "Monolithic Boulder Ruins & Tungabhadra Banks",
    image: "https://images.unsplash.com/photo-1600100397608-f010f4439c2c?auto=format&fit=crop&w=1200&q=85",
    stays: "4 Architectural Stays",
    tag: "UNESCO Wonder",
    pulse: "Curator's Architecture Pick",
    rating: 4.90
  },
  {
    name: "Coorg",
    state: "Karnataka",
    title: "Arabica Mist Estates & Rainforest Retreats",
    image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=85",
    stays: "5 Plantation Villas",
    tag: "Coffee Escapes",
    pulse: "Pure Serenity & Spa",
    rating: 4.93
  },
  {
    name: "Jaisalmer",
    state: "Rajasthan",
    title: "Golden Fort & Thar Dune Pavilions",
    image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=85",
    stays: "5 Desert Glamping Stays",
    tag: "Golden Mirage",
    pulse: "Starlit Night Safari Pick",
    rating: 4.97
  },
  {
    name: "Rishikesh",
    state: "Uttarakhand",
    title: "Holy Ganges Riverbanks & Yogic Sanctuaries",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
    stays: "6 Wellness Ashrams",
    tag: "Ayurveda & Zen",
    pulse: "Holistic Health Favorite",
    rating: 4.94
  }
];

// Fisher-Yates shuffle algorithm
function getRandomSubset(array, size = 6) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, size);
}

export default function FeaturedDestinations() {
  const [displayedDestinations, setDisplayedDestinations] = useState([]);
  const [isRotating, setIsRotating] = useState(false);
  const [pulseCount, setPulseCount] = useState(1);

  // Fluctuates dynamically on every refresh / initial mount
  useEffect(() => {
    setDisplayedDestinations(getRandomSubset(MASTER_DESTINATIONS, 6));
  }, []);

  const handleManualShuffle = () => {
    setIsRotating(true);
    setTimeout(() => {
      setDisplayedDestinations(getRandomSubset(MASTER_DESTINATIONS, 6));
      setPulseCount(prev => prev + 1);
      setIsRotating(false);
    }, 350);
  };

  return (
    <section
      style={{
        padding: "6rem 0",
        background: "linear-gradient(180deg, #071020 0%, #0A1628 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* Ambient gold glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(212,175,107,0.08) 0%, transparent 65%)",
          pointerEvents: "none"
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "350px",
          height: "350px",
          background: "radial-gradient(circle, rgba(23,63,53,0.18) 0%, transparent 70%)",
          pointerEvents: "none"
        }}
      />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "1.5rem",
            marginBottom: "3rem"
          }}
        >
          <div style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.85rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.3rem 0.75rem",
                  background: "rgba(212,175,107,0.1)",
                  border: "1px solid rgba(212,175,107,0.25)",
                  borderRadius: "100px",
                  fontSize: "0.68rem",
                  fontWeight: "600",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#D4AF6B"
                }}
              >
                <Flame size={12} className="text-[#D4AF6B] animate-pulse" />
                Live Trending Terrains
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#10B981",
                    display: "inline-block",
                    boxShadow: "0 0 8px #10B981"
                  }}
                />
              </div>
            </div>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
                fontWeight: "400",
                color: "#FAF8F3",
                letterSpacing: "-0.01em",
                lineHeight: "1.15",
                margin: 0
              }}
            >
              Trending Indian <span style={{ fontStyle: "italic", color: "#D4AF6B" }}>Destinations</span>
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.9375rem",
                fontWeight: "300",
                color: "rgba(240,237,230,0.65)",
                lineHeight: "1.7",
                marginTop: "0.75rem"
              }}
            >
              Explore popular Indian destinations, from royal Rajasthan palaces to serene coastal getaways and misty mountain retreats.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            {/* Interactive Refresh / Fluctuate Button */}
            <button
              onClick={handleManualShuffle}
              disabled={isRotating}
              title="Click to fluctuate and see other trending Indian destinations"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.15rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(212,175,107,0.3)",
                borderRadius: "3px",
                color: "#D4AF6B",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.72rem",
                fontWeight: "600",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: isRotating ? "wait" : "pointer",
                transition: "all 0.25s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(212,175,107,0.12)";
                e.currentTarget.style.borderColor = "#D4AF6B";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(212,175,107,0.3)";
              }}
            >
              <RefreshCw
                size={13}
                style={{
                  transform: isRotating ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
              />
              Fluctuate Trending ({displayedDestinations.length} Shown)
            </button>

            <Link
              to="/explore"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                fontWeight: "600",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#D4AF6B",
                textDecoration: "none",
                paddingBottom: "2px",
                borderBottom: "1px solid rgba(212,175,107,0.4)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#F0D08A"; e.currentTarget.style.borderColor = "#D4AF6B"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#D4AF6B"; e.currentTarget.style.borderColor = "rgba(212,175,107,0.4)"; }}
            >
              Browse All 53+ Sanctuaries
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Destination Cards with smooth transition */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.35rem",
            opacity: isRotating ? 0.35 : 1,
            transform: isRotating ? "scale(0.99)" : "scale(1)",
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {displayedDestinations.map((dest, idx) => (
            <Link
              key={`${dest.name}-${pulseCount}`}
              to={`/explore?destination=${encodeURIComponent(dest.name)}`}
              style={{
                position: "relative",
                height: "400px",
                display: "block",
                overflow: "hidden",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.07)",
                textDecoration: "none",
                transition: "all 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3)"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(212,175,107,0.45)";
                e.currentTarget.style.boxShadow = "0 22px 65px rgba(0,0,0,0.6), 0 0 25px rgba(212,175,107,0.15)";
                e.currentTarget.style.transform = "translateY(-6px)";
                const img = e.currentTarget.querySelector(".dest-img");
                if (img) img.style.transform = "scale(1.09)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.3)";
                e.currentTarget.style.transform = "translateY(0)";
                const img = e.currentTarget.querySelector(".dest-img");
                if (img) img.style.transform = "scale(1)";
              }}
            >
              <img
                className="dest-img"
                src={dest.image}
                alt={`${dest.name}, ${dest.state}`}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageFallback(e, "destination", dest.name)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)",
                  filter: "brightness(0.78) saturate(1.15)"
                }}
              />

              {/* Gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(7,16,32,0.96) 0%, rgba(10,22,40,0.4) 48%, transparent 75%)"
                }}
              />

              {/* Top Badges */}
              <div
                style={{
                  position: "absolute",
                  top: "1rem",
                  left: "1rem",
                  right: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem"
                }}
              >
                <div
                  style={{
                    padding: "0.32rem 0.75rem",
                    background: "rgba(10,22,40,0.7)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(212,175,107,0.35)",
                    borderRadius: "4px",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.62rem",
                    fontWeight: "700",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#D4AF6B"
                  }}
                >
                  {dest.tag}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.28rem 0.65rem",
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "4px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#F0D08A",
                    fontSize: "0.7rem",
                    fontWeight: "600"
                  }}
                >
                  <Sparkles size={11} className="text-[#D4AF6B]" />
                  <span>{dest.rating}</span>
                </div>
              </div>

              {/* Pulse Pill Badge */}
              <div
                style={{
                  position: "absolute",
                  top: "3.5rem",
                  left: "1rem",
                  padding: "0.22rem 0.6rem",
                  background: "rgba(212,175,107,0.18)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(212,175,107,0.4)",
                  borderRadius: "100px",
                  fontSize: "0.58rem",
                  fontWeight: "600",
                  letterSpacing: "0.08em",
                  color: "#FAF8F3",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem"
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#F59E0B",
                    display: "inline-block",
                    boxShadow: "0 0 6px #F59E0B"
                  }}
                />
                {dest.pulse}
              </div>

              {/* Bottom content */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "1.5rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.375rem" }}>
                  <MapPin size={12} style={{ color: "#D4AF6B", flexShrink: 0 }} />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.6875rem",
                      fontWeight: "600",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#D4AF6B"
                    }}
                  >
                    {dest.state}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.75rem",
                    fontWeight: "400",
                    color: "#FAF8F3",
                    margin: "0 0 0.35rem 0",
                    lineHeight: "1.2"
                  }}
                >
                  {dest.name}
                </h3>

                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.78rem",
                    fontWeight: "300",
                    color: "rgba(240,237,230,0.65)",
                    margin: "0 0 0.85rem 0",
                    lineHeight: "1.45"
                  }}
                >
                  {dest.title}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid rgba(255,255,255,0.08)"
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.72rem",
                      fontWeight: "500",
                      color: "rgba(240,237,230,0.75)"
                    }}
                  >
                    {dest.stays}
                  </span>

                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.6875rem",
                      fontWeight: "600",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#D4AF6B"
                    }}
                  >
                    Explore
                    <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
