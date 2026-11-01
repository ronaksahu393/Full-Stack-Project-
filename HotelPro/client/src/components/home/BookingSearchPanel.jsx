import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  Building2,
  Map,
  Sparkles,
  ChevronDown,
  Plus,
  Minus,
  Check,
  Compass,
  Moon,
  Clock
} from "lucide-react";
import { api } from "../../services/api";

const getTodayDate = () => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getNextDay = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const calculateNights = (inDate, outDate) => {
  if (!inDate || !outDate) return 0;
  const d1 = new Date(inDate);
  const d2 = new Date(outDate);
  const diffTime = d2 - d1;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const CATEGORIES = [
  { id: "All", label: "All Sanctuaries" },
  { id: "Heritage Suite", label: "🏰 Royal Havelis" },
  { id: "Oceanfront Villa", label: "🌊 Coastal Villas" },
  { id: "Mountain Suite", label: "🏔️ Alpine Lodges" },
  { id: "Penthouse", label: "✨ Urban Penthouses" }
];

export default function BookingSearchPanel({ className = "" }) {
  const navigate = useNavigate();
  const todayDate = getTodayDate();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [category, setCategory] = useState("All");
  const [dateError, setDateError] = useState("");

  // Guest popover state
  const [showGuestPopover, setShowGuestPopover] = useState(false);
  const guestPopoverRef = useRef(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const nightsCount = calculateNights(checkIn, checkOut);

  useEffect(() => {
    if (!destination || destination.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      api.getAutocomplete(destination).then((data) => {
        setSuggestions(data || []);
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [destination]);

  // Click outside listener for dropdown and guest popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (guestPopoverRef.current && !guestPopoverRef.current.contains(e.target)) {
        setShowGuestPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (sug) => {
    if (sug.type === "city") {
      setDestination(sug.city);
    } else if (sug.type === "state") {
      setDestination(sug.state);
    } else if (sug.type === "hotel") {
      setDestination(sug.label);
    }
    setShowDropdown(false);
  };

  const handleCheckInChange = (val) => {
    setCheckIn(val);
    setDateError("");
    if (val && checkOut && checkOut <= val) {
      setCheckOut(getNextDay(val));
    }
  };

  const handleCheckOutChange = (val) => {
    setCheckOut(val);
    if (checkIn && val && val <= checkIn) {
      setDateError("Departure must be at least 1 night after arrival.");
    } else {
      setDateError("");
    }
  };

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (checkIn && checkOut && checkOut <= checkIn) {
      setDateError("Departure must be at least 1 night after arrival.");
      return;
    }
    setDateError("");
    const params = new URLSearchParams();
    if (destination.trim()) params.append("destination", destination.trim());
    if (category && category !== "All") params.append("category", category);
    if (adults) params.append("adults", adults);
    if (children && children > 0) params.append("children", children);
    if (rooms && rooms > 1) params.append("rooms", rooms);
    if (checkIn) params.append("checkIn", checkIn);
    if (checkOut) params.append("checkOut", checkOut);

    navigate(`/explore?${params.toString()}`);
  };

  const quickPills = [
    { label: "Jaipur Havelis", query: "Jaipur" },
    { label: "Udaipur Palaces", query: "Udaipur" },
    { label: "Goa Azure Coast", query: "Goa" },
    { label: "Kerala Mist Estates", query: "Kerala" },
    { label: "Kashmir Houseboats", query: "Kashmir" },
    { label: "Shimla Pines", query: "Shimla" }
  ];

  return (
    <div
      className={className}
      style={{
        width: "100%",
        maxWidth: "1280px",
        margin: "0 auto",
        position: "relative",
        zIndex: 20
      }}
    >
      {/* ── LUXURY GLASS CONTAINER ── */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(8, 16, 32, 0.92) 0%, rgba(12, 26, 50, 0.88) 100%)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(212, 175, 107, 0.35)",
          borderRadius: "8px",
          padding: "1.75rem 2rem 1.5rem",
          boxShadow: "0 25px 70px rgba(0, 0, 0, 0.65), 0 0 45px rgba(212, 175, 107, 0.12)",
          position: "relative"
        }}
      >
        {/* Category Filter Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            overflowX: "auto",
            paddingBottom: "1.25rem",
            marginBottom: "1.25rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            scrollbarWidth: "none"
          }}
        >
          <span style={{ fontSize: "0.65rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.14em", color: "#D4AF6B", marginRight: "0.5rem", whiteSpace: "nowrap" }}>
            Select Genre:
          </span>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              style={{
                padding: "0.35rem 0.85rem",
                background: category === cat.id ? "rgba(212, 175, 107, 0.22)" : "rgba(255, 255, 255, 0.04)",
                border: `1px solid ${category === cat.id ? "#D4AF6B" : "rgba(255, 255, 255, 0.1)"}`,
                borderRadius: "100px",
                color: category === cat.id ? "#FAF8F3" : "rgba(240, 237, 230, 0.7)",
                fontSize: "0.72rem",
                fontWeight: category === cat.id ? "600" : "400",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Inputs Grid */}
        <form onSubmit={handleSearch}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "1rem",
              alignItems: "center"
            }}
          >
            {/* 1. Destination with Autocomplete */}
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.68rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#D4AF6B",
                  marginBottom: "0.45rem"
                }}
              >
                <MapPin size={12} className="text-[#D4AF6B]" />
                <span>Destination or Palace</span>
              </label>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "5px",
                  padding: "0.75rem 1rem",
                  transition: "border-color 0.2s ease"
                }}
              >
                <input
                  type="text"
                  value={destination}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setShowDropdown(true);
                  }}
                  placeholder="Jaipur, Goa, Udaipur, Kerala..."
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#FAF8F3",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    fontFamily: "'Inter', sans-serif"
                  }}
                />
              </div>

              {/* Autocomplete Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    zIndex: 1500,
                    background: "rgba(8, 16, 32, 0.98)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(212, 175, 107, 0.35)",
                    borderRadius: "6px",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
                    maxHeight: "280px",
                    overflowY: "auto"
                  }}
                >
                  <div style={{ padding: "0.6rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#D4AF6B", fontWeight: "700" }}>
                    Curated Destinations
                  </div>
                  {suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(sug)}
                      style={{
                        padding: "0.75rem 1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background 0.15s ease"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(212,175,107,0.12)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {sug.type === "city" && <MapPin size={14} className="text-[#D4AF6B]" />}
                        {sug.type === "state" && <Map size={14} className="text-[#38BDF8]" />}
                        {sug.type === "hotel" && <Building2 size={14} className="text-[#F59E0B]" />}
                        <div>
                          <div style={{ color: "#FAF8F3", fontSize: "0.82rem", fontWeight: "600" }}>
                            {sug.label}
                          </div>
                          {sug.type === "hotel" && (
                            <div style={{ color: "rgba(240,237,230,0.5)", fontSize: "0.68rem" }}>
                              {sug.city}, {sug.state}
                            </div>
                          )}
                        </div>
                      </div>
                      {sug.propertyCount && (
                        <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem", background: "rgba(255,255,255,0.08)", borderRadius: "100px", color: "rgba(240,237,230,0.7)" }}>
                          {sug.propertyCount} properties
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Arrival Date */}
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.68rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#D4AF6B",
                  marginBottom: "0.45rem"
                }}
              >
                <Calendar size={12} className="text-[#D4AF6B]" />
                <span>Check-in Date</span>
              </label>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "5px",
                  padding: "0.75rem 1rem"
                }}
              >
                <input
                  type="date"
                  min={todayDate}
                  value={checkIn}
                  onChange={(e) => handleCheckInChange(e.target.value)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#FAF8F3",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    fontFamily: "'Inter', sans-serif",
                    colorScheme: "dark"
                  }}
                />
              </div>
            </div>

            {/* 3. Departure Date + Live Nights Badge */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.45rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.68rem",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "#D4AF6B"
                  }}
                >
                  <Moon size={12} className="text-[#D4AF6B]" />
                  <span>Check-out Date</span>
                </label>
                {nightsCount > 0 && (
                  <span style={{ fontSize: "0.62rem", color: "#34D399", fontWeight: "600", background: "rgba(52,211,153,0.12)", padding: "0.15rem 0.45rem", borderRadius: "100px", border: "1px solid rgba(52,211,153,0.3)" }}>
                    ✨ {nightsCount} Night{nightsCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "5px",
                  padding: "0.75rem 1rem"
                }}
              >
                <input
                  type="date"
                  min={checkIn ? getNextDay(checkIn) : todayDate}
                  value={checkOut}
                  onChange={(e) => handleCheckOutChange(e.target.value)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#FAF8F3",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    fontFamily: "'Inter', sans-serif",
                    colorScheme: "dark"
                  }}
                />
              </div>
            </div>

            {/* 4. Guests & Suites Counter Popover */}
            <div ref={guestPopoverRef} style={{ position: "relative" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.68rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#D4AF6B",
                  marginBottom: "0.45rem"
                }}
              >
                <Users size={12} className="text-[#D4AF6B]" />
                <span>Guests &amp; Suites</span>
              </label>

              <button
                type="button"
                onClick={() => setShowGuestPopover(!showGuestPopover)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "5px",
                  padding: "0.75rem 1rem",
                  color: "#FAF8F3",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <span>{adults} Adults{children > 0 ? `, ${children} Children` : ""}, {rooms} Room{rooms > 1 ? "s" : ""}</span>
                <ChevronDown size={14} style={{ color: "#D4AF6B", transform: showGuestPopover ? "rotate(180deg)" : "rotate(0)" }} />
              </button>

              {/* Guest Controls Popover */}
              {showGuestPopover && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    width: "260px",
                    zIndex: 1500,
                    background: "rgba(8, 16, 32, 0.98)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(212, 175, 107, 0.35)",
                    borderRadius: "6px",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
                    padding: "1rem"
                  }}
                >
                  {/* Adults */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                    <div>
                      <div style={{ color: "#FAF8F3", fontSize: "0.82rem", fontWeight: "600" }}>Adults</div>
                      <div style={{ color: "rgba(240,237,230,0.5)", fontSize: "0.68rem" }}>Age 12+</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#FAF8F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ color: "#FAF8F3", fontWeight: "600", fontSize: "0.85rem", minWidth: "16px", textAlign: "center" }}>{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(Math.min(8, adults + 1))}
                        style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#FAF8F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                    <div>
                      <div style={{ color: "#FAF8F3", fontSize: "0.82rem", fontWeight: "600" }}>Children</div>
                      <div style={{ color: "rgba(240,237,230,0.5)", fontSize: "0.68rem" }}>Ages 0 - 11</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#FAF8F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ color: "#FAF8F3", fontWeight: "600", fontSize: "0.85rem", minWidth: "16px", textAlign: "center" }}>{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(Math.min(6, children + 1))}
                        style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#FAF8F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div>
                      <div style={{ color: "#FAF8F3", fontSize: "0.82rem", fontWeight: "600" }}>Suites</div>
                      <div style={{ color: "rgba(240,237,230,0.5)", fontSize: "0.68rem" }}>Rooms needed</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => setRooms(Math.max(1, rooms - 1))}
                        style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#FAF8F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ color: "#FAF8F3", fontWeight: "600", fontSize: "0.85rem", minWidth: "16px", textAlign: "center" }}>{rooms}</span>
                      <button
                        type="button"
                        onClick={() => setRooms(Math.min(5, rooms + 1))}
                        style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#FAF8F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowGuestPopover(false)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      background: "rgba(212, 175, 107, 0.2)",
                      border: "1px solid #D4AF6B",
                      borderRadius: "4px",
                      color: "#FAF8F3",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Confirm Selection
                  </button>
                </div>
              )}
            </div>

            {/* 5. Search Action Button */}
            <div style={{ marginTop: "1.45rem" }}>
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "0.85rem 1.5rem",
                  background: "linear-gradient(135deg, #D4AF6B 0%, #B8924A 100%)",
                  border: "none",
                  borderRadius: "5px",
                  color: "#071020",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.6rem",
                  boxShadow: "0 4px 20px rgba(212, 175, 107, 0.35)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(212, 175, 107, 0.55)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(212, 175, 107, 0.35)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span>Search Sanctuaries</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </form>

        {dateError && (
          <div style={{ marginTop: "0.75rem", color: "#F87171", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span>⚠️ {dateError}</span>
          </div>
        )}

        {/* Quick Suggestion Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginTop: "1.25rem",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)"
          }}
        >
          <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(240, 237, 230, 0.5)", marginRight: "0.25rem" }}>
            Curated Indian Escapes:
          </span>
          {quickPills.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setDestination(p.query);
                handleSearch();
              }}
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "100px",
                padding: "0.25rem 0.65rem",
                fontSize: "0.7rem",
                color: "rgba(240, 237, 230, 0.8)",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(212, 175, 107, 0.15)";
                e.currentTarget.style.borderColor = "#D4AF6B";
                e.currentTarget.style.color = "#F0D08A";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.color = "rgba(240, 237, 230, 0.8)";
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
