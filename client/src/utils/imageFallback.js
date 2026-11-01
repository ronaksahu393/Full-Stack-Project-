/**
 * HotelPro Resilient Image & Offline Fallback Utility
 * 
 * Provides guaranteed permanent image rendering:
 * 1. Checks primary image URL (local or remote).
 * 2. On error, seamlessly falls back to bundled local high-resolution assets (/images/...).
 * 3. As an ultimate fallback, generates a self-contained inline SVG data-URI
 *    with bespoke gold and forest green luxury branding. This never requires network
 *    access, cannot be blocked by ad-blockers, and works 100% offline.
 */

export const LOCAL_HOTEL_IMAGES = [
  "/images/hotels/hotel-1.jpg",
  "/images/hotels/hotel-2.jpg",
  "/images/hotels/hotel-3.jpg",
  "/images/hotels/hotel-4.jpg",
  "/images/hotels/hotel-5.jpg",
  "/images/hotels/hotel-6.jpg",
  "/images/hotels/hotel-7.jpg",
  "/images/hotels/hotel-8.jpg"
];

export const LOCAL_ROOM_IMAGES = [
  "/images/rooms/room-1.jpg",
  "/images/rooms/room-2.jpg",
  "/images/rooms/room-3.jpg",
  "/images/rooms/room-default.jpg"
];

export const LOCAL_HERO_IMAGES = [
  "/images/hero/slide-1.jpg",
  "/images/hero/slide-2.jpg",
  "/images/hero/slide-3.jpg",
  "/images/hero/slide-5.jpg"
];

/**
 * Generates an ultra-light, self-contained SVG Data URI for luxury placeholder rendering.
 * Fully offline, never blocked by CORS or tracking filters.
 */
export function getLuxurySvgPlaceholder(title = "HotelPro Atelier") {
  const cleanTitle = (title || "HotelPro Sanctuary")
    .replace(/[<>&'"]/g, "")
    .slice(0, 32)
    .toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#071813"/>
      <stop offset="50%" stop-color="#173F35"/>
      <stop offset="100%" stop-color="#0a1a15"/>
    </linearGradient>
    <radialGradient id="goldAmbient" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="#D4AF6B" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#D4AF6B" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGrad)"/>
  <rect width="100%" height="100%" fill="url(#goldAmbient)"/>
  <g stroke="#D4AF6B" stroke-width="1.5" opacity="0.45" fill="none">
    <circle cx="600" cy="360" r="130"/>
    <circle cx="600" cy="360" r="148" stroke-dasharray="4 6"/>
    <rect x="440" y="200" width="320" height="320" rx="4"/>
    <polygon points="600,215 615,250 655,250 625,275 635,310 600,290 565,310 575,275 545,250 585,250" fill="#D4AF6B" opacity="0.6"/>
  </g>
  <text x="600" y="410" font-family="'Playfair Display', Georgia, serif" font-size="30" font-weight="600" fill="#F8F6F0" text-anchor="middle" letter-spacing="4">ATITHIGO ATELIER</text>
  <text x="600" y="445" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="600" fill="#D4AF6B" text-anchor="middle" letter-spacing="5">5★ VERIFIED LUXURY SANCTUARY</text>
  <text x="600" y="485" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="400" fill="#B4C0B1" text-anchor="middle" letter-spacing="2">${cleanTitle}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Resolves a reliable image source for a hotel.
 */
export function getHotelImageUrl(hotel, index = 0) {
  if (!hotel) return LOCAL_HOTEL_IMAGES[0];
  const remote = hotel.heroImage || (hotel.images && hotel.images[0]);
  if (remote && typeof remote === "string" && remote.trim().length > 0) {
    return remote;
  }
  const fallbackIndex = Math.abs((hotel.name || "hotel").split("").reduce((acc, c) => acc + c.charCodeAt(0), index)) % LOCAL_HOTEL_IMAGES.length;
  return LOCAL_HOTEL_IMAGES[fallbackIndex];
}

/**
 * Resolves a reliable image source for a room.
 */
export function getRoomImageUrl(room, index = 0) {
  if (!room) return LOCAL_ROOM_IMAGES[0];
  const remote = room.heroImage || (room.gallery && room.gallery[0]);
  if (remote && typeof remote === "string" && remote.trim().length > 0) {
    return remote;
  }
  const fallbackIndex = Math.abs((room.name || "room").split("").reduce((acc, c) => acc + c.charCodeAt(0), index)) % LOCAL_ROOM_IMAGES.length;
  return LOCAL_ROOM_IMAGES[fallbackIndex];
}

/**
 * Graceful error handler for any image element.
 * Guarantees that a broken URL cascades: Remote -> Local Bundle -> Inline SVG Data URI.
 */
export function handleImageFallback(e, type = "hotel", title = "") {
  const target = e.currentTarget || e.target;
  if (!target) return;

  const currentSrc = target.getAttribute("src") || "";
  const attemptCount = Number(target.getAttribute("data-fallback-attempt") || 0);

  target.setAttribute("data-fallback-attempt", String(attemptCount + 1));

  if (attemptCount === 0) {
    // Attempt 1: Switch to bundled high-res local asset
    const list = type === "room" ? LOCAL_ROOM_IMAGES : LOCAL_HOTEL_IMAGES;
    const localAsset = list[Math.floor(Math.random() * list.length)];
    if (currentSrc !== localAsset) {
      target.src = localAsset;
      return;
    }
  }

  // Attempt 2: Final permanent fallback — inline SVG data URI (zero network, 100% offline)
  target.onerror = null; // Prevent loop
  target.src = getLuxurySvgPlaceholder(title || target.alt || "Luxury Sanctuary");
}
