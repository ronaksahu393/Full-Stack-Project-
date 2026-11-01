import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Rating,
  Button,
  Divider
} from "@mui/material";
import { MapPin, ArrowUpRight } from "lucide-react";
import { formatINR } from "../../utils/currency";
import { getHotelImageUrl, handleImageFallback } from "../../utils/imageFallback";

export default function HotelCard({ hotel, searchDates }) {
  const [urlSearchParams] = useSearchParams();
  const isVerifiedStar = hotel.isStarVerified && hotel.starClassification;
  const locality = hotel.address?.locality;
  const city = hotel.address?.city;
  const state = hotel.address?.state;
  const locationLabel = locality && locality !== city
    ? `${locality}, ${city}`
    : `${city}, ${state}`;

  const startingPrice = Number(hotel.effectiveStartingPrice || hotel.startingPrice || 3500);

  // Preserve search parameters (dates, guests, rooms) when linking to hotel detail
  const checkIn = searchDates?.checkIn || urlSearchParams.get("checkIn") || "";
  const checkOut = searchDates?.checkOut || urlSearchParams.get("checkOut") || "";
  const adults = searchDates?.adults || urlSearchParams.get("adults") || "";
  const children = searchDates?.children || urlSearchParams.get("children") || "";
  const rooms = searchDates?.rooms || urlSearchParams.get("rooms") || "";

  const queryParams = new URLSearchParams();
  if (checkIn) queryParams.append("checkIn", checkIn);
  if (checkOut) queryParams.append("checkOut", checkOut);
  if (adults && adults !== "2") queryParams.append("adults", adults);
  if (children && children !== "0") queryParams.append("children", children);
  if (rooms && rooms !== "1") queryParams.append("rooms", rooms);
  const queryString = queryParams.toString();
  const hotelUrl = `/hotels/${hotel._id || hotel.slug}${queryString ? `?${queryString}` : ""}`;

  return (
    <Card
      component="article"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        borderRadius: 0,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        transition: "all 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
        "&:hover": {
          boxShadow: "0 16px 36px rgba(23, 63, 53, 0.1)",
          borderColor: "secondary.main",
          "& .hotel-card-media": {
            transform: "scale(1.05)"
          },
          "& .hotel-card-title": {
            color: "secondary.main"
          }
        }
      }}
    >
      {/* Media & Badges */}
      <Box sx={{ position: "relative", overflow: "hidden", height: { xs: 230, sm: 250 }, bgcolor: "grey.100" }}>
        <img
          className="hotel-card-media"
          src={getHotelImageUrl(hotel)}
          alt={hotel.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => handleImageFallback(e, "hotel", hotel.name)}
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        />

        {/* Top Badges */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 0.75,
            zIndex: 2
          }}
        >
          <Chip
            label={hotel.propertyCategory || "Boutique"}
            size="small"
            sx={{
              bgcolor: "rgba(23, 63, 53, 0.9)",
              backdropFilter: "blur(6px)",
              color: "#FFFFFF",
              fontSize: "0.625rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              border: "1px solid rgba(196, 164, 107, 0.4)",
              height: 22
            }}
          />
          {isVerifiedStar && (
            <Chip
              label={`${hotel.starClassification}★ Verified`}
              size="small"
              sx={{
                bgcolor: "secondary.main",
                color: "primary.main",
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                height: 22
              }}
            />
          )}
        </Box>

        {hotel.isDemo && (
          <Box sx={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}>
            <Chip
              label="Demo Property"
              size="small"
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(6px)",
                color: "#E7E3D9",
                fontSize: "0.5625rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                height: 20
              }}
            />
          </Box>
        )}

        {/* Rating Pill */}
        <Box
          sx={{
            position: "absolute",
            bottom: 12,
            left: 12,
            zIndex: 2,
            bgcolor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            px: 1.25,
            py: 0.5,
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
        >
          {hotel.rating && hotel.reviewCount > 0 ? (
            <>
              <Rating
                value={Number(hotel.rating)}
                precision={0.1}
                readOnly
                size="small"
                sx={{ fontSize: "0.875rem" }}
              />
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.75rem", color: "primary.main" }}>
                {Number(hotel.rating).toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6875rem" }}>
                ({hotel.reviewCount})
              </Typography>
            </>
          ) : (
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.6875rem", color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              New Property
            </Typography>
          )}
        </Box>
      </Box>

      {/* Card Body */}
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Box sx={{ mb: 2 }}>
          {/* Location Line */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
            <MapPin size={13} color="#C4A46B" style={{ flexShrink: 0 }} />
            <Typography
              variant="caption"
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
                color: "text.secondary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {locationLabel}
            </Typography>
          </Box>

          {/* Hotel Name */}
          <Typography
            variant="h5"
            className="hotel-card-title"
            sx={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: { xs: "1.25rem", sm: "1.35rem" },
              fontWeight: 500,
              color: "primary.main",
              lineHeight: 1.3,
              mb: 1.25,
              transition: "color 0.25s ease"
            }}
          >
            <Link
              to={hotelUrl}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {hotel.name}
            </Link>
          </Typography>

          {/* Hotel Summary */}
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 300,
              lineHeight: 1.6,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              mb: 2
            }}
          >
            {hotel.summary || hotel.description}
          </Typography>

          {/* Highlights / Amenities */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, pt: 1.5, borderTop: "1px solid", borderColor: "rgba(231, 227, 217, 0.7)" }}>
            {hotel.facilities?.slice(0, 3).map((f, idx) => (
              <Chip
                key={idx}
                label={`✦ ${f}`}
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: "0.625rem",
                  borderColor: "divider",
                  bgcolor: "background.default",
                  color: "primary.main"
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Pricing & Footer Actions */}
        <Box sx={{ pt: 2, mt: "auto", borderTop: "1px solid", borderColor: "divider", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>
              Starting From
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
              <Typography variant="h6" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "primary.main", fontSize: "1.25rem" }}>
                {formatINR(startingPrice)}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                / night
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ fontSize: "0.625rem", color: "text.secondary", display: "block" }}>
              + taxes & concierge
            </Typography>
          </Box>

          <Button
            component={Link}
            to={hotelUrl}
            variant="contained"
            color="primary"
            size="small"
            endIcon={<ArrowUpRight size={14} />}
            sx={{
              px: 2,
              py: 0.75,
              fontSize: "0.6875rem",
              letterSpacing: "0.1em"
            }}
          >
            Book Rooms
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
