import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Users, Maximize, ArrowUpRight } from "lucide-react";
import { getRoomImageUrl, handleImageFallback } from "../../utils/imageFallback";

export default function RoomCard({ room, variant = "standard" }) {
  const isLarge = variant === "large";

  return (
    <article
      className={`group bg-white border border-[#E7E3D9] flex flex-col justify-between transition-all duration-300 hover:shadow-card hover:border-[#C4A46B]/60 ${
        isLarge ? "md:col-span-2 md:grid md:grid-cols-12 md:gap-8" : ""
      }`}
    >
      {/* Photography Container with restrained zoom */}
      <div
        className={`relative overflow-hidden ${
          isLarge ? "md:col-span-7 h-72 md:h-full min-h-[340px]" : "h-64 sm:h-72"
        }`}
      >
        <img
          src={getRoomImageUrl(room)}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => handleImageFallback(e, "room", room.name)}
        />

        {/* Category Pill */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-[#173F35]/90 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider font-medium border border-[#C4A46B]/40 shadow-sm">
            {room.category}
          </span>
        </div>

        {/* Rating Badge */}
        {room.rating && room.reviewCount > 0 ? (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-[#173F35] flex items-center gap-1.5 border border-[#E7E3D9]">
            <Star className="w-3.5 h-3.5 fill-[#C4A46B] text-[#C4A46B]" />
            <span>{Number(room.rating).toFixed(2)}</span>
            <span className="text-[#72776F] text-[10px]">({room.reviewCount})</span>
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-[#72776F] border border-[#E7E3D9]">
            New Room
          </div>
        )}
      </div>

      {/* Suite Details */}
      <div
        className={`p-6 sm:p-7 flex flex-col justify-between flex-1 ${
          isLarge ? "md:col-span-5" : ""
        }`}
      >
        <div className="space-y-3">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-[#72776F] font-light">
            <MapPin className="w-3.5 h-3.5 text-[#C4A46B] shrink-0" />
            <span className="tracking-wide uppercase text-[11px] truncate">{room.location}</span>
          </div>

          {/* Suite Title */}
          <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#173F35] group-hover:text-[#C4A46B] transition-colors leading-snug">
            <Link to={`/rooms/${room._id}`} className="hover:underline">
              {room.name}
            </Link>
          </h3>

          {/* Summary / Architectural Narrative */}
          <p className="text-xs sm:text-sm text-[#252923]/75 font-light line-clamp-2 leading-relaxed">
            {room.summary}
          </p>

          {/* Quick Specifications */}
          <div className="pt-2 flex items-center gap-4 text-xs text-[#72776F] border-t border-[#E7E3D9]/70">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#C4A46B]" />
              Up to {room.capacity?.guests || 2} guests
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5 text-[#C4A46B]" />
              {room.sizeSqM || 60} m²
            </span>
          </div>

          {/* Highlights & Inclusions */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {room.amenities?.slice(0, 2).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2.5 py-0.5 bg-[#F8F6F0] text-[#173F35] border border-[#E7E3D9]"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Price & Primary CTA */}
        <div className="pt-6 mt-4 border-t border-[#E7E3D9] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#72776F] uppercase tracking-wider block font-light">
              Starting From
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-medium text-[#173F35]">
                {room.currency === "INR" || !room.currency ? `₹${Number(room.pricePerNight).toLocaleString('en-IN')}` : `$${room.pricePerNight}`}
              </span>
              <span className="text-xs text-[#72776F] font-light">/ night</span>
            </div>
          </div>

          <Link
            to={`/checkout/${room._id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0A1628] py-2 px-3.5 rounded shadow-sm"
            style={{
              background: "linear-gradient(135deg, #D4AF6B 0%, #B8924A 100%)",
              textDecoration: "none"
            }}
          >
            <span>Book Suite</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
