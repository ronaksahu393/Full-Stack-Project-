import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
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
  Check,
  Calendar,
  ShieldCheck,
  Clock,
  ArrowLeft,
  Sparkles,
  Wifi,
  Waves,
  Car,
  Utensils,
  Coffee,
  CheckCircle2,
  FileText,
  AlertCircle
} from "lucide-react";

export default function HotelDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [hotelData, setHotelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  // Booking state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Date filters from URL or default
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFetchError(null);
    api
      .getHotelById(id, { checkIn, checkOut })
      .then((data) => {
        if (active) {
          setHotelData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setFetchError(err.message || "Unable to retrieve sanctuary details.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id, checkIn, checkOut, retryKey]);

  if (loading) {
    return (
      <div className="pt-36 pb-24 min-h-screen max-w-7xl mx-auto px-6 space-y-6">
        <div className="skeleton h-8 w-60" />
        <div className="skeleton h-[480px]" />
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
            Return to Explore India
          </Link>
        </div>
      </div>
    );
  }

  if (!hotelData || !hotelData.hotel) {
    return (
      <div className="pt-36 pb-24 min-h-screen text-center max-w-lg mx-auto px-6 space-y-4">
        <h2 className="font-serif text-3xl text-[#173F35]">Property Not Located</h2>
        <p className="text-xs text-[#72776F]">This Indian sanctuary does not exist or may have been unlisted.</p>
        <Link to="/explore" className="btn-primary inline-block px-6 py-2.5 text-xs">
          Return to Explore India
        </Link>
      </div>
    );
  }

  const { hotel, rooms = [] } = hotelData;
  const gallery = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.heroImage];
  const isVerifiedStar = hotel.isStarVerified && hotel.starClassification;

  const handleOpenBooking = (room) => {
    const q = new URLSearchParams();
    if (checkIn) q.append("checkIn", checkIn);
    if (checkOut) q.append("checkOut", checkOut);
    const adults = searchParams.get("adults") || "2";
    q.append("adults", adults);
    if (hotel?._id) q.append("hotelId", hotel._id);
    const qs = q.toString();
    navigate(`/checkout/${room._id}${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#F8F6F0]">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-[#72776F] hover:text-[#173F35] transition-colors uppercase tracking-wider font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Search Results</span>
        </button>

        {hotel.isDemo && (
          <span className="text-[10px] px-2.5 py-1 bg-white border border-[#E7E3D9] text-[#72776F] uppercase tracking-wider">
            Verified Indian Demo Property
          </span>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Title & Location Header */}
        <div className="pb-6 border-b border-[#E7E3D9] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#173F35] text-white text-[10px] uppercase tracking-wider font-medium">
                {hotel.propertyCategory}
              </span>
              {isVerifiedStar && (
                <span className="px-2.5 py-0.5 bg-[#C4A46B] text-[#173F35] text-[10px] font-bold uppercase tracking-wider">
                  {hotel.starClassification}★ Government Verified Star Rating
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#173F35] tracking-tight">
              {hotel.name}
            </h1>

            <div className="flex items-center gap-2 text-xs text-[#72776F] font-light">
              <MapPin className="w-3.5 h-3.5 text-[#C4A46B]" />
              <span>
                {hotel.address?.addressLine}, {hotel.address?.locality}, {hotel.address?.city},{" "}
                {hotel.address?.state} &mdash; PIN {hotel.address?.postalCode}, India
              </span>
            </div>
          </div>

          {/* Rating Block & Book Button */}
          <div className="flex flex-wrap items-center gap-3">
            {hotel.reviewCount > 0 && hotel.rating ? (
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 border border-[#E7E3D9] text-xs font-medium text-[#173F35] shadow-subtle">
                <Star className="w-4 h-4 fill-[#C4A46B] text-[#C4A46B]" />
                <span className="font-semibold text-base">{Number(hotel.rating).toFixed(2)}</span>
                <span className="text-[#72776F] text-[11px]">
                  ({hotel.reviewCount} verified guest {hotel.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 border border-[#E7E3D9] text-xs font-medium text-[#72776F] shadow-subtle">
                <Star className="w-4 h-4 text-stone-300" />
                <span className="text-[11px]">Ratings not yet available (New property)</span>
              </div>
            )}

            <a
              href="#rooms-section"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0A1628] rounded shadow-sm inline-flex items-center gap-1.5"
              style={{
                background: "linear-gradient(135deg, #D4AF6B 0%, #B8924A 100%)",
                textDecoration: "none"
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Book a Room
            </a>
          </div>
        </div>

        {/* Gallery Showcase */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 h-80 sm:h-[480px] overflow-hidden border border-[#E7E3D9] relative bg-stone-100">
            <img
              src={gallery[selectedPhoto] || hotel.heroImage || "/images/hotels/hotel-1.jpg"}
              alt={hotel.name}
              className="w-full h-full object-cover transition-all duration-500"
              referrerPolicy="no-referrer"
              onError={(e) => handleImageFallback(e, "hotel", hotel.name)}
            />
          </div>

          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
            {gallery.slice(0, 3).map((img, idx) => (
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
                  alt={`${hotel.name} view ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageFallback(e, "hotel", `${hotel.name} view ${idx + 1}`)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hotel Details & Available Room Types */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-12">
            {/* Architectural Narrative */}
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-[#173F35]">Property Overview</h2>
              <p className="text-sm text-[#252923]/80 font-light leading-relaxed whitespace-pre-line">
                {hotel.description}
              </p>
            </div>

            {/* Facilities & Amenities */}
            <div className="space-y-4 bg-white p-6 border border-[#E7E3D9] shadow-subtle">
              <h3 className="font-serif text-lg text-[#173F35]">Property Amenities &amp; Services</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hotel.facilities?.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#252923]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C4A46B]" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Inventory Selection */}
            <div id="rooms-section" className="space-y-6 scroll-mt-28">
              <div className="border-b border-[#E7E3D9] pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl text-[#173F35]">Available Room Types &amp; Suites</h2>
                  <p className="text-xs text-[#72776F] font-light">
                    Select a room type to review GST breakdown and reserve directly.
                  </p>
                </div>
                <span className="text-xs uppercase tracking-wider text-[#C4A46B] font-semibold">
                  {rooms.length} Suite Option{rooms.length === 1 ? "" : "s"}
                </span>
              </div>

              {rooms.length > 0 ? (
                <div className="space-y-6">
                  {rooms.map((room) => {
                    const gst = room.taxDetails?.gstPercent || (room.pricePerNight >= 7500 ? 18 : 12);
                    const estimatedTax = Math.round((room.pricePerNight * gst) / 100);
                    const totalRate = room.pricePerNight + estimatedTax;

                    return (
                      <div
                        key={room._id}
                        className="bg-white border border-[#E7E3D9] p-6 shadow-subtle grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                      >
                        <div className="md:col-span-4 h-48 overflow-hidden border border-[#E7E3D9]">
                          <img
                            src={room.heroImage || hotel.heroImage}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="md:col-span-5 space-y-2.5">
                          <span className="text-[10px] uppercase tracking-wider text-[#C4A46B] font-semibold block">
                            {room.category}
                          </span>
                          <h3 className="font-serif text-xl text-[#173F35]">{room.name}</h3>
                          <p className="text-xs text-[#72776F] font-light line-clamp-2">
                            {room.summary || room.description}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-[#72776F] pt-1">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-[#C4A46B]" />
                              Up to {room.capacity?.guests || 2} Guests
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <Bed className="w-3.5 h-3.5 text-[#C4A46B]" />
                              {room.capacity?.bedType || "King Bed"}
                            </span>
                          </div>
                        </div>

                        <div className="md:col-span-3 text-right border-t md:border-t-0 md:border-l border-[#E7E3D9] pt-4 md:pt-0 md:pl-6 space-y-2">
                          <span className="text-[10px] text-[#72776F] uppercase block">Per Night Rate</span>
                          <p className="font-serif text-2xl font-medium text-[#173F35]">
                            {formatINR(room.pricePerNight)}
                          </p>
                          <span className="text-[10px] text-[#72776F] block">
                            + {formatINR(estimatedTax)} ({gst}% GST)
                          </span>
                          <span className="text-[11px] font-medium text-[#173F35] block pb-1">
                            Total: {formatINR(totalRate)}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenBooking(room)}
                            className="w-full py-3 text-xs tracking-wider uppercase font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer rounded"
                            style={{
                              background: "linear-gradient(135deg, #D4AF6B 0%, #B8924A 100%)",
                              color: "#0A1628",
                              border: "none"
                            }}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Reserve Room
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-[#E7E3D9] p-8 text-center space-y-4 shadow-subtle">
                  <h3 className="font-serif text-xl text-[#173F35]">Deluxe Heritage Suite</h3>
                  <p className="text-xs text-[#72776F] max-w-md mx-auto">
                    Reserve your luxury stay directly at this sanctuary with personalized concierge assistance.
                  </p>
                  <div className="font-serif text-2xl font-medium text-[#173F35]">
                    {formatINR(hotel.startingPrice || 4500)} / night
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenBooking({
                      _id: hotel._id,
                      name: `${hotel.name} - Heritage Suite`,
                      pricePerNight: hotel.startingPrice || 4500,
                      heroImage: hotel.heroImage,
                      category: "Deluxe Suite",
                      capacity: { guests: 2, adults: 2, children: 1 }
                    })}
                    className="inline-flex items-center gap-2 px-8 py-3 text-xs tracking-wider uppercase font-bold shadow-md cursor-pointer rounded"
                    style={{ background: "linear-gradient(135deg, #D4AF6B 0%, #B8924A 100%)", color: "#0A1628", border: "none" }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Book This Stay
                  </button>
                </div>
              )}
            </div>

            {/* Verified Reviews */}
            <div className="space-y-6 pt-4">
              <h2 className="font-serif text-2xl text-[#173F35]">Verified Guest Reviews</h2>
              {hotel.reviews && hotel.reviews.length > 0 ? (
                <div className="space-y-4">
                  {hotel.reviews.map((rev, idx) => (
                    <div key={idx} className="bg-white p-5 border border-[#E7E3D9] space-y-2 shadow-subtle">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex text-[#C4A46B]">
                            {[...Array(rev.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-[#C4A46B]" />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-[#173F35]">{rev.userName}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-[#F8F6F0] text-[#72776F] border border-[#E7E3D9]">
                          {rev.travelerType || "Verified Stay"}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#173F35]">{rev.title}</p>
                      <p className="text-xs text-[#252923]/80 font-light leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#72776F]">First guest review will appear after the initial verified stay.</p>
              )}
            </div>
          </div>

          {/* Right Sidebar: Policies & Concierge Support */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E7E3D9] p-6 space-y-4 shadow-subtle">
              <h3 className="font-serif text-lg text-[#173F35] border-b border-[#E7E3D9] pb-3">
                Property Policies
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#C4A46B] font-semibold block uppercase text-[10px]">Check-in &amp; Check-out</span>
                  <p className="text-[#252923] font-medium">Check-in: {hotel.policies?.checkInTime || "14:00"}</p>
                  <p className="text-[#252923] font-medium">Check-out: {hotel.policies?.checkOutTime || "11:00"}</p>
                </div>

                <div className="border-t border-[#E7E3D9] pt-2">
                  <span className="text-[#C4A46B] font-semibold block uppercase text-[10px]">Cancellation Policy</span>
                  <p className="text-[#72776F] font-light leading-relaxed">
                    {hotel.policies?.cancellationPolicy || "Free cancellation up to 48 hours before check-in."}
                  </p>
                </div>

                <div className="border-t border-[#E7E3D9] pt-2">
                  <span className="text-[#C4A46B] font-semibold block uppercase text-[10px]">Pet Policy</span>
                  <p className="text-[#72776F] font-light">
                    {hotel.policies?.petFriendly ? "Pet-friendly property." : "Pets are not permitted."}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#173F35] text-white p-6 space-y-3 shadow-subtle">
              <span className="text-[10px] uppercase tracking-wider text-[#C4A46B] font-semibold block">
                Direct Liaison Desk
              </span>
              <h4 className="font-serif text-lg">HotelPro Indian Concierge</h4>
              <p className="text-xs text-[#E7E3D9]/80 font-light leading-relaxed">
                Need tailored airport pick-up, local heritage guides, or special dining requests?
              </p>
              <div className="text-xs text-[#C4A46B] pt-2 space-y-1">
                <p>Phone: +91 800 482 7769</p>
                <p>Email: concierge@hotelpro.in</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedRoom(null);
          }}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
          initialGuests={searchParams.get("adults") || "2"}
        />
      )}
    </div>
  );
}
