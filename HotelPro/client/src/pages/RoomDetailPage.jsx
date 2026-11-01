import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import BookingModal from "../components/rooms/BookingModal";
import { formatINR } from "../utils/currency";
import { handleImageFallback } from "../utils/imageFallback";
import {
  Star,
  MapPin,
  Users,
  Maximize,
  Bed,
  Bath,
  Check,
  Calendar,
  ShieldCheck,
  Clock,
  ArrowLeft,
  Sparkles,
  Wifi,
  Coffee,
  Waves,
  AlertCircle
} from "lucide-react";

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Quick booking state
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState("2");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFetchError(null);
    api
      .getRoomById(id)
      .then((data) => {
        if (active) {
          setRoom(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setFetchError(err.message || "Unable to retrieve suite details.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id, retryKey]);

  if (loading) {
    return (
      <div className="pt-36 pb-24 min-h-screen max-w-7xl mx-auto px-6 space-y-6">
        <div className="skeleton h-6 w-40" />
        <div className="skeleton h-[460px]" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="pt-36 pb-24 min-h-screen text-center max-w-lg mx-auto px-6 space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center rounded-full mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-3xl text-[#173F35]">Connection Unavailable</h2>
        <p className="text-xs text-[#72776F]">{fetchError}</p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="btn-primary inline-block px-6 py-2.5 text-xs cursor-pointer"
          >
            Retry Connection
          </button>
          <Link to="/explore" className="btn-secondary inline-block px-6 py-2.5 text-xs">
            Return to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="pt-36 pb-24 min-h-screen text-center max-w-lg mx-auto px-6 space-y-4">
        <h2 className="font-serif text-3xl text-[#173F35]">Suite Not Located</h2>
        <p className="text-xs text-[#72776F]">This residence does not exist or may have been archived.</p>
        <Link to="/explore" className="btn-primary inline-block px-6 py-2.5 text-xs">
          Return to Portfolio
        </Link>
      </div>
    );
  }

  const galleryImages = room.gallery && room.gallery.length > 0 ? room.gallery : [room.heroImage];

  // Calculate nights
  let nights = 0;
  if (checkIn && checkOut) {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = d2 - d1;
    if (diff > 0) {
      nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
  }
  const estimatedTotal = nights > 0 ? nights * room.pricePerNight : room.pricePerNight;

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#F8F6F0]">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-[#72776F] hover:text-[#173F35] transition-colors uppercase tracking-wider font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Portfolio</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Title & Location Header */}
        <div className="pb-6 border-b border-[#E7E3D9] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#173F35] text-white text-[10px] uppercase tracking-wider font-medium">
                {room.category}
              </span>
              <span className="text-xs text-[#C4A46B] uppercase tracking-wider font-semibold">
                {room.property}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#173F35] tracking-tight">
              {room.name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-[#72776F] font-light">
              <MapPin className="w-3.5 h-3.5 text-[#C4A46B]" />
              <span>{room.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {room.rating && room.reviewCount > 0 ? (
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-[#E7E3D9] text-xs font-medium text-[#173F35]">
                <Star className="w-4 h-4 fill-[#C4A46B] text-[#C4A46B]" />
                <span>{Number(room.rating).toFixed(2)}</span>
                <span className="text-[#72776F] text-[10px]">
                  ({room.reviewCount} verified guest {room.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-[#E7E3D9] text-xs font-medium text-[#72776F]">
                <Star className="w-4 h-4 text-stone-300" />
                <span className="text-[11px]">Not yet rated (New suite)</span>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 h-80 sm:h-[480px] overflow-hidden border border-[#E7E3D9] relative bg-stone-100">
            <img
              src={galleryImages[selectedPhoto] || room.heroImage || "/images/rooms/room-1.jpg"}
              alt={room.name}
              className="w-full h-full object-cover transition-all duration-500"
              referrerPolicy="no-referrer"
              onError={(e) => handleImageFallback(e, "room", room.name)}
            />
          </div>

          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
            {galleryImages.slice(0, 3).map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPhoto(idx)}
                className={`h-36 sm:h-[150px] overflow-hidden border cursor-pointer transition-all ${
                  selectedPhoto === idx
                    ? "border-[#173F35] ring-2 ring-[#C4A46B]"
                    : "border-[#E7E3D9] opacity-80 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`${room.name} perspective ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageFallback(e, "room", `${room.name} view ${idx + 1}`)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Details & Sticky Booking Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
          {/* Left Details Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Key Specifications Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white border border-[#E7E3D9] text-xs text-[#252923] shadow-subtle">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#C4A46B]" />
                <div>
                  <span className="block text-[#72776F] uppercase text-[9px] tracking-wider">Occupancy</span>
                  <span className="font-semibold">{room.capacity?.guests || 2} Guests</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Bed className="w-4 h-4 text-[#C4A46B]" />
                <div>
                  <span className="block text-[#72776F] uppercase text-[9px] tracking-wider">Bedrooms</span>
                  <span className="font-semibold">
                    {room.capacity?.bedrooms || 1} Bed ({room.capacity?.beds || 1} Bedding)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Bath className="w-4 h-4 text-[#C4A46B]" />
                <div>
                  <span className="block text-[#72776F] uppercase text-[9px] tracking-wider">Bathrooms</span>
                  <span className="font-semibold">{room.capacity?.bathrooms || 1} En-Suite</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Maximize className="w-4 h-4 text-[#C4A46B]" />
                <div>
                  <span className="block text-[#72776F] uppercase text-[9px] tracking-wider">Floor Area</span>
                  <span className="font-semibold">{room.sizeSqM || 60} m²</span>
                </div>
              </div>
            </div>

            {/* Room Narrative */}
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-normal text-[#173F35]">
                Architectural Narrative
              </h2>
              <p className="text-sm sm:text-base text-[#252923]/80 font-light leading-relaxed">
                {room.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4 pt-4 border-t border-[#E7E3D9]">
              <h2 className="font-serif text-2xl font-normal text-[#173F35]">
                Sanctuary Amenities &amp; Inclusions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {room.amenities?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3.5 bg-white border border-[#E7E3D9] text-xs text-[#252923] shadow-subtle"
                  >
                    <div className="w-5 h-5 bg-[#173F35]/10 flex items-center justify-center text-[#173F35] shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#173F35]" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms & Policies */}
            <div className="space-y-4 pt-4 border-t border-[#E7E3D9]">
              <h2 className="font-serif text-xl font-normal text-[#173F35]">
                Reservation Terms &amp; Policies
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light text-[#252923]/75">
                <div className="p-4 bg-white border border-[#E7E3D9] space-y-1 shadow-subtle">
                  <div className="flex items-center gap-2 font-medium text-[#173F35]">
                    <Clock className="w-3.5 h-3.5 text-[#C4A46B]" />
                    <span>Check-In &amp; Check-Out</span>
                  </div>
                  <p>Check-in from 15:00 PM. Check-out until 12:00 PM. Flexible early arrival upon concierge notice.</p>
                </div>

                <div className="p-4 bg-white border border-[#E7E3D9] space-y-1 shadow-subtle">
                  <div className="flex items-center gap-2 font-medium text-[#173F35]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C4A46B]" />
                    <span>Flexible Cancellation Policy</span>
                  </div>
                  <p>Complimentary cancellation up to 48 hours prior to arrival directly from your guest dashboard.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sticky Reservation Panel */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white border border-[#E7E3D9] p-6 sm:p-7 shadow-elevated space-y-6">
              {/* Pricing Header */}
              <div className="flex justify-between items-baseline pb-4 border-b border-[#E7E3D9]">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#C4A46B] block font-semibold">
                    Nightly Residence Rate
                  </span>
                  <span className="font-serif text-3xl font-normal text-[#173F35]">
                    {formatINR(room.pricePerNight)}
                  </span>
                  <span className="text-xs text-[#72776F] ml-1">/ night</span>
                </div>
                <div>
                  <span className="text-xs text-[#287A55] bg-emerald-50 px-2.5 py-0.5 border border-emerald-200 uppercase tracking-wider font-semibold text-[10px]">
                    Available
                  </span>
                </div>
              </div>

              {/* Date & Guest Inputs */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#C4A46B] font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Arrival Date</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F6F0] border border-[#E7E3D9] text-xs font-medium text-[#252923] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#C4A46B] font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Departure Date</span>
                  </label>
                  <input
                    type="date"
                    min={checkIn || new Date().toISOString().split("T")[0]}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F6F0] border border-[#E7E3D9] text-xs font-medium text-[#252923] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#C4A46B] font-semibold mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Guests</span>
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F6F0] border border-[#E7E3D9] text-xs font-medium text-[#252923] outline-none"
                  >
                    {[1, 2, 3, 4, 5].slice(0, room.capacity?.guests || 4).map((n) => (
                      <option key={n} value={n}>
                        {n} Guest{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="pt-2 border-t border-[#E7E3D9] space-y-2 text-xs">
                {nights > 0 ? (
                  <div className="flex justify-between text-[#252923]/75">
                    <span>
                      {formatINR(room.pricePerNight)} &times; {nights} night{nights > 1 ? "s" : ""}
                    </span>
                    <span>{formatINR(nights * room.pricePerNight)}</span>
                  </div>
                ) : (
                  <p className="text-[#72776F] italic text-[11px]">
                    Select stay dates above to calculate precise total.
                  </p>
                )}

                <div className="flex justify-between text-[#252923]/75">
                  <span>Concierge Liaison &amp; Wi-Fi</span>
                  <span className="text-[#287A55] font-medium">Complimentary</span>
                </div>

                <div className="pt-2 border-t border-[#E7E3D9] flex justify-between font-serif text-lg font-medium text-[#173F35]">
                  <span>Total Amount</span>
                  <span>{formatINR(nights > 0 ? nights * room.pricePerNight : room.pricePerNight)}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  const q = new URLSearchParams();
                  if (checkIn) q.append("checkIn", checkIn);
                  if (checkOut) q.append("checkOut", checkOut);
                  if (guestCount) q.append("adults", guestCount);
                  const qs = q.toString();
                  navigate(`/checkout/${room._id}${qs ? `?${qs}` : ""}`);
                }}
                className="w-full btn-primary py-3.5 text-xs tracking-widest shadow-md uppercase font-bold"
              >
                Proceed to Payment &amp; Reserve
              </button>

              <div className="pt-2 text-center text-[11px] text-[#72776F] font-light flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C4A46B]" />
                <span>Instant Confirmation &bull; No Hidden Surcharges</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <BookingModal
          room={room}
          initialDates={{ checkIn, checkOut, guests: guestCount }}
          onClose={() => setIsBookingModalOpen(false)}
        />
      )}
    </div>
  );
}
