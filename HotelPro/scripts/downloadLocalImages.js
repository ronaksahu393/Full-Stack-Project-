const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TARGET_DIR = path.resolve(__dirname, '../client/public/images');

const IMAGES_TO_FETCH = [
  // Hero slides
  { file: 'hero/slide-1.jpg', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80' },
  { file: 'hero/slide-2.jpg', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80' },
  { file: 'hero/slide-3.jpg', url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1600&q=80' },
  { file: 'hero/slide-4.jpg', url: 'https://images.unsplash.com/photo-1540541338537-4680f3b6e9a6?auto=format&fit=crop&w=1600&q=80' },
  { file: 'hero/slide-5.jpg', url: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1600&q=80' },

  // Hotels
  { file: 'hotels/hotel-1.jpg', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },
  { file: 'hotels/hotel-2.jpg', url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80' },
  { file: 'hotels/hotel-3.jpg', url: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80' },
  { file: 'hotels/hotel-4.jpg', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=80' },
  { file: 'hotels/hotel-5.jpg', url: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1200&q=80' },
  { file: 'hotels/hotel-6.jpg', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80' },
  { file: 'hotels/hotel-7.jpg', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80' },
  { file: 'hotels/hotel-8.jpg', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80' },
  { file: 'hotels/hotel-default.jpg', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },

  // Rooms
  { file: 'rooms/room-1.jpg', url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80' },
  { file: 'rooms/room-2.jpg', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80' },
  { file: 'rooms/room-3.jpg', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80' },
  { file: 'rooms/room-4.jpg', url: 'https://images.unsplash.com/photo-1540541338537-4680f3b6e9a6?auto=format&fit=crop&w=1200&q=80' },
  { file: 'rooms/room-default.jpg', url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80' },

  // Destinations
  { file: 'destinations/jaipur.jpg', url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80' },
  { file: 'destinations/goa.jpg', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80' },
  { file: 'destinations/udaipur.jpg', url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80' },
  { file: 'destinations/munnar.jpg', url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80' },
  { file: 'destinations/varanasi.jpg', url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80' },
  { file: 'destinations/shimla.jpg', url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80' }
];

function generateSvgFallback(name) {
  const cleanTitle = name.replace(/[-_]/g, ' ').toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E251E"/>
      <stop offset="50%" stop-color="#173F35"/>
      <stop offset="100%" stop-color="#081410"/>
    </linearGradient>
    <radialGradient id="goldGlow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#D4AF6B" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#D4AF6B" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#goldGlow)"/>
  <g stroke="#D4AF6B" stroke-width="1.5" opacity="0.4" fill="none">
    <circle cx="600" cy="380" r="140"/>
    <circle cx="600" cy="380" r="160" stroke-dasharray="4 6"/>
    <rect x="420" y="200" width="360" height="360" rx="8"/>
    <polygon points="600,220 620,260 660,260 630,285 640,325 600,300 560,325 570,285 540,260 580,260" fill="#D4AF6B" opacity="0.6"/>
  </g>
  <text x="600" y="420" font-family="'Playfair Display', Georgia, serif" font-size="34" font-weight="600" fill="#F8F6F0" text-anchor="middle" letter-spacing="4">HOTELPRO ATELIER</text>
  <text x="600" y="460" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600" fill="#D4AF6B" text-anchor="middle" letter-spacing="6">LUXURY BOUTIQUE SANCTUARY</text>
  <text x="600" y="500" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="400" fill="#A8B4A5" text-anchor="middle" letter-spacing="3">${cleanTitle}</text>
</svg>`;
}

async function run() {
  console.log(`✦ Starting local image download into: ${TARGET_DIR}`);

  let successCount = 0;
  let fallbackCount = 0;

  for (const item of IMAGES_TO_FETCH) {
    const destPath = path.join(TARGET_DIR, item.file);
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    try {
      console.log(`Downloading ${item.file}...`);
      execSync(`curl.exe -s -L -f --max-time 15 -o "${destPath}" "${item.url}"`);
      const stat = fs.statSync(destPath);
      if (stat.size > 2000) {
        successCount++;
        console.log(`  ✓ Saved ${item.file} (${Math.round(stat.size / 1024)} KB)`);
        continue;
      }
      throw new Error(`File too small (${stat.size} bytes)`);
    } catch (err) {
      console.warn(`  ⚠ Curl failed for ${item.file}, generating luxury SVG fallback...`);
      const svgContent = generateSvgFallback(path.basename(item.file, path.extname(item.file)));
      const svgPath = destPath.replace(/\.jpg$/, '.svg');
      fs.writeFileSync(svgPath, svgContent, 'utf8');
      // Also write as fallback .jpg name so any reference resolves
      fs.writeFileSync(destPath, svgContent, 'utf8');
      fallbackCount++;
    }
  }

  // Create an explicit offline fallback SVG image that is guaranteed to exist
  const masterFallbackSvg = generateSvgFallback('Luxury Hotel Sanctuary');
  fs.writeFileSync(path.join(TARGET_DIR, 'fallback-hotel.svg'), masterFallbackSvg, 'utf8');
  fs.writeFileSync(path.join(TARGET_DIR, 'fallback-hotel.jpg'), masterFallbackSvg, 'utf8');

  console.log(`\n✦ Completed! ${successCount} local photos saved, ${fallbackCount} luxury SVGs generated.`);
}

run();
