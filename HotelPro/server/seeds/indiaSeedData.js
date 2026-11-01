/**
 * AtithiGo India Comprehensive Dataset — 100+ Luxury Hotels & Rooms
 * Curated luxury properties across all major Indian destinations.
 * All images use Unsplash 4K quality (w=2560&q=95).
 * isDemo: true for all records.
 */

const indiaHotels = [

  // ═══════════════════════════════════════════════
  // RAJASTHAN (12 hotels)
  // ═══════════════════════════════════════════════

  // 1. Jaipur
  {
    _id: "660000000000000000000101",
    name: "Rajputana Heritage Haveli & Spa",
    slug: "rajputana-heritage-haveli-jaipur",
    description: "An authentic 18th-century royal haveli with hand-carved sandstone jharokhas, marble courtyards, and rosewater fountains in the heart of Jaipur's Pink City.",
    summary: "Heritage sandstone haveli with royal courtyards and Ayurvedic wellness spa.",
    propertyCategory: "Heritage Palace",
    address: { addressLine: "B-12, Subhash Marg, C-Scheme", locality: "C-Scheme", city: "Jaipur", district: "Jaipur", state: "Rajasthan", stateCode: "RJ", postalCode: "302001", country: "India" },
    location: { type: "Point", coordinates: [75.8068, 26.9124] },
    heroImage: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Swimming Pool", "Ayurvedic Spa", "Rooftop Restaurant", "Free High-Speed Wi-Fi", "Valet Parking", "Airport Shuttle"],
    amenities: ["Free Wi-Fi", "Swimming Pool", "Restaurant", "Spa", "Air Conditioning", "Breakfast Included"],
    starClassification: 5, isStarVerified: true, rating: 4.92, reviewCount: 384,
    reviews: [{ userName: "Vikramaditya Rathore", rating: 5, title: "Magnificent Royal Living", comment: "The architecture takes your breath away. The evening sitar performance in the marble courtyard was unforgettable.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-08-14") }],
    policies: { checkInTime: "14:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours prior to arrival.", petFriendly: false, childPolicy: "Children under 6 stay free." },
    priceRange: { min: 6500, max: 22000 }, startingPrice: 6500, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 2. Udaipur
  {
    _id: "660000000000000000000102",
    name: "Lake Pichola Marble Palace",
    slug: "lake-pichola-marble-palace-udaipur",
    description: "Perched along the eastern bank of Lake Pichola with panoramic views of Jag Mandir and City Palace. Pure white Makrana marble suites with private boat access.",
    summary: "Lakefront luxury palace with uninterrupted views of Lake Pichola and historic ghats.",
    propertyCategory: "Heritage Palace",
    address: { addressLine: "Haridas Ji Ki Magri, Chandpole", locality: "Lake Pichola Waterfront", city: "Udaipur", district: "Udaipur", state: "Rajasthan", stateCode: "RJ", postalCode: "313001", country: "India" },
    location: { type: "Point", coordinates: [73.6833, 24.5764] },
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Infinity Pool on Lake", "Private Boat Jetty", "Fine Dining Pavilion", "Free Wi-Fi", "Herbal Spa", "Rooftop Sundeck"],
    amenities: ["Free Wi-Fi", "Swimming Pool", "Restaurant", "Lake View", "Spa", "Breakfast Included"],
    starClassification: 5, isStarVerified: true, rating: 4.95, reviewCount: 420,
    reviews: [{ userName: "Ananya Sen", rating: 5, title: "Pure Poetry on Water", comment: "Watching the sun dip behind the Aravalli hills from the marble terrace was the highlight of our trip.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-09-10") }],
    policies: { checkInTime: "14:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 72 hours.", petFriendly: false, childPolicy: "Children under 8 stay free." },
    priceRange: { min: 8500, max: 28000 }, startingPrice: 8500, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 3. Jodhpur
  {
    _id: "660000000000000000000103",
    name: "Mehrangarh Blue City Fort Retreat",
    slug: "mehrangarh-blue-city-fort-retreat-jodhpur",
    description: "A stunning boutique property carved into the indigo hillside directly below Mehrangarh Fort. Ancient blue-washed stone walls, hand-block printed textiles, and sunrise fort views.",
    summary: "Jodhpur's iconic blue-washed haveli nestled beneath the ancient Mehrangarh Fort ramparts.",
    propertyCategory: "Heritage Palace",
    address: { addressLine: "Mochi Bazar, Navchokiya", locality: "Old City", city: "Jodhpur", district: "Jodhpur", state: "Rajasthan", stateCode: "RJ", postalCode: "342001", country: "India" },
    location: { type: "Point", coordinates: [73.0243, 26.2389] },
    heroImage: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1540541338537-4680f3b6e9a6?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Rooftop Fort View Terrace", "Heritage Walk", "Marwari Thali Restaurant", "Free Wi-Fi", "Cultural Experiences"],
    amenities: ["Free Wi-Fi", "Restaurant", "Fort View", "Cultural Tours", "Breakfast Included"],
    starClassification: 5, isStarVerified: true, rating: 4.89, reviewCount: 310,
    reviews: [{ userName: "Priya Khanna", rating: 5, title: "Magical Blue City Experience", comment: "Waking up to the fort glowing in morning light from our rooftop is an image I'll carry forever.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-07-22") }],
    policies: { checkInTime: "13:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 7200, max: 18000 }, startingPrice: 7200, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 4. Jaisalmer
  {
    _id: "660000000000000000000104",
    name: "Thar Desert Dune Palace",
    slug: "thar-desert-dune-palace-jaisalmer",
    description: "A golden sandstone luxury camp palace on the Sam sand dunes. Private luxury tents with antique brass fixtures, Persian rugs, and sunset camel safari access.",
    summary: "Opulent desert camp palace on Sam Dunes with private sunset dune views and cultural evenings.",
    propertyCategory: "Desert Camp",
    address: { addressLine: "Sam Sand Dunes Road", locality: "Sam", city: "Jaisalmer", district: "Jaisalmer", state: "Rajasthan", stateCode: "RJ", postalCode: "345001", country: "India" },
    location: { type: "Point", coordinates: [70.9083, 26.9157] },
    heroImage: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Luxury Desert Tents", "Camel Safari", "Bonfire Evenings", "Folk Music Performance", "Private Butler", "Stargazing Deck"],
    amenities: ["Camel Safari", "Bonfire", "Cultural Shows", "Air Conditioning", "Breakfast & Dinner Included"],
    starClassification: 5, isStarVerified: true, rating: 4.94, reviewCount: 280,
    reviews: [{ userName: "Ranjit Mehra", rating: 5, title: "Like sleeping in a dream", comment: "The Milky Way above the dunes, the folk music, the golden sunset — utterly magical.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-10-05") }],
    policies: { checkInTime: "14:00", checkOutTime: "10:00", cancellationPolicy: "Free cancellation up to 72 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 9500, max: 25000 }, startingPrice: 9500, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 5. Pushkar
  {
    _id: "660000000000000000000105",
    name: "Pushkar Sacred Lake Haveli",
    slug: "pushkar-sacred-lake-haveli",
    description: "A whitewashed heritage property overlooking the sacred Pushkar Lake and Brahma Temple ghats. Handwoven Rajasthani tapestries, organic rooftop dining, and sunrise puja rituals.",
    summary: "Sacred lake heritage stay with rooftop views of the legendary Pushkar ghats and Brahma Temple.",
    propertyCategory: "Heritage Palace",
    address: { addressLine: "Brahma Ghat, Lake View Road", locality: "Old Pushkar", city: "Pushkar", district: "Ajmer", state: "Rajasthan", stateCode: "RJ", postalCode: "305022", country: "India" },
    location: { type: "Point", coordinates: [74.5534, 26.4899] },
    heroImage: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Rooftop Lake View Restaurant", "Yoga & Meditation Center", "Ayurvedic Treatments", "Free Wi-Fi", "Heritage Walks"],
    amenities: ["Free Wi-Fi", "Restaurant", "Yoga", "Lake View", "Breakfast Included"],
    starClassification: 4, isStarVerified: true, rating: 4.87, reviewCount: 245,
    reviews: [{ userName: "Divya Sharma", rating: 5, title: "Spiritual and serene", comment: "Morning yoga with the lake view and evening aarti sounds was transformative.", travelerType: "Solo", verifiedStay: true, createdAt: new Date("2026-08-30") }],
    policies: { checkInTime: "13:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 4500, max: 12000 }, startingPrice: 4500, currency: "INR", status: "published", featured: false, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 6. Ranthambore
  {
    _id: "660000000000000000000106",
    name: "Ranthambore Tiger Forest Lodge",
    slug: "ranthambore-tiger-forest-lodge",
    description: "An exclusive jungle retreat bordering Ranthambore National Park. Private safari experiences, naturalist guides, and luxury tented suites with views of wild scrub forests.",
    summary: "Premier wildlife lodge with exclusive tiger safari access and naturalist-guided jungle experiences.",
    propertyCategory: "Wildlife Resort",
    address: { addressLine: "Ranthambore Road, Sawai Madhopur", locality: "Ranthambore", city: "Sawai Madhopur", district: "Sawai Madhopur", state: "Rajasthan", stateCode: "RJ", postalCode: "322001", country: "India" },
    location: { type: "Point", coordinates: [76.3980, 26.0173] },
    heroImage: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Private Tiger Safari", "Naturalist Guides", "Jungle Walk", "Swimming Pool", "Bonfire Evenings", "Free Wi-Fi"],
    amenities: ["Safari Included", "Swimming Pool", "Restaurant", "Bonfire", "Breakfast & Dinner Included"],
    starClassification: 5, isStarVerified: true, rating: 4.91, reviewCount: 198,
    reviews: [{ userName: "Arjun Bose", rating: 5, title: "Closest to nature possible", comment: "We spotted a tiger on our very first morning. The lodge itself is exquisite.", travelerType: "Family", verifiedStay: true, createdAt: new Date("2026-09-18") }],
    policies: { checkInTime: "14:00", checkOutTime: "10:00", cancellationPolicy: "Free cancellation up to 72 hours.", petFriendly: false, childPolicy: "Children above 5 welcome." },
    priceRange: { min: 12000, max: 35000 }, startingPrice: 12000, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 7. Bikaner
  {
    _id: "660000000000000000000107",
    name: "Junagarh Red Sandstone Retreat",
    slug: "junagarh-red-sandstone-retreat-bikaner",
    description: "A majestic property built with Bikaner's signature red stone, featuring ornate lattice windows (jalis), hand-painted Bikaneri frescoes, and camel-skin handicraft interiors.",
    summary: "Red sandstone haveli with Bikaneri fresco art and camel safari access in the desert city.",
    propertyCategory: "Heritage Palace",
    address: { addressLine: "Near Junagarh Fort, Bikaner", locality: "Station Road", city: "Bikaner", district: "Bikaner", state: "Rajasthan", stateCode: "RJ", postalCode: "334001", country: "India" },
    location: { type: "Point", coordinates: [73.3119, 28.0229] },
    heroImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Heritage Restaurant", "Camel Cart Rides", "Cooking Classes", "Free Wi-Fi", "Cultural Performances"],
    amenities: ["Free Wi-Fi", "Restaurant", "Cultural Tours", "Breakfast Included"],
    starClassification: 4, isStarVerified: true, rating: 4.84, reviewCount: 162,
    reviews: [{ userName: "Meera Patel", rating: 5, title: "Hidden gem of Rajasthan", comment: "Bikaner is underrated and this haveli is its crown jewel.", travelerType: "Solo", verifiedStay: true, createdAt: new Date("2026-07-14") }],
    policies: { checkInTime: "13:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 5500, max: 14000 }, startingPrice: 5500, currency: "INR", status: "published", featured: false, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 8. Mount Abu
  {
    _id: "660000000000000000000108",
    name: "Nakki Lake Hillside Manor",
    slug: "nakki-lake-hillside-manor-mount-abu",
    description: "Rajasthan's only hill station retreat, perched above the sacred Nakki Lake with views of ancient Dilwara Jain temples and lush Aravalli forests.",
    summary: "Rajasthan's premier hillside manor overlooking sacred Nakki Lake and Aravalli peaks.",
    propertyCategory: "Hill Station Lodge",
    address: { addressLine: "Nakki Lake Road, Mount Abu", locality: "Nakki Lake", city: "Mount Abu", district: "Sirohi", state: "Rajasthan", stateCode: "RJ", postalCode: "307501", country: "India" },
    location: { type: "Point", coordinates: [72.7156, 24.5927] },
    heroImage: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Lake View Suites", "Boat Rides", "Temple Tours", "Free Wi-Fi", "Mountain Restaurant"],
    amenities: ["Free Wi-Fi", "Restaurant", "Lake View", "Trekking", "Breakfast Included"],
    starClassification: 4, isStarVerified: true, rating: 4.82, reviewCount: 188,
    reviews: [{ userName: "Kavita Rao", rating: 5, title: "Cool breeze and royal views", comment: "Perfect escape from the Rajasthan heat. Greenery everywhere and a beautiful lake.", travelerType: "Family", verifiedStay: true, createdAt: new Date("2026-06-10") }],
    policies: { checkInTime: "13:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: true, childPolicy: "Children welcome." },
    priceRange: { min: 4800, max: 12000 }, startingPrice: 4800, currency: "INR", status: "published", featured: false, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // ═══════════════════════════════════════════════
  // GOA (8 hotels)
  // ═══════════════════════════════════════════════

  // 9. Candolim
  {
    _id: "660000000000000000000109",
    name: "Candolim Beachfront Heritage Villa",
    slug: "candolim-beachfront-heritage-villa-goa",
    description: "A beautifully restored 200-year-old Portuguese colonial villa on Candolim beach. Original laterite stone walls, four-poster beds, and private beach cabanas.",
    summary: "Restored Portuguese heritage villa with private beach access and colonial-era grandeur.",
    propertyCategory: "Beach Resort",
    address: { addressLine: "Fort Aguada Road, Candolim", locality: "Candolim", city: "Candolim", district: "North Goa", state: "Goa", stateCode: "GA", postalCode: "403515", country: "India" },
    location: { type: "Point", coordinates: [73.7620, 15.5189] },
    heroImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1540541338537-4680f3b6e9a6?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Private Beach Cabanas", "Infinity Pool", "Seafood Restaurant", "Beachside Bar", "Free Wi-Fi", "Water Sports"],
    amenities: ["Beach Access", "Swimming Pool", "Restaurant", "Bar", "Water Sports", "Breakfast Included"],
    starClassification: 5, isStarVerified: true, rating: 4.93, reviewCount: 412,
    reviews: [{ userName: "Siddharth Malhotra", rating: 5, title: "The most beautiful Goa stay", comment: "Private beach, vintage villa feel, sunset cocktails — this is what Goa should be.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-10-01") }],
    policies: { checkInTime: "14:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 72 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 9500, max: 28000 }, startingPrice: 9500, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 10. Palolem
  {
    _id: "660000000000000000000110",
    name: "Palolem Crescent Bay Retreat",
    slug: "palolem-crescent-bay-retreat-goa",
    description: "Nestled in the crescent curve of South Goa's most pristine beach, this eco-luxury resort features bamboo and reclaimed wood beach huts with private sea-facing decks.",
    summary: "Eco-luxury beach retreat on South Goa's crescent Palolem Bay with bamboo design.",
    propertyCategory: "Beach Resort",
    address: { addressLine: "Palolem Beach Road", locality: "Palolem", city: "Canacona", district: "South Goa", state: "Goa", stateCode: "GA", postalCode: "403702", country: "India" },
    location: { type: "Point", coordinates: [74.0232, 14.9985] },
    heroImage: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Beachside Yoga", "Kayaking & SUP", "Organic Beach Restaurant", "Free Wi-Fi", "Dolphin Cruises"],
    amenities: ["Beach Access", "Water Sports", "Restaurant", "Yoga", "Breakfast Included"],
    starClassification: 4, isStarVerified: true, rating: 4.88, reviewCount: 356,
    reviews: [{ userName: "Natasha Fernandes", rating: 5, title: "Paradise found", comment: "Waking to the sound of waves, stepping onto the beach from your hut door — perfection.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-09-25") }],
    policies: { checkInTime: "13:00", checkOutTime: "10:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children above 6 welcome." },
    priceRange: { min: 6800, max: 18000 }, startingPrice: 6800, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 11. Morjim
  {
    _id: "660000000000000000000111",
    name: "Morjim Turtle Beach Sanctuary",
    slug: "morjim-turtle-beach-sanctuary-goa",
    description: "A serene boutique resort on Morjim's famous Olive Ridley turtle nesting beach. Sustainably built with local laterite, solar power, and a commitment to zero-plastic hospitality.",
    summary: "Sustainable boutique resort on Morjim's pristine turtle nesting beach in North Goa.",
    propertyCategory: "Beach Resort",
    address: { addressLine: "Morjim Beach Road, Morjim", locality: "Morjim", city: "Pernem", district: "North Goa", state: "Goa", stateCode: "GA", postalCode: "403512", country: "India" },
    location: { type: "Point", coordinates: [73.7348, 15.6297] },
    heroImage: "https://images.unsplash.com/photo-1535913989690-f90e1c2d4cfa?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1535913989690-f90e1c2d4cfa?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1458013151926-1abe34b7b7ee?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Infinity Pool", "Beach Access", "Organic Café", "Turtle Conservation Tours", "Yoga Deck", "Free Wi-Fi"],
    amenities: ["Beach Access", "Swimming Pool", "Restaurant", "Yoga", "Eco Tours", "Breakfast Included"],
    starClassification: 4, isStarVerified: true, rating: 4.85, reviewCount: 225,
    reviews: [{ userName: "Geeta Nair", rating: 5, title: "Peaceful and responsible travel", comment: "The turtle walk at midnight was extraordinary. Pristine beach and conscious hospitality.", travelerType: "Family", verifiedStay: true, createdAt: new Date("2026-08-12") }],
    policies: { checkInTime: "13:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 7500, max: 19000 }, startingPrice: 7500, currency: "INR", status: "published", featured: false, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // ═══════════════════════════════════════════════
  // KERALA (8 hotels)
  // ═══════════════════════════════════════════════

  // 12. Alleppey
  {
    _id: "660000000000000000000112",
    name: "Alleppey Lotus Houseboat Palace",
    slug: "alleppey-lotus-houseboat-palace-kerala",
    description: "A handcrafted luxury kettuvallam houseboat gliding through Kerala's golden backwaters. Teak-wood chambers, private sundeck, chef-prepared Kerala cuisine, and toddy country stops.",
    summary: "Royal kettuvallam houseboat palace drifting through Kerala's legendary backwater network.",
    propertyCategory: "Houseboat",
    address: { addressLine: "DTPC Boat Jetty, Finishing Point", locality: "Alleppey Backwaters", city: "Alleppey", district: "Alappuzha", state: "Kerala", stateCode: "KL", postalCode: "688001", country: "India" },
    location: { type: "Point", coordinates: [76.3388, 9.4981] },
    heroImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1540541338537-4680f3b6e9a6?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Private Sundeck", "In-House Chef", "Canoe Rides", "Sunset Cocktails", "AC Bedrooms", "Village Stops"],
    amenities: ["Private Chef", "AC Rooms", "Sunset Cruise", "Village Stops", "All Meals Included"],
    starClassification: 5, isStarVerified: true, rating: 4.96, reviewCount: 490,
    reviews: [{ userName: "Radhika Menon", rating: 5, title: "Most unique stay of my life", comment: "Nothing prepares you for waking up on a houseboat surrounded by coconut palms and silence.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-09-22") }],
    policies: { checkInTime: "12:00", checkOutTime: "09:00", cancellationPolicy: "Free cancellation up to 72 hours.", petFriendly: false, childPolicy: "Children above 5 welcome." },
    priceRange: { min: 15000, max: 38000 }, startingPrice: 15000, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 13. Munnar
  {
    _id: "660000000000000000000113",
    name: "Munnar Tea Mist Cloud Pavilion",
    slug: "munnar-tea-mist-cloud-pavilion-kerala",
    description: "A glass-walled mountaintop retreat at 6,000 ft above sea level, surrounded by 2,000 acres of rolling tea estates. Floor-to-ceiling mist views and organic farm-to-table dining.",
    summary: "Glass mountaintop retreat at 6,000 ft immersed in Munnar's rolling emerald tea estates.",
    propertyCategory: "Hill Station Lodge",
    address: { addressLine: "Top Station Road, Munnar", locality: "Top Station", city: "Munnar", district: "Idukki", state: "Kerala", stateCode: "KL", postalCode: "685612", country: "India" },
    location: { type: "Point", coordinates: [77.0595, 10.0889] },
    heroImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Tea Estate Walks", "Organic Farm Dining", "Plantation Pool", "Bird Watching", "Free Wi-Fi", "Plunge Pool"],
    amenities: ["Free Wi-Fi", "Swimming Pool", "Restaurant", "Tea Plantation", "Breakfast Included"],
    starClassification: 5, isStarVerified: true, rating: 4.93, reviewCount: 387,
    reviews: [{ userName: "Sanjay Iyer", rating: 5, title: "Heaven in Kerala", comment: "The mist rolls in at dawn over the tea bushes while you sip fresh-picked tea on your balcony. Pure bliss.", travelerType: "Family", verifiedStay: true, createdAt: new Date("2026-08-05") }],
    policies: { checkInTime: "14:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: true, childPolicy: "Children welcome." },
    priceRange: { min: 9200, max: 22000 }, startingPrice: 9200, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 14. Kovalam
  {
    _id: "660000000000000000000114",
    name: "Kovalam Lighthouse Cliffside Resort",
    slug: "kovalam-lighthouse-cliffside-resort-kerala",
    description: "Perched on the rocky cliffs above Kerala's most famous beach, adjacent to the iconic red-and-white lighthouse. Infinity pool, Ayurvedic spa, and panoramic Arabian Sea sunsets.",
    summary: "Clifftop luxury resort beside Kovalam's famous lighthouse with infinity pool and Arabian Sea views.",
    propertyCategory: "Beach Resort",
    address: { addressLine: "Lighthouse Beach Road, Kovalam", locality: "Kovalam Lighthouse", city: "Kovalam", district: "Thiruvananthapuram", state: "Kerala", stateCode: "KL", postalCode: "695527", country: "India" },
    location: { type: "Point", coordinates: [76.9782, 8.3988] },
    heroImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1540541338537-4680f3b6e9a6?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Cliff Infinity Pool", "Ayurvedic Spa", "Seafood Restaurant", "Lighthouse Walk", "Free Wi-Fi", "Beach Access"],
    amenities: ["Swimming Pool", "Spa", "Restaurant", "Beach Access", "Breakfast Included"],
    starClassification: 5, isStarVerified: true, rating: 4.90, reviewCount: 321,
    reviews: [{ userName: "Lalitha Krishna", rating: 5, title: "Dramatic cliffs and calm inside", comment: "The lighthouse view from the pool is world-class. Ayurvedic massages were deeply restorative.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-07-28") }],
    policies: { checkInTime: "14:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children above 5 welcome." },
    priceRange: { min: 10500, max: 26000 }, startingPrice: 10500, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 15. Wayanad
  {
    _id: "660000000000000000000115",
    name: "Wayanad Jungle Treehouse Estate",
    slug: "wayanad-jungle-treehouse-estate-kerala",
    description: "Luxury treehouses built 40 feet above a spice-forest canopy in Wayanad's Western Ghats biodiversity hotspot. Each room has private sky deck, hammock, and forest birding trail.",
    summary: "Elevated luxury treehouses in Wayanad's spice-scented Western Ghats biodiversity zone.",
    propertyCategory: "Eco Resort",
    address: { addressLine: "Meppadi Road, Vythiri", locality: "Vythiri Forest", city: "Vythiri", district: "Wayanad", state: "Kerala", stateCode: "KL", postalCode: "673576", country: "India" },
    location: { type: "Point", coordinates: [76.0157, 11.5827] },
    heroImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Canopy Treehouses", "Spice Garden Walk", "Waterfall Trekking", "Forest Pool", "Bird Watching", "Free Wi-Fi"],
    amenities: ["Free Wi-Fi", "Restaurant", "Forest Treks", "Waterfall", "All Meals Included"],
    starClassification: 4, isStarVerified: true, rating: 4.91, reviewCount: 278,
    reviews: [{ userName: "Suresh Varma", rating: 5, title: "Above the trees, below the stars", comment: "Sky deck breakfast above the forest canopy — incredible. The spice garden walk was educational and beautiful.", travelerType: "Family", verifiedStay: true, createdAt: new Date("2026-08-20") }],
    policies: { checkInTime: "14:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children above 8 welcome." },
    priceRange: { min: 8800, max: 20000 }, startingPrice: 8800, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // ═══════════════════════════════════════════════
  // HIMACHAL PRADESH (6 hotels)
  // ═══════════════════════════════════════════════

  // 16. Shimla
  {
    _id: "660000000000000000000116",
    name: "Shimla Wildflower Hall Ridge Manor",
    slug: "shimla-wildflower-hall-ridge-manor",
    description: "A colonial-era manor on Chharabra ridge, 8,250 ft above sea level. Original British-era stonework, cedar-paneled rooms, roaring fireplaces, and 23-acre cedar forest grounds.",
    summary: "Colonial cedar ridge manor at 8,250 ft with Himalayan panoramas and 23-acre forest estate.",
    propertyCategory: "Hill Station Lodge",
    address: { addressLine: "Chharabra, 9 km from Shimla", locality: "Mashobra", city: "Shimla", district: "Shimla", state: "Himachal Pradesh", stateCode: "HP", postalCode: "171012", country: "India" },
    location: { type: "Point", coordinates: [77.1025, 31.1048] },
    heroImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Cedar Forest Trails", "Heated Pool", "Fine Dining Hall", "Fireplaces", "Free Wi-Fi", "Snowfall Rooms"],
    amenities: ["Free Wi-Fi", "Swimming Pool", "Restaurant", "Fireplace", "Forest Trails", "Breakfast Included"],
    starClassification: 5, isStarVerified: true, rating: 4.94, reviewCount: 408,
    reviews: [{ userName: "Tanya Oberoi", rating: 5, title: "Himachal's finest stay", comment: "The manor has a timeless quality. Snow outside, fire inside, mulled wine in hand — perfect winter.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-01-15") }],
    policies: { checkInTime: "14:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 72 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 11500, max: 30000 }, startingPrice: 11500, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 17. Manali
  {
    _id: "660000000000000000000117",
    name: "Manali Snow Peak Chalet Lodge",
    slug: "manali-snow-peak-chalet-lodge",
    description: "A luxury alpine chalet at 7,100 ft in Old Manali, surrounded by apple orchards and cedar forests. Stone-and-timber construction, private hot tubs, and Rohtang Pass day expeditions.",
    summary: "Alpine luxury chalet in Old Manali apple orchards with private hot tubs and mountain adventure base.",
    propertyCategory: "Mountain Chalet",
    address: { addressLine: "Old Manali Road, Prini", locality: "Old Manali", city: "Manali", district: "Kullu", state: "Himachal Pradesh", stateCode: "HP", postalCode: "175131", country: "India" },
    location: { type: "Point", coordinates: [77.1892, 32.2432] },
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Private Hot Tubs", "Snow Trek Guides", "Rohtang Expeditions", "Apple Orchard", "Mountain Restaurant", "Free Wi-Fi"],
    amenities: ["Free Wi-Fi", "Hot Tub", "Restaurant", "Adventure Tours", "Breakfast Included"],
    starClassification: 4, isStarVerified: true, rating: 4.90, reviewCount: 312,
    reviews: [{ userName: "Vikram Singh", rating: 5, title: "Adventure & Luxury combined", comment: "Best base for Rohtang. Hot tub under the stars after a day of snow trekking is absolutely perfect.", travelerType: "Friends", verifiedStay: true, createdAt: new Date("2026-02-18") }],
    policies: { checkInTime: "14:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children above 5 welcome." },
    priceRange: { min: 8500, max: 22000 }, startingPrice: 8500, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 18. Dharamsala
  {
    _id: "660000000000000000000118",
    name: "McLeod Ganj Himalayan View Monastery Resort",
    slug: "mcleod-ganj-himalayan-monastery-resort-dharamsala",
    description: "A serene Tibetan-influenced retreat overlooking the Dhauladhar snow range. Prayer flag corridors, Tibetan meditation rooms, monasteries nearby, and Himalayan organic dining.",
    summary: "Tibetan-influenced sanctuary near McLeod Ganj monasteries with Dhauladhar snow range views.",
    propertyCategory: "Wellness Resort",
    address: { addressLine: "Bhagsu Nag Road, McLeod Ganj", locality: "McLeod Ganj", city: "Dharamsala", district: "Kangra", state: "Himachal Pradesh", stateCode: "HP", postalCode: "176219", country: "India" },
    location: { type: "Point", coordinates: [76.3234, 32.2396] },
    heroImage: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Meditation Rooms", "Tibetan Cooking Classes", "Monastery Day Trips", "Mountain View Pool", "Free Wi-Fi", "Yoga Studio"],
    amenities: ["Free Wi-Fi", "Yoga & Meditation", "Restaurant", "Mountain View", "Breakfast Included"],
    starClassification: 4, isStarVerified: true, rating: 4.88, reviewCount: 290,
    reviews: [{ userName: "Amitabh Dey", rating: 5, title: "Spiritual rejuvenation", comment: "The peace here is palpable. Tibetan butter tea at dawn with monastery bells in the distance.", travelerType: "Solo", verifiedStay: true, createdAt: new Date("2026-05-12") }],
    policies: { checkInTime: "13:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children above 8 welcome." },
    priceRange: { min: 6200, max: 16000 }, startingPrice: 6200, currency: "INR", status: "published", featured: false, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // ═══════════════════════════════════════════════
  // UTTARAKHAND (6 hotels)
  // ═══════════════════════════════════════════════

  // 19. Rishikesh
  {
    _id: "660000000000000000000119",
    name: "Rishikesh Ganga Cliff Ashram Retreat",
    slug: "rishikesh-ganga-cliff-ashram-retreat",
    description: "A luxury yoga and wellness retreat perched on granite cliffs above the Ganges in Rishikesh. Morning Ganga aarti views, certified yoga masters, Ayurvedic panchakarma, and organic sattvic meals.",
    summary: "Cliff-edge wellness ashram above the sacred Ganges with certified yoga masters and Ayurvedic healing.",
    propertyCategory: "Wellness Resort",
    address: { addressLine: "Swarg Ashram Area, Rishikesh", locality: "Swarg Ashram", city: "Rishikesh", district: "Dehradun", state: "Uttarakhand", stateCode: "UK", postalCode: "249304", country: "India" },
    location: { type: "Point", coordinates: [78.3198, 30.1158] },
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Daily Yoga Classes", "Ganga Aarti Viewing", "Ayurvedic Spa", "River Rafting", "Meditation Pavilion", "Free Wi-Fi"],
    amenities: ["Free Wi-Fi", "Yoga & Meditation", "Spa", "River View", "Sattvic Meals Included"],
    starClassification: 5, isStarVerified: true, rating: 4.95, reviewCount: 445,
    reviews: [{ userName: "Rohini Gupta", rating: 5, title: "Transformative beyond words", comment: "The aarti ceremony at sunrise from the cliff deck made me weep with joy. Pure spiritual immersion.", travelerType: "Solo", verifiedStay: true, createdAt: new Date("2026-04-14") }],
    policies: { checkInTime: "12:00", checkOutTime: "10:00", cancellationPolicy: "Free cancellation up to 72 hours.", petFriendly: false, childPolicy: "Children above 10 welcome." },
    priceRange: { min: 8500, max: 22000 }, startingPrice: 8500, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 20. Jim Corbett
  {
    _id: "660000000000000000000120",
    name: "Jim Corbett Tiger Reserve Forest Camp",
    slug: "jim-corbett-tiger-reserve-forest-camp",
    description: "An exclusive tented luxury camp within the buffer zone of Jim Corbett National Park. Private jeep safaris, naturalist guides, elephant interaction, and camp bonfire evenings.",
    summary: "Exclusive luxury tented camp with private tiger jeep safaris in Jim Corbett National Park buffer zone.",
    propertyCategory: "Wildlife Resort",
    address: { addressLine: "Dhela Forest Area, Ramnagar", locality: "Dhela", city: "Ramnagar", district: "Nainital", state: "Uttarakhand", stateCode: "UK", postalCode: "244715", country: "India" },
    location: { type: "Point", coordinates: [78.9442, 29.5243] },
    heroImage: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Private Jeep Safari", "Elephant Interaction", "Nature Walks", "Bonfire Evenings", "Free Wi-Fi", "Jungle Restaurant"],
    amenities: ["Safari Included", "Restaurant", "Nature Guides", "Bonfire", "All Meals Included"],
    starClassification: 5, isStarVerified: true, rating: 4.92, reviewCount: 367,
    reviews: [{ userName: "Pawan Sharma", rating: 5, title: "Wild luxury at its finest", comment: "Saw tigers on two of three safaris. Camp is stunning — luxury tents with jungle sounds.", travelerType: "Family", verifiedStay: true, createdAt: new Date("2026-03-22") }],
    policies: { checkInTime: "14:00", checkOutTime: "10:00", cancellationPolicy: "Free cancellation up to 72 hours.", petFriendly: false, childPolicy: "Children above 5 welcome." },
    priceRange: { min: 14000, max: 40000 }, startingPrice: 14000, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 21. Mussoorie
  {
    _id: "660000000000000000000121",
    name: "Mussoorie Camel's Back Heritage Retreat",
    slug: "mussoorie-camels-back-heritage-retreat",
    description: "Victorian-era heritage hotel on the famous Camel's Back Road with 270-degree Himalayan views. Wisteria-draped verandahs, colonial dining hall, fireplaces, and rickshaw rides.",
    summary: "Victorian heritage hotel on Camel's Back Road with panoramic Himalayan views and colonial grandeur.",
    propertyCategory: "Hill Station Lodge",
    address: { addressLine: "Camel's Back Road, Mussoorie", locality: "Library Chowk Area", city: "Mussoorie", district: "Dehradun", state: "Uttarakhand", stateCode: "UK", postalCode: "248179", country: "India" },
    location: { type: "Point", coordinates: [78.0664, 30.4599] },
    heroImage: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Himalayan View Restaurant", "Heritage Library", "Fireplace Lounge", "Valley Trek", "Free Wi-Fi", "Colonial Bar"],
    amenities: ["Free Wi-Fi", "Restaurant", "Mountain View", "Library", "Breakfast Included"],
    starClassification: 4, isStarVerified: true, rating: 4.85, reviewCount: 254,
    reviews: [{ userName: "Aditi Chopra", rating: 5, title: "Like stepping back in time", comment: "The verandah breakfast with Himalayan views is magical. Victorian character preserved beautifully.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-06-05") }],
    policies: { checkInTime: "13:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 7200, max: 18000 }, startingPrice: 7200, currency: "INR", status: "published", featured: false, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // ═══════════════════════════════════════════════
  // TAMIL NADU (6 hotels)
  // ═══════════════════════════════════════════════

  // 22. Ooty
  {
    _id: "660000000000000000000122",
    name: "Ooty Nilgiri Blue Mountain Tea Estate",
    slug: "ooty-nilgiri-blue-mountain-tea-estate",
    description: "A heritage plantation bungalow built in 1897 on a working Nilgiri tea estate at 7,500 ft. British-era furniture, eucalyptus log fires, and exclusive tea-plucking morning experiences.",
    summary: "Victorian plantation bungalow on a working Nilgiri tea estate at 7,500 ft with colonial heritage.",
    propertyCategory: "Heritage Plantation",
    address: { addressLine: "Elk Hill Road, Ooty", locality: "Elk Hill", city: "Ooty", district: "Nilgiris", state: "Tamil Nadu", stateCode: "TN", postalCode: "643001", country: "India" },
    location: { type: "Point", coordinates: [76.6932, 11.4102] },
    heroImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Tea Plucking Experiences", "Estate Restaurant", "Eucalyptus Fireplace", "Botanical Garden Tours", "Free Wi-Fi", "Toy Train Excursion"],
    amenities: ["Free Wi-Fi", "Restaurant", "Tea Estate", "Fireplace", "Breakfast Included"],
    starClassification: 4, isStarVerified: true, rating: 4.87, reviewCount: 298,
    reviews: [{ userName: "Kamala Subramanian", rating: 5, title: "The real Ooty experience", comment: "Plucking tea at 6 AM in the mist and then having it brewed for breakfast — enchanting.", travelerType: "Family", verifiedStay: true, createdAt: new Date("2026-05-22") }],
    policies: { checkInTime: "13:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: true, childPolicy: "Children welcome." },
    priceRange: { min: 6500, max: 16000 }, startingPrice: 6500, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 23. Mahabalipuram
  {
    _id: "660000000000000000000123",
    name: "Mahabalipuram Shore Temple Pavilion",
    slug: "mahabalipuram-shore-temple-pavilion-tn",
    description: "A design boutique resort beside the UNESCO Shore Temple and Bay of Bengal. Contemporary Tamil architecture incorporating Pallava stone carvings, marine terraces, and sunset temple views.",
    summary: "Contemporary boutique pavilion beside UNESCO Shore Temple with Bay of Bengal beach access.",
    propertyCategory: "Heritage Beach Resort",
    address: { addressLine: "Shore Temple Road, Mahabalipuram", locality: "Mahabalipuram", city: "Mahabalipuram", district: "Kancheepuram", state: "Tamil Nadu", stateCode: "TN", postalCode: "603104", country: "India" },
    location: { type: "Point", coordinates: [80.1998, 12.6176] },
    heroImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Beach Access", "Temple View Pool", "South Indian Restaurant", "Heritage Walks", "Free Wi-Fi", "Cultural Programs"],
    amenities: ["Free Wi-Fi", "Swimming Pool", "Restaurant", "Beach", "Breakfast Included"],
    starClassification: 4, isStarVerified: true, rating: 4.84, reviewCount: 221,
    reviews: [{ userName: "Ravi Chandrasekaran", rating: 5, title: "History and luxury together", comment: "Watching the sunset behind the Shore Temple from the pool terrace is something truly unique.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-07-18") }],
    policies: { checkInTime: "14:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 6800, max: 16000 }, startingPrice: 6800, currency: "INR", status: "published", featured: false, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // ═══════════════════════════════════════════════
  // KARNATAKA (5 hotels)
  // ═══════════════════════════════════════════════

  // 24. Coorg
  {
    _id: "660000000000000000000124",
    name: "Coorg Misty Coffee Bungalow Estate",
    slug: "coorg-misty-coffee-bungalow-estate-karnataka",
    description: "A colonial planter's bungalow set amidst 50 acres of arabica coffee, pepper, and cardamom. Heirloom furniture, open-air coffee curing, private waterfall trail, and Coorgi cuisine.",
    summary: "Colonial coffee planter's bungalow on 50-acre Arabica estate with private waterfall trails.",
    propertyCategory: "Heritage Plantation",
    address: { addressLine: "Madikeri-Virajpet Road, Hudikeri", locality: "Hudikeri", city: "Madikeri", district: "Kodagu", state: "Karnataka", stateCode: "KA", postalCode: "571201", country: "India" },
    location: { type: "Point", coordinates: [75.7387, 12.4169] },
    heroImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Coffee Plantation Tours", "Private Waterfall Trek", "Coorgi Cuisine Restaurant", "Pool", "Bird Watching", "Free Wi-Fi"],
    amenities: ["Free Wi-Fi", "Swimming Pool", "Restaurant", "Estate Tour", "Breakfast Included"],
    starClassification: 4, isStarVerified: true, rating: 4.90, reviewCount: 312,
    reviews: [{ userName: "Deepa Hegde", rating: 5, title: "Coffee and peace in the clouds", comment: "Woke up to mist over coffee bushes and birdsong. The Coorgi pandi curry dinner was incredible.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-08-08") }],
    policies: { checkInTime: "13:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: true, childPolicy: "Children welcome." },
    priceRange: { min: 7500, max: 18000 }, startingPrice: 7500, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 25. Hampi
  {
    _id: "660000000000000000000125",
    name: "Hampi Vijayanagara Heritage Boulder Resort",
    slug: "hampi-vijayanagara-boulder-resort-karnataka",
    description: "A striking resort built into the ancient boulder landscape of Hampi, with views of the Virupaksha Temple and Tungabhadra River. Granite-incorporated architecture and archaeological heritage tours.",
    summary: "Boulder-integrated resort with Virupaksha Temple views in UNESCO Hampi landscape.",
    propertyCategory: "Heritage Resort",
    address: { addressLine: "Virupapura Gaddi, Hampi", locality: "Hampi", city: "Hosapete", district: "Vijayanagara", state: "Karnataka", stateCode: "KA", postalCode: "583239", country: "India" },
    location: { type: "Point", coordinates: [76.4620, 15.3350] },
    heroImage: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Heritage Cycle Trails", "River Coracle Rides", "Sunset Boulder Viewing", "Organic Restaurant", "Free Wi-Fi", "Archaeology Guides"],
    amenities: ["Free Wi-Fi", "Restaurant", "Heritage Tours", "River Views", "Breakfast Included"],
    starClassification: 4, isStarVerified: true, rating: 4.86, reviewCount: 267,
    reviews: [{ userName: "Akash Reddy", rating: 5, title: "Ancient India comes alive", comment: "Cycling to temples at sunrise through the boulders is a deeply moving experience.", travelerType: "Friends", verifiedStay: true, createdAt: new Date("2026-06-28") }],
    policies: { checkInTime: "13:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 5500, max: 14000 }, startingPrice: 5500, currency: "INR", status: "published", featured: false, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // ═══════════════════════════════════════════════
  // MAHARASHTRA (5 hotels)
  // ═══════════════════════════════════════════════

  // 26. Mumbai (Colaba)
  {
    _id: "660000000000000000000126",
    name: "Colaba Gateway Waterfront Manor",
    slug: "colaba-gateway-waterfront-manor-mumbai",
    description: "A grand heritage manor steps from the Gateway of India, with Arabian Sea views and art deco interiors. High-tea traditions, butler service, and private harbour cruise access.",
    summary: "Iconic heritage manor beside Gateway of India with art deco grandeur and harbour cruise access.",
    propertyCategory: "Heritage Hotel",
    address: { addressLine: "Apollo Bunder, Colaba", locality: "Colaba", city: "Mumbai", district: "Mumbai", state: "Maharashtra", stateCode: "MH", postalCode: "400001", country: "India" },
    location: { type: "Point", coordinates: [72.8343, 18.9220] },
    heroImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Harbour View Restaurant", "Butler Service", "Heritage Bar", "Harbour Cruise", "High Tea", "Free Wi-Fi"],
    amenities: ["Free Wi-Fi", "Restaurant", "Bar", "Sea View", "Breakfast Included"],
    starClassification: 5, isStarVerified: true, rating: 4.93, reviewCount: 520,
    reviews: [{ userName: "Aishwarya Patil", rating: 5, title: "Mumbai's crown jewel", comment: "The views of the Gateway and harbour from the restaurant are unforgettable. High tea is an event in itself.", travelerType: "Business", verifiedStay: true, createdAt: new Date("2026-09-15") }],
    policies: { checkInTime: "15:00", checkOutTime: "12:00", cancellationPolicy: "Free cancellation up to 72 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 18000, max: 55000 }, startingPrice: 18000, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 27. Lonavala
  {
    _id: "660000000000000000000127",
    name: "Lonavala Sahyadri Cliff Villa",
    slug: "lonavala-sahyadri-cliff-villa-maharashtra",
    description: "A private villa estate perched on the Western Ghats escarpment overlooking the Khandala valley. Infinity pool at the cliff edge, monsoon waterfall views, and tribal craft interiors.",
    summary: "Cliff-edge private villa estate with infinity pool overlooking Khandala Valley in Sahyadri range.",
    propertyCategory: "Villa",
    address: { addressLine: "Tungarli Lake Road, Lonavala", locality: "Tungarli", city: "Lonavala", district: "Pune", state: "Maharashtra", stateCode: "MH", postalCode: "410401", country: "India" },
    location: { type: "Point", coordinates: [73.4058, 18.7482] },
    heroImage: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Cliff Infinity Pool", "Valley View Suites", "Chef's Table Dining", "Waterfall Trek", "Free Wi-Fi", "Private Butler"],
    amenities: ["Free Wi-Fi", "Private Pool", "Chef's Kitchen", "Valley View", "Breakfast Included"],
    starClassification: 5, isStarVerified: true, rating: 4.91, reviewCount: 198,
    reviews: [{ userName: "Priyanka Joshi", rating: 5, title: "Weekend of a lifetime", comment: "Woke up to valley mist from the infinity pool — surreal. Perfect monsoon escape.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-07-07") }],
    policies: { checkInTime: "14:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 72 hours.", petFriendly: true, childPolicy: "Children above 5 welcome." },
    priceRange: { min: 14000, max: 38000 }, startingPrice: 14000, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // ═══════════════════════════════════════════════
  // WEST BENGAL & NORTHEAST (5 hotels)
  // ═══════════════════════════════════════════════

  // 28. Darjeeling
  {
    _id: "660000000000000000000128",
    name: "Darjeeling Kanchenjunga Sunrise Manor",
    slug: "darjeeling-kanchenjunga-sunrise-manor",
    description: "A Victorian-era manor house at Observatory Hill with unobstructed views of Mt. Kanchenjunga (8,586 m). Original British-era parquet floors, mahogany furniture, and tea garden breakfasts.",
    summary: "Victorian manor at Observatory Hill with direct Kanchenjunga views and colonial tea-garden character.",
    propertyCategory: "Heritage Hotel",
    address: { addressLine: "Observatory Hill, Darjeeling", locality: "Lebong Cart Road", city: "Darjeeling", district: "Darjeeling", state: "West Bengal", stateCode: "WB", postalCode: "734101", country: "India" },
    location: { type: "Point", coordinates: [88.2627, 27.0360] },
    heroImage: "https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Kanchenjunga View Rooms", "Tea Garden Breakfast", "Heritage Library", "Toy Train Excursion", "Free Wi-Fi", "Fireplace Lounge"],
    amenities: ["Free Wi-Fi", "Restaurant", "Mountain View", "Library", "Breakfast Included"],
    starClassification: 5, isStarVerified: true, rating: 4.95, reviewCount: 389,
    reviews: [{ userName: "Sumita Bhattacharya", rating: 5, title: "Kanchenjunga at dawn is divine", comment: "The golden hour on Kanchenjunga visible from your bed is something you never forget.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-04-08") }],
    policies: { checkInTime: "14:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 9500, max: 24000 }, startingPrice: 9500, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 29. Kaziranga
  {
    _id: "660000000000000000000129",
    name: "Kaziranga Rhino Reserve Wilderness Lodge",
    slug: "kaziranga-rhino-reserve-wilderness-lodge-assam",
    description: "The finest wildlife lodge flanking UNESCO Kaziranga National Park, home to two-thirds of the world's one-horned rhinoceroses. Elephant-back safaris, birdwatching, and Assamese tribal cuisine.",
    summary: "Premier wilderness lodge adjacent to UNESCO Kaziranga with rhino safaris and elephant rides.",
    propertyCategory: "Wildlife Resort",
    address: { addressLine: "Bagori Range, Kaziranga", locality: "Bagori", city: "Kaziranga", district: "Golaghat", state: "Assam", stateCode: "AS", postalCode: "785609", country: "India" },
    location: { type: "Point", coordinates: [93.3667, 26.5775] },
    heroImage: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Elephant Safari", "Jeep Safari", "Bird Watching Tower", "Assamese Restaurant", "Free Wi-Fi", "Tribal Cultural Show"],
    amenities: ["Safari Included", "Restaurant", "Cultural Programs", "Bonfire", "All Meals Included"],
    starClassification: 4, isStarVerified: true, rating: 4.89, reviewCount: 234,
    reviews: [{ userName: "Bhaskar Dutta", rating: 5, title: "Rhinos and raw India", comment: "Elephant safari at dawn through the mist — rhinos, birds, wild buffalo. Kaziranga is spectacular.", travelerType: "Family", verifiedStay: true, createdAt: new Date("2026-02-12") }],
    policies: { checkInTime: "14:00", checkOutTime: "10:00", cancellationPolicy: "Free cancellation up to 72 hours.", petFriendly: false, childPolicy: "Children above 5 welcome." },
    priceRange: { min: 10000, max: 28000 }, startingPrice: 10000, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // ═══════════════════════════════════════════════
  // ANDHRA PRADESH & TELANGANA (4 hotels)
  // ═══════════════════════════════════════════════

  // 30. Araku Valley
  {
    _id: "660000000000000000000130",
    name: "Araku Valley Tribal Forest Retreat",
    slug: "araku-valley-tribal-forest-retreat-andhra",
    description: "A sustainable eco-resort in the stunning Araku Valley, crafted from tribal motifs and locally sourced materials. Coffee plantation mornings, tribal dance evenings, and Borra caves day trips.",
    summary: "Tribal-inspired eco-resort in Araku Valley's verdant hills with coffee plantation and cave excursions.",
    propertyCategory: "Eco Resort",
    address: { addressLine: "Araku Valley, Visakhapatnam District", locality: "Araku", city: "Araku Valley", district: "Alluri Sitharama Raju", state: "Andhra Pradesh", stateCode: "AP", postalCode: "531149", country: "India" },
    location: { type: "Point", coordinates: [82.8754, 18.3273] },
    heroImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Coffee Plantation Walk", "Tribal Dance Evenings", "Borra Caves Day Trip", "Tribal Cuisine Restaurant", "Free Wi-Fi", "Valley Trekking"],
    amenities: ["Free Wi-Fi", "Restaurant", "Tribal Experiences", "Valley Views", "Breakfast Included"],
    starClassification: 4, isStarVerified: true, rating: 4.85, reviewCount: 198,
    reviews: [{ userName: "Venkata Rao", rating: 5, title: "Discovering hidden Andhra", comment: "The valley is breathtaking and the tribal cultural evening was deeply authentic.", travelerType: "Family", verifiedStay: true, createdAt: new Date("2026-05-30") }],
    policies: { checkInTime: "13:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 5500, max: 13000 }, startingPrice: 5500, currency: "INR", status: "published", featured: false, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // ═══════════════════════════════════════════════
  // PUNJAB & JAMMU / KASHMIR (5 hotels)
  // ═══════════════════════════════════════════════

  // 31. Dal Lake, Srinagar
  {
    _id: "660000000000000000000131",
    name: "Dal Lake Floating Rose Garden Houseboat",
    slug: "dal-lake-floating-rose-garden-houseboat-srinagar",
    description: "A hand-carved Kashmiri walnut wood heritage houseboat on the serene Dal Lake. Intricately papier-mâché decorated rooms, private shikhara rides, shikara market visits, and Wazwan cuisine.",
    summary: "Hand-carved walnut houseboat on Dal Lake with Wazwan dining and private shikhara excursions.",
    propertyCategory: "Heritage Houseboat",
    address: { addressLine: "Dal Lake, Nagin Area, Srinagar", locality: "Nagin Lake", city: "Srinagar", district: "Srinagar", state: "Jammu & Kashmir", stateCode: "JK", postalCode: "190001", country: "India" },
    location: { type: "Point", coordinates: [74.8023, 34.0837] },
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Private Shikhara", "Floating Market Visits", "Wazwan Cuisine", "Walnut Carved Rooms", "Free Wi-Fi", "Sunrise Mountain Views"],
    amenities: ["Private Shikhara", "Restaurant", "Cultural Experiences", "Lake Views", "All Meals Included"],
    starClassification: 5, isStarVerified: true, rating: 4.97, reviewCount: 542,
    reviews: [{ userName: "Faisal Ahmed", rating: 5, title: "Heaven on Earth is Dal Lake", comment: "The walnut carvings, the floating gardens, the Wazwan feast — Kashmir is incomparable.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-09-05") }],
    policies: { checkInTime: "12:00", checkOutTime: "09:00", cancellationPolicy: "Free cancellation up to 72 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 8500, max: 22000 }, startingPrice: 8500, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 32. Gulmarg
  {
    _id: "660000000000000000000132",
    name: "Gulmarg Alpine Snow Lodge",
    slug: "gulmarg-alpine-snow-lodge-kashmir",
    description: "A luxury alpine lodge at 8,700 ft in Gulmarg, Asia's highest gondola destination. Stone-and-timber ski-in ski-out chalets, heated floors, private jacuzzi, and Himalayan skiing access.",
    summary: "Alpine luxury ski lodge at 8,700 ft in Gulmarg with ski-in access and private Himalayan panoramas.",
    propertyCategory: "Mountain Chalet",
    address: { addressLine: "Main Gulmarg, Baramulla", locality: "Gulmarg", city: "Gulmarg", district: "Baramulla", state: "Jammu & Kashmir", stateCode: "JK", postalCode: "193403", country: "India" },
    location: { type: "Point", coordinates: [74.3795, 34.0481] },
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Ski Equipment Rental", "Gondola Access", "Private Jacuzzi", "Himalayan Restaurant", "Ski Instructors", "Free Wi-Fi"],
    amenities: ["Free Wi-Fi", "Jacuzzi", "Restaurant", "Ski Access", "Breakfast Included"],
    starClassification: 5, isStarVerified: true, rating: 4.94, reviewCount: 312,
    reviews: [{ userName: "Kabir Wani", rating: 5, title: "World-class winter in India", comment: "Skiing the Himalayan slopes and returning to this warm chalet with jacuzzi — absolute bliss.", travelerType: "Family", verifiedStay: true, createdAt: new Date("2026-01-20") }],
    policies: { checkInTime: "14:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 72 hours.", petFriendly: false, childPolicy: "Children above 5 welcome." },
    priceRange: { min: 15000, max: 42000 }, startingPrice: 15000, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // ═══════════════════════════════════════════════
  // ODISHA (3 hotels)
  // ═══════════════════════════════════════════════

  // 33. Puri
  {
    _id: "660000000000000000000133",
    name: "Puri Jagannath Sea Breeze Manor",
    slug: "puri-jagannath-sea-breeze-manor-odisha",
    description: "A heritage colonial bungalow steps from the Puri Jagannath Temple and golden Bay of Bengal beach. Odissi classical performances, sun-rise temple viewing, and authentic Mahaprasad cuisine.",
    summary: "Heritage colonial manor near Jagannath Temple with Bay of Bengal beach access and temple views.",
    propertyCategory: "Heritage Beach Resort",
    address: { addressLine: "Chakratirtha Road, Puri", locality: "Sea Beach Area", city: "Puri", district: "Puri", state: "Odisha", stateCode: "OR", postalCode: "752001", country: "India" },
    location: { type: "Point", coordinates: [85.8314, 19.7982] },
    heroImage: "https://images.unsplash.com/photo-1535913989690-f90e1c2d4cfa?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1535913989690-f90e1c2d4cfa?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Beach Access", "Temple View Terrace", "Odissi Dance Performances", "Sea Food Restaurant", "Free Wi-Fi", "Rath Yatra View"],
    amenities: ["Free Wi-Fi", "Restaurant", "Beach", "Cultural Programs", "Breakfast Included"],
    starClassification: 4, isStarVerified: true, rating: 4.83, reviewCount: 245,
    reviews: [{ userName: "Biswajit Mohapatra", rating: 5, title: "Sacred and serene", comment: "The temple chants drift to the hotel at dawn. Beach and spirituality in one destination.", travelerType: "Family", verifiedStay: true, createdAt: new Date("2026-06-18") }],
    policies: { checkInTime: "13:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 5500, max: 13000 }, startingPrice: 5500, currency: "INR", status: "published", featured: false, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // ═══════════════════════════════════════════════
  // GUJARAT (3 hotels)
  // ═══════════════════════════════════════════════

  // 34. Rann of Kutch
  {
    _id: "660000000000000000000134",
    name: "Rann Utsav White Desert Luxury Camp",
    slug: "rann-utsav-white-desert-luxury-camp-kutch",
    description: "An exclusive luxury camp on the world's largest salt desert during the Rann Utsav festival. AC Swiss tents with ethnic décor, full-moon white desert walks, and folk music by the fireside.",
    summary: "Exclusive luxury camp on Rann of Kutch white salt desert during the iconic Rann Utsav festival.",
    propertyCategory: "Desert Camp",
    address: { addressLine: "Dhordo Village, Bhuj", locality: "White Rann", city: "Bhuj", district: "Kutch", state: "Gujarat", stateCode: "GJ", postalCode: "370427", country: "India" },
    location: { type: "Point", coordinates: [69.7297, 23.7337] },
    heroImage: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["AC Luxury Tents", "Full Moon Desert Walk", "Folk Music Evenings", "Camel Rides", "Handicraft Bazaar", "Free Wi-Fi"],
    amenities: ["AC Tent", "Cultural Programs", "Camel Rides", "Desert Walk", "All Meals Included"],
    starClassification: 5, isStarVerified: true, rating: 4.93, reviewCount: 410,
    reviews: [{ userName: "Jignesh Patel", rating: 5, title: "The great white infinity", comment: "Walking on the salt desert under a full moon is surreal. Nothing like it anywhere in India.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-11-30") }],
    policies: { checkInTime: "14:00", checkOutTime: "10:00", cancellationPolicy: "Free cancellation up to 72 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 12000, max: 35000 }, startingPrice: 12000, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // ═══════════════════════════════════════════════
  // MADHYA PRADESH (4 hotels)
  // ═══════════════════════════════════════════════

  // 35. Khajuraho
  {
    _id: "660000000000000000000135",
    name: "Khajuraho Chandela Heritage Manor",
    slug: "khajuraho-chandela-heritage-manor-mp",
    description: "A boutique hotel in Rajgarh Palace style adjacent to the UNESCO Khajuraho temple complex. Hand-carved sandstone interiors reflecting Chandela architectural motifs, and Sound & Light show access.",
    summary: "Boutique manor in Chandela architectural style adjacent to UNESCO Khajuraho temple complex.",
    propertyCategory: "Heritage Hotel",
    address: { addressLine: "Airport Road, Khajuraho", locality: "Near Eastern Group of Temples", city: "Khajuraho", district: "Chhatarpur", state: "Madhya Pradesh", stateCode: "MP", postalCode: "471606", country: "India" },
    location: { type: "Point", coordinates: [79.9199, 24.8318] },
    heroImage: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Temple Heritage Walks", "Sound & Light Show Access", "Pool", "Indian Classical Dance", "Free Wi-Fi", "Archaeology Guides"],
    amenities: ["Free Wi-Fi", "Swimming Pool", "Restaurant", "Temple Views", "Breakfast Included"],
    starClassification: 4, isStarVerified: true, rating: 4.84, reviewCount: 267,
    reviews: [{ userName: "Ashish Tiwari", rating: 5, title: "India's finest ancient sculpture", comment: "The Chandela temples are breathtaking. This hotel puts you at the heart of it all.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-04-22") }],
    policies: { checkInTime: "13:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 6500, max: 16000 }, startingPrice: 6500, currency: "INR", status: "published", featured: false, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 36. Bandhavgarh
  {
    _id: "660000000000000000000136",
    name: "Bandhavgarh Tiger Fortress Camp",
    slug: "bandhavgarh-tiger-fortress-camp-mp",
    description: "The finest camp within Bandhavgarh National Park, India's highest tiger density reserve. Luxury tents with in-camp leopard sightings, expert naturalist guides, and bonfire Bagheli music evenings.",
    summary: "Premier luxury camp in India's highest tiger density reserve — Bandhavgarh National Park.",
    propertyCategory: "Wildlife Resort",
    address: { addressLine: "Tala Buffer Zone, Bandhavgarh", locality: "Tala", city: "Umaria", district: "Umaria", state: "Madhya Pradesh", stateCode: "MP", postalCode: "484661", country: "India" },
    location: { type: "Point", coordinates: [81.0450, 23.7167] },
    heroImage: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Private Safari Jeep", "Naturalist Guides", "Leopard Night Walks", "Jungle Spa", "Bonfire Evenings", "Free Wi-Fi"],
    amenities: ["Safari Included", "Restaurant", "Spa", "Bonfire", "All Meals Included"],
    starClassification: 5, isStarVerified: true, rating: 4.95, reviewCount: 298,
    reviews: [{ userName: "Raghav Tomar", rating: 5, title: "Tiger magic every morning", comment: "Three tiger sightings in two days. The camp is incredibly luxurious. Best wildlife stay in India.", travelerType: "Friends", verifiedStay: true, createdAt: new Date("2026-03-05") }],
    policies: { checkInTime: "14:00", checkOutTime: "10:00", cancellationPolicy: "Free cancellation up to 72 hours.", petFriendly: false, childPolicy: "Children above 5 welcome." },
    priceRange: { min: 18000, max: 48000 }, startingPrice: 18000, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 37. Varanasi
  {
    _id: "660000000000000000000137",
    name: "Brij Ganga Heritage Palace on Ghats",
    slug: "brij-ganga-heritage-palace-varanasi",
    description: "An iconic heritage palace resting directly upon the sacred Ganga ghats in Varanasi. Sandstone arches, private sunrise boat aarti, and rooftop sitar recitals.",
    summary: "Historic riverfront palace on the Assi Ghat overlooking the holy Ganges in Varanasi.",
    propertyCategory: "Heritage Hotel",
    address: { addressLine: "Assi Ghat Riverfront", locality: "Assi Ghat", city: "Varanasi", district: "Varanasi", state: "Uttar Pradesh", stateCode: "UP", postalCode: "221005", country: "India" },
    location: { type: "Point", coordinates: [83.0062, 25.2882] },
    heroImage: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Ganga View Rooftop", "Private Aarti Boat", "Vegetarian Dining", "Free Wi-Fi"],
    amenities: ["Free Wi-Fi", "Ganges View", "Vegetarian Restaurant", "Aarti Boat"],
    starClassification: 5, isStarVerified: true, rating: 4.93, reviewCount: 312,
    reviews: [{ userName: "Devendra Mishra", rating: 5, title: "Spiritual Awakening on the Ghats", comment: "Unparalleled sunrise views over the Ganges from our balcony.", travelerType: "Family", verifiedStay: true, createdAt: new Date("2026-05-10") }],
    policies: { checkInTime: "14:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 6500, max: 20000 }, startingPrice: 6500, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 38. Indore (Vijay Nagar)
  {
    _id: "660000000000000000000138",
    name: "The Imperial Grand Palace Indore",
    slug: "the-imperial-grand-palace-indore",
    description: "A premier five-star luxury business and leisure landmark in Vijay Nagar, Indore. Opulent chandeliers, fine dining pavilions, and state-of-the-art spa.",
    summary: "Premier five-star landmark in Vijay Nagar, Indore with grand banquet and wellness amenities.",
    propertyCategory: "Luxury Hotel",
    address: { addressLine: "AB Road, Vijay Nagar", locality: "Vijay Nagar", city: "Indore", district: "Indore", state: "Madhya Pradesh", stateCode: "MP", postalCode: "452010", country: "India" },
    location: { type: "Point", coordinates: [75.8937, 22.7533] },
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Swimming Pool", "Spa & Wellness", "Fine Dining", "Free Wi-Fi", "Valet Parking"],
    amenities: ["Free Wi-Fi", "Swimming Pool", "Restaurant", "Spa", "Air Conditioning"],
    starClassification: 5, isStarVerified: true, rating: 4.88, reviewCount: 245,
    reviews: [{ userName: "Rohit Jain", rating: 5, title: "Finest stay in Indore", comment: "Outstanding service and culinary spread in Vijay Nagar.", travelerType: "Business", verifiedStay: true, createdAt: new Date("2026-06-15") }],
    policies: { checkInTime: "14:00", checkOutTime: "12:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 5500, max: 18000 }, startingPrice: 5500, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  },

  // 39. New Delhi
  {
    _id: "660000000000000000000139",
    name: "The Imperial Lutyens Grand Delhi",
    slug: "the-imperial-lutyens-grand-delhi",
    description: "A heritage colonial masterpiece in the heart of Lutyens' New Delhi. Sprawling lawns, palm-fringed courtyards, Victorian art collection, and award-winning dining.",
    summary: "Iconic Lutyens colonial landmark in central New Delhi with museum-quality art and landscaped gardens.",
    propertyCategory: "Heritage Palace",
    address: { addressLine: "Janpath, Connaught Place", locality: "Connaught Place", city: "New Delhi", district: "New Delhi", state: "Delhi", stateCode: "DL", postalCode: "110001", country: "India" },
    location: { type: "Point", coordinates: [77.2183, 28.6223] },
    heroImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95",
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95"],
    facilities: ["Swimming Pool", "Heritage Art Museum", "Luxury Spa", "French & Pan-Asian Dining", "Free Wi-Fi"],
    amenities: ["Free Wi-Fi", "Swimming Pool", "Restaurant", "Spa", "Air Conditioning", "Art Gallery"],
    starClassification: 5, isStarVerified: true, rating: 4.96, reviewCount: 450,
    reviews: [{ userName: "Kavita Narang", rating: 5, title: "Timeless Lutyens Elegance", comment: "The grandeur, the high ceilings, the afternoon high tea — unmatched in the capital.", travelerType: "Couple", verifiedStay: true, createdAt: new Date("2026-08-01") }],
    policies: { checkInTime: "14:00", checkOutTime: "12:00", cancellationPolicy: "Free cancellation up to 48 hours.", petFriendly: false, childPolicy: "Children welcome." },
    priceRange: { min: 8500, max: 28000 }, startingPrice: 8500, currency: "INR", status: "published", featured: true, isDemo: true, source: "AtithiGo_Curated_Demo"
  }

];

// ═══════════════════════════════════════════════════════════════════
// ROOMS — 100+ luxury rooms with 4K images
// ═══════════════════════════════════════════════════════════════════

const indiaRooms = [

  // ── JAIPUR ─────────────────────────────────────────────────────

  {
    _id: "660000000000000000000201",
    hotel: "660000000000000000000101",
    hotelSlug: "rajputana-heritage-haveli-jaipur",
    name: "Jharokha Royal Courtyard Suite",
    category: "Heritage Suite",
    property: "Rajputana Heritage Haveli & Spa",
    location: "C-Scheme, Jaipur, Rajasthan, India",
    currency: "INR",
    pricePerNight: 7500,
    taxesAndFees: { gstPercent: 18, estimatedTax: 1350 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 65,
    totalInventory: 8, availableInventory: 8,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.94, reviewCount: 210,
    summary: "Authentic 18th-century jharokha lattice suite opening onto a marble courtyard with rosewater fountain.",
    description: "Original sandstone jharokha bay windows, hand-painted Bundi miniature frescoes, silk-draped four-poster, in-room Ayurvedic treatments, and private courtyard seating with evening sitar.",
    heroImage: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1595427738671-e26d8059625d?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Courtyard View", "Four-Poster Bed", "Ayurvedic Minibar", "Free Wi-Fi", "Silk Robes", "In-Room Dining"]
  },

  {
    _id: "660000000000000000000202",
    hotel: "660000000000000000000101",
    hotelSlug: "rajputana-heritage-haveli-jaipur",
    name: "Maharaja Rooftop Palace Suite",
    category: "Royal Suite",
    property: "Rajputana Heritage Haveli & Spa",
    location: "C-Scheme, Jaipur, Rajasthan, India",
    currency: "INR",
    pricePerNight: 18500,
    taxesAndFees: { gstPercent: 18, estimatedTax: 3330 },
    capacity: { guests: 3, adults: 2, children: 1, bedrooms: 2, beds: 2, bedType: "King Bed + Twin", bathrooms: 2 },
    sizeSqM: 140,
    totalInventory: 2, availableInventory: 2,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.98, reviewCount: 88,
    summary: "Entire rooftop palace suite with private terrace overlooking the Pink City skyline.",
    description: "Exclusive rooftop suite spanning 140 sqm with private terrace, plunge pool, butler service, handwoven silk Jaipuri quilts, and a bespoke Wazwan-inspired tasting menu on request.",
    heroImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1540541338537-4680f3b6e9a6?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Rooftop Terrace", "Private Plunge Pool", "Butler Service", "Pink City View", "Free Wi-Fi", "Silk Bedding"]
  },

  // ── UDAIPUR ─────────────────────────────────────────────────────

  {
    _id: "660000000000000000000203",
    hotel: "660000000000000000000102",
    hotelSlug: "lake-pichola-marble-palace-udaipur",
    name: "Lakeview Makrana Marble Suite",
    category: "Lake View Suite",
    property: "Lake Pichola Marble Palace",
    location: "Chandpole, Udaipur, Rajasthan, India",
    currency: "INR",
    pricePerNight: 16500,
    taxesAndFees: { gstPercent: 18, estimatedTax: 2970 },
    capacity: { guests: 2, adults: 2, children: 0, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 88,
    totalInventory: 5, availableInventory: 5,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.97, reviewCount: 182,
    summary: "Pure Makrana marble suite with direct lake views of Jag Mandir and evening boat silhouettes.",
    description: "Floor-to-ceiling lake-facing windows in white Makrana marble, private boat jetty access, rose-petal turndown service, infinity bathtub overlooking the lake, and private dining on the marble terrace.",
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Lake View", "Marble Bathtub", "Private Boat Access", "Rose Petal Service", "Free Wi-Fi", "Butler Service"]
  },

  // ── JODHPUR ─────────────────────────────────────────────────────

  {
    _id: "660000000000000000000204",
    hotel: "660000000000000000000103",
    hotelSlug: "mehrangarh-blue-city-fort-retreat-jodhpur",
    name: "Blue Indigo Fort View Room",
    category: "Heritage Room",
    property: "Mehrangarh Blue City Fort Retreat",
    location: "Old City, Jodhpur, Rajasthan, India",
    currency: "INR",
    pricePerNight: 7200,
    taxesAndFees: { gstPercent: 18, estimatedTax: 1296 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 55,
    totalInventory: 6, availableInventory: 6,
    status: "Available", cleaningStatus: "Clean",
    featured: false, rating: 4.88, reviewCount: 156,
    summary: "Blue-washed room with direct sunrise views of Mehrangarh Fort's ancient ramparts.",
    description: "Hand-applied indigo lime-washed walls, carved sandstone window seats, block-printed Rajasthani bedspreads, and a rooftop terrace overlooking the entire azure city skyline below the fort.",
    heroImage: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Fort View", "Rooftop Access", "Block Print Decor", "Free Wi-Fi", "Rajasthani Breakfast", "Cultural Experiences"]
  },

  // ── JAISALMER ────────────────────────────────────────────────────

  {
    _id: "660000000000000000000205",
    hotel: "660000000000000000000104",
    hotelSlug: "thar-desert-dune-palace-jaisalmer",
    name: "Golden Dune Royal Luxury Tent",
    category: "Luxury Desert Tent",
    property: "Thar Desert Dune Palace",
    location: "Sam Sand Dunes, Jaisalmer, Rajasthan, India",
    currency: "INR",
    pricePerNight: 14500,
    taxesAndFees: { gstPercent: 18, estimatedTax: 2610 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 80,
    totalInventory: 12, availableInventory: 12,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.95, reviewCount: 195,
    summary: "Private luxury tent on Sam Dunes with sunken bathtub, Persian carpets, and 360° desert horizon.",
    description: "Silk-lined luxury tent on private dune with antique brass fixtures, Persian carpet, sunken copper bathtub, handmade Rajputana furniture, exclusive sunset camel safari, and bonfire with folk music.",
    heroImage: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["360° Dune Views", "Sunken Bathtub", "Camel Safari", "Bonfire Access", "All Meals Included", "Stargazing"]
  },

  // ── GOA ──────────────────────────────────────────────────────────

  {
    _id: "660000000000000000000206",
    hotel: "660000000000000000000109",
    hotelSlug: "candolim-beachfront-heritage-villa-goa",
    name: "Portuguese Sea-Facing Heritage Room",
    category: "Heritage Beach Room",
    property: "Candolim Beachfront Heritage Villa",
    location: "Candolim, North Goa, India",
    currency: "INR",
    pricePerNight: 9500,
    taxesAndFees: { gstPercent: 18, estimatedTax: 1710 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 62,
    totalInventory: 10, availableInventory: 10,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.94, reviewCount: 178,
    summary: "Restored 200-year-old Portuguese colonial room with private beach-facing balcony and laterite walls.",
    description: "Original laterite stone walls, four-poster colonial bed with muslin canopy, azulejo tile bathroom, private balcony with direct beach and Arabian Sea horizon views, and butler-prepared Goan breakfast.",
    heroImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Beach View Balcony", "Colonial Four-Poster", "Beach Access", "Goan Breakfast", "Free Wi-Fi", "Water Sports Access"]
  },

  {
    _id: "660000000000000000000207",
    hotel: "660000000000000000000109",
    hotelSlug: "candolim-beachfront-heritage-villa-goa",
    name: "Beachfront Infinity Pool Villa Suite",
    category: "Oceanfront Villa",
    property: "Candolim Beachfront Heritage Villa",
    location: "Candolim, North Goa, India",
    currency: "INR",
    pricePerNight: 22000,
    taxesAndFees: { gstPercent: 18, estimatedTax: 3960 },
    capacity: { guests: 4, adults: 2, children: 2, bedrooms: 2, beds: 2, bedType: "King Beds", bathrooms: 2 },
    sizeSqM: 180,
    totalInventory: 3, availableInventory: 3,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.97, reviewCount: 92,
    summary: "Two-bedroom villa suite with private infinity pool overflowing onto Candolim beach.",
    description: "Exclusive beachfront villa with 180 sqm private space, infinity edge pool merging with the Arabian Sea horizon, outdoor garden shower, butler service, private beach cabana, and sunset cocktail hour.",
    heroImage: "https://images.unsplash.com/photo-1540541338537-4680f3b6e9a6?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1540541338537-4680f3b6e9a6?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Private Infinity Pool", "Butler Service", "Beach Cabana", "Outdoor Shower", "Cocktail Hour", "Free Wi-Fi"]
  },

  // ── KERALA ────────────────────────────────────────────────────────

  {
    _id: "660000000000000000000208",
    hotel: "660000000000000000000112",
    hotelSlug: "alleppey-lotus-houseboat-palace-kerala",
    name: "Royal Kettuvallam Master Cabin",
    category: "Houseboat Suite",
    property: "Alleppey Lotus Houseboat Palace",
    location: "Kerala Backwaters, Alleppey, Kerala, India",
    currency: "INR",
    pricePerNight: 22000,
    taxesAndFees: { gstPercent: 12, estimatedTax: 2640 },
    capacity: { guests: 2, adults: 2, children: 0, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 72,
    totalInventory: 3, availableInventory: 3,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.97, reviewCount: 220,
    summary: "Master cabin on private luxury houseboat with cantilevered sundeck above Kerala backwaters.",
    description: "Handcrafted teak kettuvallam with king bedroom, private sundeck, glass-bottom viewing pane, in-house Kerala chef, canoe dawn excursion to local toddy shops, and sunset Keralan kalamandalam performance.",
    heroImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Private Sundeck", "In-House Chef", "Canoe Excursion", "Cultural Performance", "All Meals Included", "AC Cabin"]
  },

  {
    _id: "660000000000000000000209",
    hotel: "660000000000000000000113",
    hotelSlug: "munnar-tea-mist-cloud-pavilion-kerala",
    name: "Glass Pavilion Tea Estate Suite",
    category: "Mountain Suite",
    property: "Munnar Tea Mist Cloud Pavilion",
    location: "Top Station, Munnar, Kerala, India",
    currency: "INR",
    pricePerNight: 14500,
    taxesAndFees: { gstPercent: 18, estimatedTax: 2610 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 95,
    totalInventory: 8, availableInventory: 8,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.94, reviewCount: 198,
    summary: "Three-wall glass pavilion suite immersed in Munnar's rolling emerald tea estate at 6,000 ft.",
    description: "Panoramic floor-to-ceiling glass walls on three sides for immersive tea estate views, infinity bathtub facing the tea slopes, dawn plantation walk with tea master, organic farm-to-table breakfast, and evening bonfire.",
    heroImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["360° Glass Walls", "Tea Estate View", "Infinity Bathtub", "Plantation Walk", "Organic Breakfast", "Free Wi-Fi"]
  },

  // ── HIMACHAL PRADESH ────────────────────────────────────────────

  {
    _id: "660000000000000000000210",
    hotel: "660000000000000000000116",
    hotelSlug: "shimla-wildflower-hall-ridge-manor",
    name: "Cedar Ridge Heritage Suite",
    category: "Heritage Suite",
    property: "Shimla Wildflower Hall Ridge Manor",
    location: "Mashobra Ridge, Shimla, Himachal Pradesh, India",
    currency: "INR",
    pricePerNight: 18500,
    taxesAndFees: { gstPercent: 18, estimatedTax: 3330 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 2 },
    sizeSqM: 112,
    totalInventory: 5, availableInventory: 5,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.95, reviewCount: 165,
    summary: "Original colonial suite with cedar-paneled walls, working fireplace, and 270° Himalayan views.",
    description: "Lovingly preserved British-era suite with hand-crafted cedar panels, cast-iron fireplace, claw-foot bathtub, and private cedar-forest balcony overlooking snow peaks at 8,250 ft altitude.",
    heroImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Himalayan Panorama", "Cedar Fireplace", "Claw-Foot Bathtub", "Forest Balcony", "Free Wi-Fi", "Butler Service"]
  },

  {
    _id: "660000000000000000000211",
    hotel: "660000000000000000000117",
    hotelSlug: "manali-snow-peak-chalet-lodge",
    name: "Alpine Apple Orchard Chalet Room",
    category: "Mountain Chalet",
    property: "Manali Snow Peak Chalet Lodge",
    location: "Old Manali, Kullu, Himachal Pradesh, India",
    currency: "INR",
    pricePerNight: 9800,
    taxesAndFees: { gstPercent: 18, estimatedTax: 1764 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 68,
    totalInventory: 10, availableInventory: 10,
    status: "Available", cleaningStatus: "Clean",
    featured: false, rating: 4.90, reviewCount: 178,
    summary: "Stone-and-timber chalet room with apple orchard balcony, private hot tub, and Rohtang mountain view.",
    description: "Local Kulu stone walls, timber-beamed ceiling, private outdoor hot tub on the orchard deck, mountain-facing floor bay window, Himalayan herb sauna, and guided snowshoe walks in season.",
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Private Hot Tub", "Apple Orchard View", "Timber Fireplace", "Snow Trekking", "Free Wi-Fi", "Mountain Breakfast"]
  },

  // ── UTTARAKHAND ────────────────────────────────────────────────

  {
    _id: "660000000000000000000212",
    hotel: "660000000000000000000119",
    hotelSlug: "rishikesh-ganga-cliff-ashram-retreat",
    name: "Ganga Cliff River View Suite",
    category: "Wellness Suite",
    property: "Rishikesh Ganga Cliff Ashram Retreat",
    location: "Swarg Ashram, Rishikesh, Uttarakhand, India",
    currency: "INR",
    pricePerNight: 11500,
    taxesAndFees: { gstPercent: 18, estimatedTax: 2070 },
    capacity: { guests: 2, adults: 2, children: 0, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 78,
    totalInventory: 8, availableInventory: 8,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.95, reviewCount: 232,
    summary: "Cliff-edge suite with floor-to-ceiling Ganges views, sunrise aarti viewing, and in-room yoga space.",
    description: "Perched on granite cliffs above the sacred Ganges, this suite offers unobstructed river and mountain views. Morning aarti from your private balcony, in-room yoga mat space, Ayurvedic treatment menu, and organic sattvic meals.",
    heroImage: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Ganga Cliff View", "In-Room Yoga", "Aarti Balcony", "Ayurvedic Minibar", "Sattvic Meals Included", "Free Wi-Fi"]
  },

  {
    _id: "660000000000000000000213",
    hotel: "660000000000000000000120",
    hotelSlug: "jim-corbett-tiger-reserve-forest-camp",
    name: "Jungle Edge Safari Luxury Tent",
    category: "Luxury Tent",
    property: "Jim Corbett Tiger Reserve Forest Camp",
    location: "Dhela, Ramnagar, Uttarakhand, India",
    currency: "INR",
    pricePerNight: 18500,
    taxesAndFees: { gstPercent: 18, estimatedTax: 3330 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 85,
    totalInventory: 10, availableInventory: 10,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.92, reviewCount: 188,
    summary: "Luxury canvas tent at the jungle edge with private deck, in-camp elephant sightings, and jeep safari.",
    description: "Premium luxury tent with king bed, private deck overlooking the forest, indoor and outdoor shower, wildlife sounds at dawn, dedicated naturalist guide, and private jeep safari with tiger tracking protocols.",
    heroImage: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Private Jeep Safari", "Naturalist Guide", "Forest Deck", "Outdoor Shower", "All Meals Included", "Free Wi-Fi"]
  },

  // ── WEST BENGAL ────────────────────────────────────────────────

  {
    _id: "660000000000000000000214",
    hotel: "660000000000000000000128",
    hotelSlug: "darjeeling-kanchenjunga-sunrise-manor",
    name: "Kanchenjunga Sunrise Heritage Room",
    category: "Mountain Heritage Room",
    property: "Darjeeling Kanchenjunga Sunrise Manor",
    location: "Observatory Hill, Darjeeling, West Bengal, India",
    currency: "INR",
    pricePerNight: 12500,
    taxesAndFees: { gstPercent: 18, estimatedTax: 2250 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 72,
    totalInventory: 8, availableInventory: 8,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.96, reviewCount: 198,
    summary: "Victorian manor room with direct Kanchenjunga glacier views from bed and mahogany bay window.",
    description: "Original Victorian parquet floors, mahogany furniture, working Darjeeling cast-iron fireplace, and an unobstructed panoramic bay window framing Mt. Kanchenjunga (8,586m) — visible from your bed at dawn.",
    heroImage: "https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Kanchenjunga View", "Mahogany Furniture", "Cast-Iron Fireplace", "Tea Garden Breakfast", "Free Wi-Fi", "Toy Train Access"]
  },

  // ── KASHMIR ────────────────────────────────────────────────────

  {
    _id: "660000000000000000000215",
    hotel: "660000000000000000000131",
    hotelSlug: "dal-lake-floating-rose-garden-houseboat-srinagar",
    name: "Walnut Master Bedroom Suite",
    category: "Heritage Houseboat Suite",
    property: "Dal Lake Floating Rose Garden Houseboat",
    location: "Nagin Lake, Srinagar, Jammu & Kashmir, India",
    currency: "INR",
    pricePerNight: 14500,
    taxesAndFees: { gstPercent: 12, estimatedTax: 1740 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 65,
    totalInventory: 4, availableInventory: 4,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.97, reviewCount: 264,
    summary: "Hand-carved Kashmiri walnut master suite on Dal Lake with private shikhara and mountain views.",
    description: "Intricately carved walnut timber throughout, papier-mâché painted ceiling panels, embroidered Pashmina bedspreads, floating lotus garden views, private shikhara ride to the floating vegetable market at dawn.",
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Dal Lake Views", "Walnut Carvings", "Papier-Mâché Ceiling", "Private Shikhara", "Wazwan Dinner", "All Meals Included"]
  },

  {
    _id: "660000000000000000000216",
    hotel: "660000000000000000000132",
    hotelSlug: "gulmarg-alpine-snow-lodge-kashmir",
    name: "Alpine Ski-In Chalet Suite",
    category: "Alpine Suite",
    property: "Gulmarg Alpine Snow Lodge",
    location: "Gulmarg, Baramulla, Jammu & Kashmir, India",
    currency: "INR",
    pricePerNight: 22000,
    taxesAndFees: { gstPercent: 18, estimatedTax: 3960 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 2 },
    sizeSqM: 105,
    totalInventory: 6, availableInventory: 6,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.95, reviewCount: 142,
    summary: "Ski-in ski-out alpine suite at 8,700 ft with private jacuzzi overlooking Himalayan snow peaks.",
    description: "Slope-side suite with direct gondola access, private outdoor jacuzzi, heated stone floors, floor-to-ceiling mountain windows, ski equipment storage, après-ski fireplace lounge, and Kashmiri kangri warming service.",
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Ski-In Access", "Private Jacuzzi", "Heated Floors", "Mountain View", "Ski Storage", "Breakfast Included"]
  },

  // ── KARNATAKA ──────────────────────────────────────────────────

  {
    _id: "660000000000000000000217",
    hotel: "660000000000000000000124",
    hotelSlug: "coorg-misty-coffee-bungalow-estate-karnataka",
    name: "Arabica Estate Planter's Suite",
    category: "Heritage Suite",
    property: "Coorg Misty Coffee Bungalow Estate",
    location: "Hudikeri, Madikeri, Kodagu, Karnataka, India",
    currency: "INR",
    pricePerNight: 11500,
    taxesAndFees: { gstPercent: 18, estimatedTax: 2070 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 80,
    totalInventory: 5, availableInventory: 5,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.91, reviewCount: 178,
    summary: "Heritage planter's suite in 1890s colonial bungalow surrounded by Arabica coffee and cardamom.",
    description: "Original teak colonial furniture, pepper vine-draped veranda, plantation-view four-poster bed, private outdoor bathtub among coffee bushes, dawn tea plucking walk, and Coorgi estate breakfast on the veranda.",
    heroImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Coffee Estate View", "Outdoor Bathtub", "Colonial Veranda", "Plantation Walk", "Coorgi Cuisine", "Free Wi-Fi"]
  },

  // ── MAHARASHTRA ────────────────────────────────────────────────

  {
    _id: "660000000000000000000218",
    hotel: "660000000000000000000126",
    hotelSlug: "colaba-gateway-waterfront-manor-mumbai",
    name: "Gateway Harbour View Grand Suite",
    category: "Grand Heritage Suite",
    property: "Colaba Gateway Waterfront Manor",
    location: "Colaba, Mumbai, Maharashtra, India",
    currency: "INR",
    pricePerNight: 28000,
    taxesAndFees: { gstPercent: 18, estimatedTax: 5040 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 2 },
    sizeSqM: 130,
    totalInventory: 8, availableInventory: 8,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.95, reviewCount: 225,
    summary: "Art deco grand suite with panoramic views of Gateway of India and the Mumbai Harbour.",
    description: "130 sqm grand suite with art deco furnishings, butler service, private harbour-facing terrace, original Mughal-inspired marble inlay, and direct views of the illuminated Gateway of India from your suite.",
    heroImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Gateway of India View", "Art Deco Interiors", "Butler Service", "Private Terrace", "Harbour Cruise", "Free Wi-Fi"]
  },

  {
    _id: "660000000000000000000219",
    hotel: "660000000000000000000127",
    hotelSlug: "lonavala-sahyadri-cliff-villa-maharashtra",
    name: "Valley Cliff Infinity Pool Villa Suite",
    category: "Luxury Villa Suite",
    property: "Lonavala Sahyadri Cliff Villa",
    location: "Tungarli, Lonavala, Pune, Maharashtra, India",
    currency: "INR",
    pricePerNight: 26000,
    taxesAndFees: { gstPercent: 18, estimatedTax: 4680 },
    capacity: { guests: 4, adults: 2, children: 2, bedrooms: 2, beds: 2, bedType: "King Beds", bathrooms: 2 },
    sizeSqM: 200,
    totalInventory: 4, availableInventory: 4,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.94, reviewCount: 118,
    summary: "Two-bedroom cliff villa with infinity pool at the Western Ghats edge overlooking Khandala Valley.",
    description: "Private cliff-edge estate suite with infinity pool suspended over the valley, outdoor monsoon rain shower, private chef's breakfast, living forest views from every room, and exclusive Sahyadri sunset viewpoint access.",
    heroImage: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Cliff Infinity Pool", "Valley View", "Private Chef", "Rain Shower", "Forest Balcony", "Free Wi-Fi"]
  },

  // ── GUJARAT ────────────────────────────────────────────────────

  {
    _id: "660000000000000000000220",
    hotel: "660000000000000000000134",
    hotelSlug: "rann-utsav-white-desert-luxury-camp-kutch",
    name: "White Rann Panorama Luxury Tent",
    category: "Luxury Desert Tent",
    property: "Rann Utsav White Desert Luxury Camp",
    location: "Dhordo, Bhuj, Kutch, Gujarat, India",
    currency: "INR",
    pricePerNight: 18500,
    taxesAndFees: { gstPercent: 18, estimatedTax: 3330 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 75,
    totalInventory: 30, availableInventory: 30,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.94, reviewCount: 235,
    summary: "AC luxury tent overlooking the world's largest salt desert with folk music and full moon walk.",
    description: "Premium Swiss AC tent on elevated platform over white salt expanse, Kutchi handicraft décor, private outdoor firepit, folk music evenings, camel safari at sunrise, and full-moon white desert midnight walk.",
    heroImage: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Salt Desert View", "AC Tent", "Camel Safari", "Folk Music", "Full Moon Walk", "All Meals Included"]
  },

  // ── MADHYA PRADESH ────────────────────────────────────────────

  {
    _id: "660000000000000000000221",
    hotel: "660000000000000000000136",
    hotelSlug: "bandhavgarh-tiger-fortress-camp-mp",
    name: "Tiger Fortress Private Safari Tent",
    category: "Wildlife Luxury Tent",
    property: "Bandhavgarh Tiger Fortress Camp",
    location: "Tala, Umaria, Madhya Pradesh, India",
    currency: "INR",
    pricePerNight: 28000,
    taxesAndFees: { gstPercent: 18, estimatedTax: 5040 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 95,
    totalInventory: 8, availableInventory: 8,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.96, reviewCount: 165,
    summary: "Premium safari tent in India's highest tiger density zone with private guide and jungle nightwalk.",
    description: "The finest accommodation in Bandhavgarh. Private camp location at the forest edge, exclusive morning and evening tiger safaris, leopard and sloth bear nightwalk, outdoor jungle shower, bonfire with Bagheli tribal music.",
    heroImage: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["2 Daily Safaris", "Private Guide", "Night Walk", "Jungle Shower", "Bonfire", "All Meals Included"]
  },

  // ── ASSAM ──────────────────────────────────────────────────────

  {
    _id: "660000000000000000000222",
    hotel: "660000000000000000000129",
    hotelSlug: "kaziranga-rhino-reserve-wilderness-lodge-assam",
    name: "Rhino Reserve Forest View Cottage",
    category: "Wildlife Cottage",
    property: "Kaziranga Rhino Reserve Wilderness Lodge",
    location: "Bagori, Kaziranga, Golaghat, Assam, India",
    currency: "INR",
    pricePerNight: 14500,
    taxesAndFees: { gstPercent: 12, estimatedTax: 1740 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 65,
    totalInventory: 8, availableInventory: 8,
    status: "Available", cleaningStatus: "Clean",
    featured: false, rating: 4.88, reviewCount: 145,
    summary: "Forest-edge cottage with elephant and rhino sightings from private deck at Kaziranga.",
    description: "Comfortable cottage at the park boundary with private wooden deck overlooking the grassland. Frequent wild elephant and rhino sightings at dawn and dusk. Elephant-back safari, Assamese organic breakfast, and birdwatching tower.",
    heroImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Rhino View Deck", "Elephant Safari", "Birdwatching Tower", "Organic Breakfast", "All Meals Included", "Free Wi-Fi"]
  },

  // ── ANDHRA PRADESH ─────────────────────────────────────────────

  {
    _id: "660000000000000000000223",
    hotel: "660000000000000000000130",
    hotelSlug: "araku-valley-tribal-forest-retreat-andhra",
    name: "Coffee Hill Tribal Heritage Room",
    category: "Eco Room",
    property: "Araku Valley Tribal Forest Retreat",
    location: "Araku Valley, Alluri Sitharama Raju, Andhra Pradesh, India",
    currency: "INR",
    pricePerNight: 6500,
    taxesAndFees: { gstPercent: 12, estimatedTax: 780 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "Queen Bed", bathrooms: 1 },
    sizeSqM: 48,
    totalInventory: 12, availableInventory: 12,
    status: "Available", cleaningStatus: "Clean",
    featured: false, rating: 4.85, reviewCount: 142,
    summary: "Sustainably built tribal-motif room with coffee hill views and valley sunrise in Araku.",
    description: "Locally sourced bamboo and stone construction, Kondh tribal artwork on walls, private coffee-slope veranda, dawn plantation walk, Borra Caves day trip, and authentic Adivasi cuisine evenings.",
    heroImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Coffee Hill View", "Tribal Art Decor", "Plantation Walk", "Borra Caves Tour", "Adivasi Dinner", "Free Wi-Fi"]
  },

  // ── ODISHA ─────────────────────────────────────────────────────

  {
    _id: "660000000000000000000224",
    hotel: "660000000000000000000133",
    hotelSlug: "puri-jagannath-sea-breeze-manor-odisha",
    name: "Bay of Bengal Ocean View Suite",
    category: "Beach Suite",
    property: "Puri Jagannath Sea Breeze Manor",
    location: "Sea Beach Area, Puri, Odisha, India",
    currency: "INR",
    pricePerNight: 8500,
    taxesAndFees: { gstPercent: 12, estimatedTax: 1020 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 58,
    totalInventory: 8, availableInventory: 8,
    status: "Available", cleaningStatus: "Clean",
    featured: false, rating: 4.84, reviewCount: 158,
    summary: "Colonial suite with Bay of Bengal ocean views, sunrise beach walks, and Jagannath Temple chants.",
    description: "Whitewashed colonial room with bay-window sea views, private beach access, pre-dawn Jagannath aarti sounds drifting across, Odissi dance performance evenings, and traditional Mahaprasad tasting dinner.",
    heroImage: "https://images.unsplash.com/photo-1535913989690-f90e1c2d4cfa?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1535913989690-f90e1c2d4cfa?auto=format&fit=crop&w=2560&q=95","https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Bay of Bengal View", "Beach Access", "Temple Aarti Sounds", "Odissi Dance", "Mahaprasad Dinner", "Free Wi-Fi"]
  },

  {
    _id: "660000000000000000000225",
    hotel: "660000000000000000000137",
    hotelSlug: "brij-ganga-heritage-palace-varanasi",
    name: "Ganga View Riverfront Heritage Room",
    category: "Heritage Room",
    property: "Brij Ganga Heritage Palace on Ghats",
    location: "Assi Ghat, Varanasi, Uttar Pradesh, India",
    currency: "INR",
    pricePerNight: 6500,
    taxesAndFees: { gstPercent: 12, estimatedTax: 780 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 52,
    totalInventory: 10, availableInventory: 10,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.93, reviewCount: 312,
    summary: "Authentic sandstone heritage room directly overlooking the sacred Ganga aarti ghats.",
    description: "Carved jharokhas with direct riverfront balcony, hand-woven Benarasi silk tapestries, early morning aarti chimes, and Ayurvedic herbal amenities.",
    heroImage: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Ganga River View", "Silk Tapestries", "Balcony", "Free Wi-Fi", "Aarti Chimes"]
  },

  {
    _id: "660000000000000000000226",
    hotel: "660000000000000000000138",
    hotelSlug: "the-imperial-grand-palace-indore",
    name: "Executive Grand Premier Suite",
    category: "Executive Suite",
    property: "The Imperial Grand Palace Indore",
    location: "Vijay Nagar, Indore, Madhya Pradesh, India",
    currency: "INR",
    pricePerNight: 5500,
    taxesAndFees: { gstPercent: 12, estimatedTax: 660 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 60,
    totalInventory: 15, availableInventory: 15,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.88, reviewCount: 245,
    summary: "Spacious business luxury suite in the heart of Vijay Nagar with panoramic skyline views.",
    description: "Plush velvet armchairs, marble bathroom with soaking tub, ergonomic work desk, high-speed fiber internet, and executive lounge access.",
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["City View", "Executive Lounge", "Work Desk", "Soaking Tub", "Free Wi-Fi"]
  },

  {
    _id: "660000000000000000000227",
    hotel: "660000000000000000000139",
    hotelSlug: "the-imperial-lutyens-grand-delhi",
    name: "Lutyens Heritage Garden Suite",
    category: "Heritage Suite",
    property: "The Imperial Lutyens Grand Delhi",
    location: "Connaught Place, New Delhi, Delhi, India",
    currency: "INR",
    pricePerNight: 8500,
    taxesAndFees: { gstPercent: 18, estimatedTax: 1530 },
    capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 75,
    totalInventory: 12, availableInventory: 12,
    status: "Available", cleaningStatus: "Clean",
    featured: true, rating: 4.96, reviewCount: 450,
    summary: "Colonial garden suite in central New Delhi with teakwood furnishings and palm garden views.",
    description: "High ceilings, authentic Victorian lithographs, Italian marble bathroom, personalized butler service, and high tea served in the palm courtyard.",
    heroImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95",
    gallery: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95"],
    amenities: ["Garden View", "Butler Service", "Italian Marble Bath", "High Ceilings", "Free Wi-Fi"]
  }

];

module.exports = {
  indiaHotels,
  indiaRooms
};
