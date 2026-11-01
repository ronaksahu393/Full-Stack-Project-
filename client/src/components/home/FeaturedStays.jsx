import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HotelCard from "../hotels/HotelCard";
import RoomCard from "../rooms/RoomCard";
import { api } from "../../services/api";
import { ArrowRight, Sparkles, RefreshCw } from "lucide-react";

export default function FeaturedStays() {
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setFetchError(null);
    api
      .getFeaturedHotels()
      .then((data) => {
        if (!isMounted) return;
        if (data && data.length > 0) {
          setHotels(data.slice(0, 3));
          setLoading(false);
        } else {
          api.getRooms({ featured: "true" }).then((rData) => {
            if (isMounted) { setRooms(rData.slice(0, 3)); setLoading(false); }
          }).catch(rErr => {
            if (isMounted) { setFetchError(rErr.message); setLoading(false); }
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setFetchError(err.message || "Failed to retrieve featured sanctuaries.");
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, [retryKey]);

  return (
    <section
      style={{
        padding: "6rem 0",
        background: "linear-gradient(180deg, #0A1628 0%, #0D1F3C 50%, #0A1628 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background subtle pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(212,175,107,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none"
        }}
      />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem", position: "relative", zIndex: 1 }}>

        {/* Section header */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "1.5rem",
            marginBottom: "3.5rem"
          }}
        >
          <div style={{ maxWidth: "600px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Sparkles size={13} style={{ color: "#D4AF6B" }} />
              <span className="section-label">India-Wide Curated Selection</span>
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
              Featured{" "}
              <span style={{ fontStyle: "italic", color: "#D4AF6B" }}>Sanctuaries</span>{" "}
              & Estates
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.9375rem",
                fontWeight: "300",
                color: "rgba(240,237,230,0.55)",
                lineHeight: "1.7",
                marginTop: "0.75rem"
              }}
            >
              Explore our handpicked collection of verified luxury rooms and suites across top Indian destinations.
            </p>
          </div>

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
              transition: "all 0.2s ease",
              alignSelf: "flex-end"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "#F0D08A";
              e.currentTarget.style.borderColor = "#D4AF6B";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "#D4AF6B";
              e.currentTarget.style.borderColor = "rgba(212,175,107,0.4)";
            }}
          >
            Explore All Stays
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {[1, 2, 3].map(n => (
              <div key={n} className="skeleton" style={{ height: "380px", borderRadius: "6px" }} />
            ))}
          </div>
        ) : hotels.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {hotels.map(hotel => (
              <div key={hotel._id || hotel.slug} style={{ opacity: 1 }}>
                <HotelCard hotel={hotel} />
              </div>
            ))}
          </div>
        ) : rooms.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {rooms.map(room => (
              <div key={room._id}>
                <RoomCard room={room} />
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              background: "rgba(224,82,82,0.06)",
              border: "1px solid rgba(224,82,82,0.2)",
              borderRadius: "6px",
              maxWidth: "500px",
              margin: "0 auto"
            }}
          >
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.375rem",
                color: "#FAF8F3",
                marginBottom: "0.5rem"
              }}
            >
              Curated Selection Unavailable
            </h3>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.875rem",
                color: "rgba(240,237,230,0.5)",
                marginBottom: "1.25rem"
              }}
            >
              {fetchError}
            </p>
            <button
              onClick={() => setRetryKey(k => k + 1)}
              className="btn-outline"
              style={{ cursor: "pointer", fontSize: "0.75rem" }}
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              border: "1px dashed rgba(255,255,255,0.1)",
              borderRadius: "6px"
            }}
          >
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", color: "rgba(240,237,230,0.4)", fontWeight: "300" }}>
              No stays currently featured. Please explore our complete catalog.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
