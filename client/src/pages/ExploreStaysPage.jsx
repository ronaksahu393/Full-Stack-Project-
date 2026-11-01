import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Slider,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Pagination,
  Drawer,
  IconButton,
  Divider,
  Skeleton,
  Alert
} from "@mui/material";
import {
  Compass,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  RotateCcw,
  Calendar,
  Users,
  X as CloseIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Info
} from "lucide-react";
import HotelCard from "../components/hotels/HotelCard";
import { api } from "../services/api";
import { formatINR } from "../utils/currency";

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

export default function ExploreStaysPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const todayDate = getTodayDate();

  // Search parameters
  const [destination, setDestination] = useState(
    searchParams.get("destination") || searchParams.get("search") || ""
  );
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get("maxPrice")) || 35000);
  const [starRating, setStarRating] = useState(searchParams.get("starRating") || "All");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "All");
  const [sort, setSort] = useState(searchParams.get("sort") || "recommended");
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
  const [adults, setAdults] = useState(searchParams.get("adults") || "2");
  const [children, setChildren] = useState(searchParams.get("children") || "0");
  const [rooms, setRooms] = useState(searchParams.get("rooms") || "1");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [dateError, setDateError] = useState("");

  // Amenity filters
  const [freeWifi, setFreeWifi] = useState(searchParams.get("freeWifi") === "true");
  const [swimmingPool, setSwimmingPool] = useState(searchParams.get("swimmingPool") === "true");
  const [freeBreakfast, setFreeBreakfast] = useState(searchParams.get("freeBreakfast") === "true");
  const [petFriendly, setPetFriendly] = useState(searchParams.get("petFriendly") === "true");

  // Mobile filter drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Results state
  const [hotels, setHotels] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [normalizedDest, setNormalizedDest] = useState("");
  const [searchError, setSearchError] = useState(null);
  const [inventoryMode, setInventoryMode] = useState("demo");
  const [inventoryDisclaimer, setInventoryDisclaimer] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const isInitialMount = useRef(true);

  // Autocomplete effect
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

  // Click outside to close dropdown
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Synchronize URL search params (preventing duplicate history replacements)
  useEffect(() => {
    const params = {};
    if (destination.trim()) params.destination = destination.trim();
    if (category && category !== "All") params.category = category;
    if (maxPrice && maxPrice < 35000) params.maxPrice = maxPrice.toString();
    if (starRating && starRating !== "All") params.starRating = starRating;
    if (minRating && minRating !== "All") params.minRating = minRating;
    if (sort && sort !== "recommended") params.sort = sort;
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    if (adults && adults !== "2") params.adults = adults;
    if (children && children !== "0") params.children = children;
    if (rooms && rooms !== "1") params.rooms = rooms;
    if (page > 1) params.page = page.toString();

    if (freeWifi) params.freeWifi = "true";
    if (swimmingPool) params.swimmingPool = "true";
    if (freeBreakfast) params.freeBreakfast = "true";
    if (petFriendly) params.petFriendly = "true";

    const newQueryString = new URLSearchParams(params).toString();
    if (newQueryString !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [
    destination,
    category,
    maxPrice,
    starRating,
    minRating,
    sort,
    checkIn,
    checkOut,
    adults,
    children,
    rooms,
    page,
    freeWifi,
    swimmingPool,
    freeBreakfast,
    petFriendly
  ]);

  // Reset pagination to page 1 whenever any search filter changes (after initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPage(1);
  }, [
    destination,
    category,
    maxPrice,
    starRating,
    minRating,
    sort,
    checkIn,
    checkOut,
    adults,
    children,
    rooms,
    freeWifi,
    swimmingPool,
    freeBreakfast,
    petFriendly
  ]);

  // Query API whenever filters or pagination change
  useEffect(() => {
    let isCancelled = false;

    // Check for invalid date range (departure <= arrival)
    if (checkIn && checkOut && checkOut <= checkIn) {
      setDateError("Departure date must be at least 1 night after arrival date.");
      setHotels([]);
      setTotalCount(0);
      setTotalPages(1);
      setLoading(false);
      return;
    } else {
      setDateError("");
    }

    setLoading(true);
    setSearchError(null);

    const query = {
      destination: destination.trim(),
      category: category !== "All" ? category : undefined,
      maxPrice: maxPrice < 35000 ? maxPrice : undefined,
      starRating: starRating !== "All" ? starRating : undefined,
      minRating: minRating !== "All" ? minRating : undefined,
      sort,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      adults,
      children: children !== "0" ? children : undefined,
      rooms: rooms !== "1" ? rooms : undefined,
      page,
      limit: 6,
      freeWifi: freeWifi ? "true" : undefined,
      swimmingPool: swimmingPool ? "true" : undefined,
      freeBreakfast: freeBreakfast ? "true" : undefined,
      petFriendly: petFriendly ? "true" : undefined
    };

    api
      .searchHotels(query)
      .then((res) => {
        if (!isCancelled) {
          setHotels(res.hotels || []);
          setTotalCount(res.totalCount || res.total || 0);
          setTotalPages(res.totalPages || 1);
          setNormalizedDest(res.normalizedDestination || destination);
          setInventoryMode(res.providerMode || (res.isLiveInventory ? "live" : "demo"));
          setInventoryDisclaimer(res.inventoryDisclaimer || "");
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setHotels([]);
          setTotalCount(0);
          setTotalPages(1);
          setInventoryMode("offline");
          setInventoryDisclaimer("");
          setSearchError(err.message || "Unable to retrieve properties at this moment.");
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    destination,
    category,
    maxPrice,
    starRating,
    minRating,
    sort,
    checkIn,
    checkOut,
    adults,
    children,
    rooms,
    page,
    freeWifi,
    swimmingPool,
    freeBreakfast,
    petFriendly,
    retryKey
  ]);

  const handleReset = () => {
    setDestination("");
    setCategory("All");
    setMaxPrice(35000);
    setStarRating("All");
    setMinRating("All");
    setSort("recommended");
    setCheckIn("");
    setCheckOut("");
    setAdults("2");
    setChildren("0");
    setRooms("1");
    setPage(1);
    setDateError("");
    setFreeWifi(false);
    setSwimmingPool(false);
    setFreeBreakfast(false);
    setPetFriendly(false);
  };

  const hasActiveFilters =
    Boolean(destination) ||
    category !== "All" ||
    maxPrice < 35000 ||
    starRating !== "All" ||
    minRating !== "All" ||
    Boolean(checkIn) ||
    Boolean(checkOut) ||
    freeWifi ||
    swimmingPool ||
    freeBreakfast ||
    petFriendly;

  // Render Filter Content (Shared between desktop aside & mobile drawer)
  const renderFilterPanel = () => (
    <Box sx={{ spaceY: 3 }}>
      {/* Budget Slider */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 700, fontSize: "0.6875rem" }}>
            Budget Per Night
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
            {formatINR(maxPrice)}
          </Typography>
        </Box>
        <Slider
          value={maxPrice}
          min={2000}
          max={35000}
          step={500}
          onChange={(_, val) => {
            setMaxPrice(val);
            setPage(1);
          }}
          sx={{
            color: "primary.main",
            "& .MuiSlider-thumb": {
              backgroundColor: "secondary.main",
              borderRadius: 0,
              width: 14,
              height: 14
            }
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6875rem" }}>₹2,000</Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6875rem" }}>₹35,000+</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Official Star Category */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 700, fontSize: "0.6875rem", display: "block", mb: 1 }}>
          Official Star Category
        </Typography>
        <RadioGroup
          value={starRating}
          onChange={(e) => {
            setStarRating(e.target.value);
            setPage(1);
          }}
        >
          {[
            { label: "All Categories", value: "All" },
            { label: "5★ Verified Luxury", value: "5" },
            { label: "4★ Verified Boutique", value: "4" },
            { label: "3★ Verified Heritage", value: "3" }
          ].map((item) => (
            <FormControlLabel
              key={item.value}
              value={item.value}
              control={<Radio size="small" sx={{ color: "divider", "&.Mui-checked": { color: "primary.main" } }} />}
              label={<Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "text.primary" }}>{item.label}</Typography>}
              sx={{ my: -0.25 }}
            />
          ))}
        </RadioGroup>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Guest Review Rating */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 700, fontSize: "0.6875rem", display: "block", mb: 1 }}>
          Guest Review Rating
        </Typography>
        <RadioGroup
          value={minRating}
          onChange={(e) => {
            setMinRating(e.target.value);
            setPage(1);
          }}
        >
          {[
            { label: "Any Rating", value: "All" },
            { label: "4.8+ Exceptional", value: "4.8" },
            { label: "4.5+ Excellent", value: "4.5" },
            { label: "4.0+ Very Good", value: "4.0" }
          ].map((item) => (
            <FormControlLabel
              key={item.value}
              value={item.value}
              control={<Radio size="small" sx={{ color: "divider", "&.Mui-checked": { color: "primary.main" } }} />}
              label={<Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "text.primary" }}>{item.label}</Typography>}
              sx={{ my: -0.25 }}
            />
          ))}
        </RadioGroup>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Essential Amenities */}
      <Box>
        <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 700, fontSize: "0.6875rem", display: "block", mb: 1 }}>
          Essential Amenities
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={freeWifi}
                onChange={(e) => {
                  setFreeWifi(e.target.checked);
                  setPage(1);
                }}
                size="small"
                sx={{ color: "divider", "&.Mui-checked": { color: "primary.main" } }}
              />
            }
            label={<Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>Free High-Speed Wi-Fi</Typography>}
            sx={{ my: -0.25 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={swimmingPool}
                onChange={(e) => {
                  setSwimmingPool(e.target.checked);
                  setPage(1);
                }}
                size="small"
                sx={{ color: "divider", "&.Mui-checked": { color: "primary.main" } }}
              />
            }
            label={<Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>Swimming Pool</Typography>}
            sx={{ my: -0.25 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={freeBreakfast}
                onChange={(e) => {
                  setFreeBreakfast(e.target.checked);
                  setPage(1);
                }}
                size="small"
                sx={{ color: "divider", "&.Mui-checked": { color: "primary.main" } }}
              />
            }
            label={<Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>Complimentary Breakfast</Typography>}
            sx={{ my: -0.25 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={petFriendly}
                onChange={(e) => {
                  setPetFriendly(e.target.checked);
                  setPage(1);
                }}
                size="small"
                sx={{ color: "divider", "&.Mui-checked": { color: "primary.main" } }}
              />
            }
            label={<Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>Pet-Friendly Policies</Typography>}
            sx={{ my: -0.25 }}
          />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ pt: { xs: 12, md: 16 }, pb: 12, bgcolor: "background.default", minHeight: "100vh" }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }}>
        {/* Page Header */}
        <Box sx={{ maxWidth: 780, mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Compass size={16} color="#C4A46B" />
            <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 700, fontSize: "0.75rem" }}>
              India Hotel Discovery &bull; Verified Inventory
            </Typography>
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
              fontWeight: 500,
              color: "primary.main",
              lineHeight: 1.15,
              mb: 1.5
            }}
          >
            Find Stays Across India
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 300 }}>
            Search authentic heritage havelis, coastal resorts, and serene hill stations across Indian states and union territories.
          </Typography>
        </Box>

        {/* Top Search Console with Autocomplete */}
        <Paper
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: 4,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 6px 24px rgba(23, 63, 53, 0.05)"
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
            }}
          >
            <Grid container spacing={2} alignItems="center">
              {/* Destination Input with Autocomplete */}
              <Grid item xs={12} lg={4}>
                <Box ref={dropdownRef} sx={{ position: "relative" }}>
                  <Typography variant="overline" sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "secondary.main", fontWeight: 700, fontSize: "0.6875rem", mb: 0.5 }}>
                    <MapPin size={13} color="#C4A46B" /> Destination / City / Locality
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={destination}
                    onFocus={() => setShowDropdown(true)}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setShowDropdown(true);
                      setPage(1);
                    }}
                    placeholder="Indore, Candolim, Jaipur, Mumbai, Goa..."
                    autoComplete="off"
                    InputProps={{
                      sx: { bgcolor: "background.default", fontSize: "0.875rem" }
                    }}
                  />

                  {/* Autocomplete Dropdown */}
                  {showDropdown && suggestions.length > 0 && (
                    <Paper
                      sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        mt: 0.5,
                        zIndex: 1300,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "0 12px 30px rgba(23, 63, 53, 0.14)",
                        maxHeight: 240,
                        overflowY: "auto",
                        borderRadius: 0
                      }}
                    >
                      {suggestions.map((sug, idx) => (
                        <Box
                          key={idx}
                          onClick={() => {
                            setDestination(sug.locality || sug.city || sug.state || sug.label);
                            setShowDropdown(false);
                            setPage(1);
                          }}
                          sx={{
                            px: 2,
                            py: 1.25,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            "&:hover": { bgcolor: "background.default" }
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main", fontSize: "0.8125rem" }}>
                              {sug.label}
                            </Typography>
                            {sug.type && (
                              <Typography variant="caption" sx={{ color: "secondary.main", textTransform: "uppercase", fontSize: "0.625rem" }}>
                                {sug.type}
                              </Typography>
                            )}
                          </Box>
                          {sug.propertyCount && (
                            <Chip
                              label={`${sug.propertyCount} stay${sug.propertyCount > 1 ? "s" : ""}`}
                              size="small"
                              sx={{ height: 20, fontSize: "0.625rem" }}
                            />
                          )}
                        </Box>
                      ))}
                    </Paper>
                  )}
                </Box>
              </Grid>

              {/* Check In */}
              <Grid item xs={6} sm={6} lg={2}>
                <Typography variant="overline" sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "secondary.main", fontWeight: 700, fontSize: "0.6875rem", mb: 0.5 }}>
                  <Calendar size={13} color="#C4A46B" /> Check-In
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={checkIn}
                  inputProps={{ min: todayDate }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCheckIn(val);
                    setDateError("");
                    if (val && checkOut && checkOut <= val) {
                      setCheckOut(getNextDay(val));
                    }
                  }}
                  InputProps={{ sx: { bgcolor: "background.default", fontSize: "0.8125rem" } }}
                />
              </Grid>

              {/* Check Out */}
              <Grid item xs={6} sm={6} lg={2}>
                <Typography variant="overline" sx={{ display: "flex", alignItems: "center", gap: 0.75, color: dateError ? "error.main" : "secondary.main", fontWeight: 700, fontSize: "0.6875rem", mb: 0.5 }}>
                  <Calendar size={13} color={dateError ? "#D32F2F" : "#C4A46B"} /> Check-Out
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={checkOut}
                  error={Boolean(dateError)}
                  helperText={dateError || undefined}
                  FormHelperTextProps={{ sx: { fontSize: "0.625rem", mx: 0, mt: 0.25, lineHeight: 1.1 } }}
                  inputProps={{ min: checkIn ? getNextDay(checkIn) : todayDate }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCheckOut(val);
                    if (checkIn && val && val <= checkIn) {
                      setDateError("Departure date must be at least 1 night after arrival.");
                    } else {
                      setDateError("");
                    }
                  }}
                  InputProps={{ sx: { bgcolor: "background.default", fontSize: "0.8125rem" } }}
                />
              </Grid>

              {/* Occupancy */}
              <Grid item xs={6} sm={6} lg={2}>
                <Typography variant="overline" sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "secondary.main", fontWeight: 700, fontSize: "0.6875rem", mb: 0.5 }}>
                  <Users size={13} color="#C4A46B" /> Occupancy
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={adults}
                      onChange={(e) => {
                        setAdults(e.target.value);
                        setPage(1);
                      }}
                      sx={{ bgcolor: "background.default", fontSize: "0.8125rem" }}
                    >
                      <MenuItem value="1">1 Adult</MenuItem>
                      <MenuItem value="2">2 Adults</MenuItem>
                      <MenuItem value="3">3 Adults</MenuItem>
                      <MenuItem value="4">4+ Adults</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <Select
                      value={rooms}
                      onChange={(e) => {
                        setRooms(e.target.value);
                        setPage(1);
                      }}
                      sx={{ bgcolor: "background.default", fontSize: "0.8125rem" }}
                    >
                      <MenuItem value="1">1 Room</MenuItem>
                      <MenuItem value="2">2 Rooms</MenuItem>
                      <MenuItem value="3">3 Rooms</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>

              {/* Search CTA */}
              <Grid item xs={6} sm={6} lg={2}>
                <Box sx={{ pt: { xs: 0, lg: 2.75 } }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<Search size={15} />}
                    sx={{ py: 1.1, fontSize: "0.75rem", letterSpacing: "0.1em" }}
                  >
                    Search Hotels
                  </Button>
                </Box>
              </Grid>

              {/* Quick Destination Strip & Mobile Filter Toggle */}
              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }} />
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5, pt: 0.5 }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                    <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 700, fontSize: "0.6875rem" }}>
                      Destinations:
                    </Typography>
                    {[
                      { label: "Indore (Vijay Nagar)", query: "Vijay Nagar, Indore" },
                      { label: "Goa (Candolim)", query: "Candolim, Goa" },
                      { label: "Jaipur", query: "Jaipur" },
                      { label: "Madhya Pradesh", query: "Madhya Pradesh" },
                      { label: "Mumbai", query: "Mumbai" },
                      { label: "All India", query: "India" }
                    ].map((dest, i) => (
                      <Chip
                        key={i}
                        label={`✦ ${dest.label}`}
                        size="small"
                        onClick={() => {
                          setDestination(dest.query);
                          setPage(1);
                        }}
                        sx={{
                          cursor: "pointer",
                          fontSize: "0.6875rem",
                          bgcolor: "background.default",
                          borderColor: "divider",
                          "&:hover": { borderColor: "secondary.main" }
                        }}
                      />
                    ))}
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SlidersHorizontal size={14} color="#C4A46B" />}
                    onClick={() => setMobileFilterOpen(true)}
                    sx={{
                      display: { xs: "inline-flex", lg: "none" },
                      fontSize: "0.6875rem",
                      py: 0.5
                    }}
                  >
                    Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 3 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              Active Filters:
            </Typography>
            {destination && (
              <Chip
                label={`Destination: ${destination}`}
                size="small"
                onDelete={() => setDestination("")}
                sx={{ bgcolor: "#FFFFFF", border: "1px solid", borderColor: "divider" }}
              />
            )}
            {starRating !== "All" && (
              <Chip
                label={`${starRating}★ Verified`}
                size="small"
                onDelete={() => setStarRating("All")}
                sx={{ bgcolor: "#FFFFFF", border: "1px solid", borderColor: "divider" }}
              />
            )}
            {maxPrice < 35000 && (
              <Chip
                label={`Up to ${formatINR(maxPrice)}`}
                size="small"
                onDelete={() => setMaxPrice(35000)}
                sx={{ bgcolor: "#FFFFFF", border: "1px solid", borderColor: "divider" }}
              />
            )}
            {freeWifi && (
              <Chip
                label="Free Wi-Fi"
                size="small"
                onDelete={() => setFreeWifi(false)}
                sx={{ bgcolor: "#FFFFFF", border: "1px solid", borderColor: "divider" }}
              />
            )}
            {swimmingPool && (
              <Chip
                label="Pool"
                size="small"
                onDelete={() => setSwimmingPool(false)}
                sx={{ bgcolor: "#FFFFFF", border: "1px solid", borderColor: "divider" }}
              />
            )}
            {checkIn && (
              <Chip
                label={`From: ${checkIn}`}
                size="small"
                onDelete={() => {
                  setCheckIn("");
                  setDateError("");
                }}
                sx={{ bgcolor: "#FFFFFF", border: "1px solid", borderColor: "divider" }}
              />
            )}
            {checkOut && (
              <Chip
                label={`Until: ${checkOut}`}
                size="small"
                onDelete={() => {
                  setCheckOut("");
                  setDateError("");
                }}
                sx={{ bgcolor: "#FFFFFF", border: "1px solid", borderColor: "divider" }}
              />
            )}
            {freeBreakfast && (
              <Chip
                label="Breakfast"
                size="small"
                onDelete={() => setFreeBreakfast(false)}
                sx={{ bgcolor: "#FFFFFF", border: "1px solid", borderColor: "divider" }}
              />
            )}
            {petFriendly && (
              <Chip
                label="Pet-Friendly"
                size="small"
                onDelete={() => setPetFriendly(false)}
                sx={{ bgcolor: "#FFFFFF", border: "1px solid", borderColor: "divider" }}
              />
            )}
            <Button
              onClick={handleReset}
              size="small"
              sx={{ color: "secondary.main", fontSize: "0.6875rem", textTransform: "none", p: 0.5, minWidth: "auto" }}
            >
              Reset All
            </Button>
          </Box>
        )}

        {/* Main Grid: Filters Sidebar + Results */}
        <Grid container spacing={4} alignItems="flex-start">
          {/* Desktop Filter Sidebar */}
          <Grid item xs={12} lg={3} sx={{ display: { xs: "none", lg: "block" } }}>
            <Paper
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 4px 16px rgba(23, 63, 53, 0.04)"
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5, pb: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="h6" sx={{ fontFamily: "'Playfair Display', serif", display: "flex", alignItems: "center", gap: 1, fontSize: "1.1rem" }}>
                  <SlidersHorizontal size={16} color="#C4A46B" /> Filter Stays
                </Typography>
                <Button
                  onClick={handleReset}
                  size="small"
                  startIcon={<RotateCcw size={12} />}
                  sx={{ fontSize: "0.6875rem", color: "text.secondary", textTransform: "none", p: 0 }}
                >
                  Reset
                </Button>
              </Box>

              {renderFilterPanel()}
            </Paper>
          </Grid>

          {/* Results Column */}
          <Grid item xs={12} lg={9}>
            {/* Header: Count + Inventory Status + Sort */}
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", pb: 2, mb: 3, borderBottom: "1px solid", borderColor: "divider", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Showing <strong style={{ color: "#173F35" }}>{totalCount}</strong> matching Indian propert{totalCount === 1 ? "y" : "ies"}
                  {normalizedDest && (
                    <span style={{ color: "#C4A46B", fontWeight: 600, paddingLeft: 4 }}>
                      for "{normalizedDest}"
                    </span>
                  )}
                </Typography>
                <Chip
                  label={
                    inventoryMode === "offline"
                      ? "Service Offline"
                      : inventoryMode === "live"
                      ? "Live GDS Inventory"
                      : "Curated Demo Catalog"
                  }
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    bgcolor:
                      inventoryMode === "offline"
                        ? "error.light"
                        : inventoryMode === "live"
                        ? "success.light"
                        : "background.default",
                    color:
                      inventoryMode === "offline"
                        ? "error.main"
                        : inventoryMode === "live"
                        ? "success.main"
                        : "text.secondary",
                    borderColor: inventoryMode === "offline" ? "error.main" : "divider"
                  }}
                />
              </Box>

              {/* Sort Dropdown */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  Sort:
                </Typography>
                <FormControl size="small">
                  <Select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                    sx={{
                      fontSize: "0.75rem",
                      bgcolor: "background.paper",
                      fontWeight: 600,
                      color: "primary.main"
                    }}
                  >
                    <MenuItem value="recommended">Recommended</MenuItem>
                    <MenuItem value="price-asc">Price: Low to High</MenuItem>
                    <MenuItem value="price-desc">Price: High to Low</MenuItem>
                    <MenuItem value="rating">Guest Rating</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Inventory Scope Disclaimer (Demonstration Mode Transparency) */}
            {inventoryDisclaimer && (
              <Box
                sx={{
                  mb: 3,
                  p: 1.5,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "rgba(196, 164, 107, 0.4)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.25
                }}
              >
                <Info size={16} color="#C4A46B" style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6875rem", lineHeight: 1.5 }}>
                  <strong style={{ color: "#173F35" }}>Inventory Scope Notice: </strong>
                  {inventoryDisclaimer}
                </Typography>
              </Box>
            )}

            {/* Date Sequence Error Notice */}
            {dateError && (
              <Alert
                severity="warning"
                icon={<AlertCircle size={18} />}
                sx={{ mb: 3, borderRadius: 0, fontSize: "0.75rem", alignItems: "center" }}
              >
                {dateError} Please adjust the arrival or departure date above.
              </Alert>
            )}

            {/* Hotel Cards Grid */}
            {loading ? (
              <Grid container spacing={3}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Skeleton variant="rectangular" height={380} sx={{ border: "1px solid #E7E3D9" }} />
                  </Grid>
                ))}
              </Grid>
            ) : hotels.length > 0 ? (
              <>
                <Grid container spacing={3}>
                  {hotels.map((hotel) => (
                    <Grid item xs={12} sm={6} key={hotel._id || hotel.slug}>
                      <HotelCard
                        hotel={hotel}
                        searchDates={{ checkIn, checkOut, adults, children, rooms }}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* MUI Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, newPage) => setPage(newPage)}
                      color="primary"
                      shape="rounded"
                    />
                  </Box>
                )}
              </>
            ) : searchError ? (
              <Paper sx={{ textAlign: "center", py: 8, px: 4, maxWidth: 520, mx: "auto", border: "1px solid", borderColor: "error.light" }}>
                <Typography variant="h5" sx={{ fontFamily: "'Playfair Display', serif", color: "error.main", mb: 1.5 }}>
                  Search Service Notice
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                  {searchError}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setSearchError(null);
                    setLoading(true);
                    setPage(1);
                    setRetryKey((k) => k + 1);
                  }}
                >
                  Retry Search
                </Button>
              </Paper>
            ) : (
              <Paper sx={{ textAlign: "center", py: 10, px: 4, maxWidth: 540, mx: "auto", border: "1px solid", borderColor: "divider" }}>
                <Compass size={36} color="#C4A46B" style={{ margin: "0 auto 16px" }} />
                <Typography variant="h4" sx={{ fontFamily: "'Playfair Display', serif", color: "primary.main", mb: 1.5 }}>
                  No Matching Properties
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                  We found no Indian properties matching your search criteria. Try selecting an alternative destination or adjusting your price and filter options.
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1, mb: 3 }}>
                  {["Vijay Nagar, Indore", "Candolim, Goa", "Jaipur", "Madhya Pradesh", "Mumbai"].map((dest) => (
                    <Chip
                      key={dest}
                      label={`✦ ${dest}`}
                      size="small"
                      onClick={() => {
                        setDestination(dest);
                        setPage(1);
                      }}
                      sx={{ cursor: "pointer", bgcolor: "background.default" }}
                    />
                  ))}
                </Box>
                <Button variant="contained" color="primary" onClick={handleReset}>
                  Reset All Filters
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="left"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        PaperProps={{
          sx: {
            width: "85vw",
            maxWidth: 320,
            p: 3,
            bgcolor: "background.paper",
            borderRadius: 0
          }
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 2, mb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ fontFamily: "'Playfair Display', serif" }}>
            Filter Stays
          </Typography>
          <IconButton onClick={() => setMobileFilterOpen(false)} size="small">
            <CloseIcon size={20} />
          </IconButton>
        </Box>

        {renderFilterPanel()}

        <Box sx={{ pt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => setMobileFilterOpen(false)}
          >
            Apply Filters ({totalCount} stays)
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
