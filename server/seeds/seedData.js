const seedUsers = [
  {
    _id: "664fa1e2b8109a1b1c000001",
    name: "Eleanor Vance",
    email: "guest@atithigo.com",
    password: "guest123", // Will be hashed in seeder / controller
    role: "guest",
    phone: "+1 (555) 234-8901",
    membership: "Gold Atelier",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  },
  {
    _id: "664fa1e2b8109a1b1c000002",
    name: "Julian Mercier",
    email: "staff@atithigo.com",
    password: "staff123",
    role: "staff",
    phone: "+1 (555) 345-6789",
    department: "Guest Relations & Operations",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
  },
  {
    _id: "664fa1e2b8109a1b1c000003",
    name: "Claire Sterling",
    email: "admin@atithigo.com",
    password: "admin123",
    role: "admin",
    phone: "+1 (555) 987-6543",
    department: "Executive General Management",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
  },
  {
    _id: "664fa1e2b8109a1b1c000004",
    name: "Admin User",
    email: "admin@hotelpro.com",
    password: "admin123",
    role: "admin",
    phone: "+1 (555) 987-6544",
    department: "Executive Management",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
  },
  {
    _id: "664fa1e2b8109a1b1c000005",
    name: "Staff Member",
    email: "staff@hotelpro.com",
    password: "staff123",
    role: "staff",
    phone: "+1 (555) 345-6780",
    department: "Front Desk & Operations",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
  },
  {
    _id: "664fa1e2b8109a1b1c000006",
    name: "Patron Guest",
    email: "guest@hotelpro.com",
    password: "guest123",
    role: "customer",
    phone: "+1 (555) 234-8902",
    membership: "Royal Atelier",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  }
];

const seedHotels = [
  {
    _id: "664fa100b8109a1b1c000001",
    name: "AtithiGo Estate & Botanical Sanctuary",
    slug: "atithigo-estate-botanical-sanctuary",
    description: "Nestled within private heritage walled gardens in the Cotswolds, an understated luxury sanctuary crafted with hand-plastered lime walls and limestone courtyards.",
    summary: "Secluded Cotswolds botanical retreat with private courtyards and culinary garden pavilions.",
    propertyCategory: "Boutique Resort",
    address: {
      addressLine: "Upper Slaughter Lane",
      locality: "Cotswolds",
      city: "Cotswolds",
      district: "Gloucestershire",
      state: "England",
      stateCode: "GL",
      postalCode: "GL54 1AA",
      country: "United Kingdom"
    },
    location: { type: "Point", coordinates: [-1.7782, 51.9056] },
    heroImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95",
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2560&q=95"
    ],
    facilities: ["Herb Garden", "Plunge Pool", "Artisan Dining", "Valet Parking", "High-Speed Wi-Fi"],
    amenities: ["Free Wi-Fi", "Swimming Pool", "Restaurant", "Fireplace", "Garden View"],
    starClassification: 5,
    isStarVerified: true,
    rating: 4.96,
    reviewCount: 48,
    reviews: [],
    policies: {
      checkInTime: "15:00",
      checkOutTime: "11:00",
      cancellationPolicy: "Free cancellation up to 48 hours prior to arrival.",
      petFriendly: true,
      childPolicy: "Children welcome with dedicated garden cottages.",
      smokingPolicy: "100% Non-smoking property."
    },
    contact: {
      phone: "+44 1608 650000",
      email: "cotswolds@hotelpro.com",
      website: "https://hotelpro.com/cotswolds"
    },
    priceRange: { min: 420, max: 950 },
    startingPrice: 420,
    currency: "GBP",
    status: "published",
    featured: true,
    isDemo: true,
    source: "AtithiGo_Curated_Demo"
  },
  {
    _id: "664fa100b8109a1b1c000002",
    name: "AtithiGo Metropolitan Atelier",
    slug: "atithigo-metropolitan-atelier",
    description: "An exercise in restrained Italian modernism located in Milan's historic fashion district, featuring travertine terraces, private cocktail lounge, and butler pantry.",
    summary: "Refined Milanese rooftop residences with travertine terraces and private elevator access.",
    propertyCategory: "Business Atelier",
    address: {
      addressLine: "Via Monte Napoleone 12",
      locality: "Brera / Quadrilatero",
      city: "Milan",
      district: "Lombardy",
      state: "Lombardy",
      stateCode: "MI",
      postalCode: "20121",
      country: "Italy"
    },
    location: { type: "Point", coordinates: [9.1942, 45.4697] },
    heroImage: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=2560&q=95",
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=2560&q=95"
    ],
    facilities: ["Travertine Terrace", "Wine Vault", "Butler Service", "Acoustic Lounge", "Secured Elevator"],
    amenities: ["Free Wi-Fi", "Air Conditioning", "Terrace", "Concierge", "Fine Dining"],
    starClassification: 5,
    isStarVerified: true,
    rating: 4.98,
    reviewCount: 36,
    reviews: [],
    policies: {
      checkInTime: "15:00",
      checkOutTime: "12:00",
      cancellationPolicy: "Free cancellation up to 72 hours prior to arrival.",
      petFriendly: false,
      childPolicy: "Adults preferred; children above 12 years welcome.",
      smokingPolicy: "100% Non-smoking suites."
    },
    contact: {
      phone: "+39 02 8765 4321",
      email: "milan@hotelpro.com",
      website: "https://hotelpro.com/milan"
    },
    priceRange: { min: 780, max: 1800 },
    startingPrice: 780,
    currency: "EUR",
    status: "published",
    featured: true,
    isDemo: true,
    source: "AtithiGo_Curated_Demo"
  },
  {
    _id: "664fa100b8109a1b1c000003",
    name: "AtithiGo Coastal Reserve",
    slug: "atithigo-coastal-reserve",
    description: "Minimalist timber sanctuary set amidst wild maritime pine and white dunes on Portugal's Atlantic coast.",
    summary: "Atlantic beachfront eco-villas with private boardwalk paths and saltwater infinity pools.",
    propertyCategory: "Beach Sanctuary",
    address: {
      addressLine: "Estrada da Praia do Pego",
      locality: "Comporta",
      city: "Comporta",
      district: "Alentejo",
      state: "Alentejo",
      stateCode: "AL",
      postalCode: "7580-610",
      country: "Portugal"
    },
    location: { type: "Point", coordinates: [-8.7844, 38.3792] },
    heroImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2560&q=95",
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2560&q=95"
    ],
    facilities: ["Saltwater Pool", "Beach Boardwalk", "Yoga Deck", "Organic Cafe", "E-Bikes"],
    amenities: ["Beach Access", "Infinity Pool", "Free Wi-Fi", "Breakfast Included", "Yoga Deck"],
    starClassification: 5,
    isStarVerified: true,
    rating: 4.94,
    reviewCount: 52,
    reviews: [],
    policies: {
      checkInTime: "15:00",
      checkOutTime: "11:00",
      cancellationPolicy: "Free cancellation up to 7 days prior to arrival.",
      petFriendly: true,
      childPolicy: "Children welcome.",
      smokingPolicy: "100% Non-smoking property."
    },
    contact: {
      phone: "+351 265 987 654",
      email: "comporta@hotelpro.com",
      website: "https://hotelpro.com/comporta"
    },
    priceRange: { min: 620, max: 1400 },
    startingPrice: 620,
    currency: "EUR",
    status: "published",
    featured: true,
    isDemo: true,
    source: "AtithiGo_Curated_Demo"
  },
  {
    _id: "664fa100b8109a1b1c000004",
    name: "AtithiGo Highland Refuge",
    slug: "atithigo-highland-refuge",
    description: "Contemporary larch-timber chalet perched high above the Engadin valley with Swedish sauna and panoramic mountain glazing.",
    summary: "Alpine chalet sanctuary in St. Moritz with balcony cedar saunas and ski valet.",
    propertyCategory: "Hill Station Lodge",
    address: {
      addressLine: "Via Serlas 25",
      locality: "Dorf",
      city: "St. Moritz",
      district: "Grisons",
      state: "Grisons",
      stateCode: "GR",
      postalCode: "7500",
      country: "Switzerland"
    },
    location: { type: "Point", coordinates: [9.8355, 46.4908] },
    heroImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2560&q=95",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=2560&q=95"
    ],
    facilities: ["Balcony Sauna", "Granite Hearth", "Ski Valet", "Thermal Spa", "Tea Bar"],
    amenities: ["Mountain View", "Fireplace", "Sauna", "Free Wi-Fi", "Ski-in/Ski-out"],
    starClassification: 5,
    isStarVerified: true,
    rating: 4.97,
    reviewCount: 29,
    reviews: [],
    policies: {
      checkInTime: "15:00",
      checkOutTime: "11:00",
      cancellationPolicy: "Free cancellation up to 14 days prior to arrival.",
      petFriendly: false,
      childPolicy: "Children above 8 years welcome.",
      smokingPolicy: "100% Non-smoking property."
    },
    contact: {
      phone: "+41 81 830 0000",
      email: "stmoritz@hotelpro.com",
      website: "https://hotelpro.com/stmoritz"
    },
    priceRange: { min: 540, max: 1250 },
    startingPrice: 540,
    currency: "CHF",
    status: "published",
    featured: false,
    isDemo: true,
    source: "AtithiGo_Curated_Demo"
  },
  {
    _id: "664fa100b8109a1b1c000005",
    name: "AtithiGo Masseria & Spa",
    slug: "atithigo-masseria-spa",
    description: "Restored 18th-century vaulted stone masseria set among ancient olive groves in Puglia, offering farm-to-table dining and botanical spa.",
    summary: "Timeless Puglian stone masseria amidst ancient olive groves with shaded pergolas.",
    propertyCategory: "Wellness Retreat",
    address: {
      addressLine: "Contrada Montenapoleone",
      locality: "Fasano",
      city: "Puglia",
      district: "Brindisi",
      state: "Apulia",
      stateCode: "PU",
      postalCode: "72015",
      country: "Italy"
    },
    location: { type: "Point", coordinates: [17.3622, 40.8656] },
    heroImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2560&q=95",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2560&q=95"
    ],
    facilities: ["Olive Grove Pergola", "Stone Spa", "Saltwater Pool", "Artisanal Kitchen", "Bicycles"],
    amenities: ["Free Wi-Fi", "Swimming Pool", "Spa", "Terracotta Patio", "Complimentary Breakfast"],
    starClassification: 5,
    isStarVerified: true,
    rating: 4.91,
    reviewCount: 41,
    reviews: [],
    policies: {
      checkInTime: "15:00",
      checkOutTime: "11:00",
      cancellationPolicy: "Free cancellation up to 5 days prior to arrival.",
      petFriendly: true,
      childPolicy: "Children welcome.",
      smokingPolicy: "100% Non-smoking suites."
    },
    contact: {
      phone: "+39 080 482 1100",
      email: "puglia@hotelpro.com",
      website: "https://hotelpro.com/puglia"
    },
    priceRange: { min: 350, max: 890 },
    startingPrice: 350,
    currency: "EUR",
    status: "published",
    featured: false,
    isDemo: true,
    source: "AtithiGo_Curated_Demo"
  },
  {
    _id: "664fa100b8109a1b1c000006",
    name: "AtithiGo Ryokan Sanctuary",
    slug: "atithigo-ryokan-sanctuary",
    description: "A tranquil convergence of traditional Japanese cedar craftsmanship, shoji screens, tatami parlors, and aromatic hinoki cypress baths in Gion, Kyoto.",
    summary: "Historic Kyoto ryokan sanctuary with private moss gardens and cedar hinoki baths.",
    propertyCategory: "Wellness Retreat",
    address: {
      addressLine: "570-120 Gionmachi Minamigawa",
      locality: "Higashiyama Ward",
      city: "Kyoto",
      district: "Kyoto",
      state: "Kyoto Prefecture",
      stateCode: "KT",
      postalCode: "605-0073",
      country: "Japan"
    },
    location: { type: "Point", coordinates: [135.7765, 35.0037] },
    heroImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2560&q=95",
    images: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=2560&q=95"
    ],
    facilities: ["Hinoki Bath", "Moss Garden", "Tea Station", "Kaiseki Dining", "Yukata Service"],
    amenities: ["Hinoki Cypress Bath", "Japanese Moss Garden", "Free Wi-Fi", "Kaiseki Dining", "Yukata Provided"],
    starClassification: 5,
    isStarVerified: true,
    rating: 4.99,
    reviewCount: 64,
    reviews: [],
    policies: {
      checkInTime: "15:00",
      checkOutTime: "11:00",
      cancellationPolicy: "Free cancellation up to 7 days prior to arrival.",
      petFriendly: false,
      childPolicy: "Children above 10 years welcome.",
      smokingPolicy: "100% Non-smoking ryokan."
    },
    contact: {
      phone: "+81 75 531 8800",
      email: "kyoto@hotelpro.com",
      website: "https://hotelpro.com/kyoto"
    },
    priceRange: { min: 690, max: 1550 },
    startingPrice: 690,
    currency: "JPY",
    status: "published",
    featured: true,
    isDemo: true,
    source: "AtithiGo_Curated_Demo"
  }
];

const seedRooms = [
  {
    _id: "664fa2a3b8109a1b1c000010",
    hotel: "664fa100b8109a1b1c000001",
    hotelSlug: "atithigo-estate-botanical-sanctuary",
    name: "The Pavilion Garden Suite",
    category: "Garden Suite",
    property: "AtithiGo Estate & Botanical Sanctuary",
    location: "Cotswolds, United Kingdom",
    currency: "GBP",
    pricePerNight: 420,
    taxesAndFees: { gstPercent: 20, estimatedTax: 84 },
    capacity: { guests: 2, adults: 2, children: 0, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 68,
    totalInventory: 3,
    availableInventory: 3,
    status: "Available",
    cleaningStatus: "Clean",
    featured: true,
    rating: 4.96,
    reviewCount: 48,
    summary: "Secluded stone pavilion with hand-plastered lime walls, a private courtyard plunge pool, and floor-to-ceiling glass framing fragrant herb gardens.",
    description: "Nestled within our heritage walled garden, The Pavilion Garden Suite offers quiet architectural harmony. Handcrafted oak cabinetry, custom linen drapery, and limestone flooring throughout create an atmosphere of refined stillness. Features a private glass conservatory reading nook, marble rain shower with artisanal botanical soaps, and an outdoor stone fire bowl for cool evenings.",
    heroImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95",
    gallery: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=2560&q=95"
    ],
    amenities: [
      "Private Courtyard & Plunge Pool",
      "Wood-Burning Fireplace",
      "Bespoke Minibar & Pour-Over Bar",
      "Dyptique Paris Bath Amenities",
      "High-Fidelity Vinyl Sound System",
      "King Hypnos Cashmere Mattress",
      "Complimentary Valet & EV Charging",
      "High-Speed Fiber Wi-Fi"
    ]
  },
  {
    _id: "664fa2a3b8109a1b1c000011",
    hotel: "664fa100b8109a1b1c000002",
    hotelSlug: "atithigo-metropolitan-atelier",
    name: "The Belvedere Penthouse",
    category: "Penthouse",
    property: "AtithiGo Metropolitan Atelier",
    location: "Milan, Italy",
    currency: "EUR",
    pricePerNight: 780,
    taxesAndFees: { gstPercent: 10, estimatedTax: 78 },
    capacity: { guests: 4, adults: 2, children: 2, bedrooms: 2, beds: 2, bedType: "King Bed", bathrooms: 2 },
    sizeSqM: 145,
    totalInventory: 2,
    availableInventory: 2,
    status: "Available",
    cleaningStatus: "Clean",
    featured: true,
    rating: 4.98,
    reviewCount: 36,
    summary: "Commanding rooftop residence overlooking historic spires with wrapped travertine terrace, private cocktail lounge, and butler pantry.",
    description: "Occupying the top level of the palazzo, The Belvedere Penthouse is an exercise in restrained Italian modernism. Polished walnut parquet, fluted glass partitions, and sculptural bronze lighting by local artisans complement expansive panoramic city views. Guests enjoy dedicated concierge liaison, twice-daily housekeeping, and private elevator entry.",
    heroImage: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=2560&q=95",
    gallery: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2560&q=95"
    ],
    amenities: [
      "360-Degree Travertine Terrace",
      "Private Butler Service",
      "In-Suite Wine Vault",
      "Freestanding Hand-Carved Tub",
      "Bang & Olufsen Acoustic System",
      "Super King Goose-Down Bedding",
      "24-Hour In-Room Fine Dining",
      "Secured Private Elevator"
    ]
  },
  {
    _id: "664fa2a3b8109a1b1c000012",
    hotel: "664fa100b8109a1b1c000003",
    hotelSlug: "atithigo-coastal-reserve",
    name: "The Coastal Dune Villa",
    category: "Oceanfront Villa",
    property: "AtithiGo Coastal Reserve",
    location: "Comporta, Portugal",
    currency: "EUR",
    pricePerNight: 620,
    taxesAndFees: { gstPercent: 10, estimatedTax: 62 },
    capacity: { guests: 3, adults: 2, children: 1, bedrooms: 1, beds: 2, bedType: "King Bed", bathrooms: 2 },
    sizeSqM: 92,
    totalInventory: 3,
    availableInventory: 3,
    status: "Available",
    cleaningStatus: "Inspecting",
    featured: true,
    rating: 4.94,
    reviewCount: 52,
    summary: "Minimalist timber sanctuary set amidst wild maritime pine and white dunes, moments from the Atlantic shoreline.",
    description: "Designed to blur indoor living with the Atlantic landscape, this villa features weathered cedar timber, woven rush mats, and linen textures in sand and terracotta tones. Step off your deck onto a private boardwalk path winding directly to the ocean.",
    heroImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2560&q=95",
    gallery: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2560&q=95"
    ],
    amenities: [
      "Direct Private Dune Beach Access",
      "Solar-Heated Saltwater Infinity Pool",
      "Outdoor Open-Air Shower",
      "Organic Breakfast Hamper Daily",
      "Handcrafted Surfboards & E-Bikes",
      "Le Labo Santal 26 Amenities",
      "Yoga Deck & Meditation Props",
      "Starlink Satellite Internet"
    ]
  },
  {
    _id: "664fa2a3b8109a1b1c000013",
    hotel: "664fa100b8109a1b1c000004",
    hotelSlug: "atithigo-highland-refuge",
    name: "The Alpine Forest Lodge",
    category: "Chalet Suite",
    property: "AtithiGo Highland Refuge",
    location: "St. Moritz, Switzerland",
    currency: "CHF",
    pricePerNight: 540,
    taxesAndFees: { gstPercent: 8, estimatedTax: 43.2 },
    capacity: { guests: 2, adults: 2, children: 0, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 74,
    totalInventory: 4,
    availableInventory: 4,
    status: "Available",
    cleaningStatus: "Clean",
    featured: false,
    rating: 4.97,
    reviewCount: 29,
    summary: "Contemporary larch-timber chalet suite perched high above the valley with Swedish sauna and panoramic mountain glazing.",
    description: "An understated interpretation of alpine sanctuary. Crafted from locally harvested Swiss pine and blackened steel, the lodge centers around an authentic soapstone hearth. Private cedar barrel sauna on the balcony offers silent views of snow-draped peaks.",
    heroImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2560&q=95",
    gallery: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2560&q=95"
    ],
    amenities: [
      "Private Balcony Sauna",
      "Raw Granite Hearth & Log Store",
      "Heated Travertine Flooring",
      "Ski Valet & Drying Room Locker",
      "Cashmere Throws by Loro Piana",
      "Thermal Spa Pass Included",
      "Artisan Herbal Tea Bar"
    ]
  },
  {
    _id: "664fa2a3b8109a1b1c000014",
    hotel: "664fa100b8109a1b1c000005",
    hotelSlug: "atithigo-masseria-spa",
    name: "The Olive Grove Studio",
    category: "Boutique Studio",
    property: "AtithiGo Masseria & Spa",
    location: "Puglia, Italy",
    currency: "EUR",
    pricePerNight: 350,
    taxesAndFees: { gstPercent: 10, estimatedTax: 35 },
    capacity: { guests: 2, adults: 2, children: 0, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 52,
    totalInventory: 4,
    availableInventory: 4,
    status: "Available",
    cleaningStatus: "Clean",
    featured: false,
    rating: 4.91,
    reviewCount: 41,
    summary: "Restored 18th-century vaulted stone chamber with whitewashed arches, terracotta floors, and shaded fig-tree pergola.",
    description: "Experience the timeless calm of Southern Italy. Thick tuff stone walls keep the suite naturally cool during midday sun. Wake to birdsong across ancient olive groves and enjoy a shaded breakfast under your vine-canopied private patio.",
    heroImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2560&q=95",
    gallery: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2560&q=95"
    ],
    amenities: [
      "Vaulted Stone Ceiling Architecture",
      "Shaded Garden Pergola",
      "Handmade Terracotta Tiles",
      "Locally Pressed Olive Oil Amenities",
      "Artisanal Ceramic Tableware",
      "Bicycle Cruisers Included"
    ]
  },
  {
    _id: "664fa2a3b8109a1b1c000015",
    hotel: "664fa100b8109a1b1c000006",
    hotelSlug: "atithigo-ryokan-sanctuary",
    name: "The Kyoto Zen Pavilion",
    category: "Zen Courtyard Suite",
    property: "AtithiGo Ryokan Sanctuary",
    location: "Kyoto, Japan",
    currency: "JPY",
    pricePerNight: 690,
    taxesAndFees: { gstPercent: 10, estimatedTax: 69 },
    capacity: { guests: 3, adults: 2, children: 1, bedrooms: 1, beds: 2, bedType: "King Bed", bathrooms: 1 },
    sizeSqM: 86,
    totalInventory: 3,
    availableInventory: 3,
    status: "Available",
    cleaningStatus: "Clean",
    featured: true,
    rating: 4.99,
    reviewCount: 64,
    summary: "Authentic cedar craftsmanship, tatami mat parlor, private hinoki cypress soaking bath, and moss garden reflection pool.",
    description: "A tranquil convergence of traditional Japanese craftsmanship and contemporary understated luxury. Sliding shoji screens reveal a private raked pebble garden and deep aromatic hinoki tub. Kaiseki evening dining served in-room upon request.",
    heroImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2560&q=95",
    gallery: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=2560&q=95",
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=2560&q=95"
    ],
    amenities: [
      "Handcrafted Hinoki Wood Bath",
      "Private Japanese Moss Garden",
      "Traditional Yukata Robes & Geta",
      "Matcha Tea Ceremony Station",
      "Shoji Screen Partitions",
      "In-Room Kaiseki Dining Option"
    ]
  }
];

const seedBookings = [
  {
    _id: "664fa3f1b8109a1b1c000020",
    room: "664fa2a3b8109a1b1c000010",
    user: "664fa1e2b8109a1b1c000001",
    guestName: "Eleanor Vance",
    guestEmail: "guest@atithigo.com",
    guestPhone: "+1 (555) 234-8901",
    roomName: "The Pavilion Garden Suite",
    checkIn: "2026-11-12",
    checkOut: "2026-11-16",
    nights: 4,
    guests: { adults: 2, children: 0 },
    totalPrice: 1680,
    status: "Confirmed",
    paymentStatus: "Paid",
    specialRequests: "Quiet corner room preferred, late arrival around 8:00 PM.",
    createdAt: "2026-10-18T10:30:00.000Z"
  },
  {
    _id: "664fa3f1b8109a1b1c000021",
    room: "664fa2a3b8109a1b1c000011",
    user: "664fa1e2b8109a1b1c000001",
    guestName: "Eleanor Vance",
    guestEmail: "guest@atithigo.com",
    guestPhone: "+1 (555) 234-8901",
    roomName: "The Belvedere Penthouse",
    checkIn: "2026-09-01",
    checkOut: "2026-09-05",
    nights: 4,
    guests: { adults: 2, children: 0 },
    totalPrice: 3120,
    status: "Completed",
    paymentStatus: "Paid",
    specialRequests: "Champagne on arrival.",
    createdAt: "2026-08-15T14:15:00.000Z"
  }
];

const seedHousekeeping = [
  {
    _id: "664fa4c5b8109a1b1c000030",
    room: "664fa2a3b8109a1b1c000012",
    roomName: "The Coastal Dune Villa",
    task: "Turnover deep clean & linen replacement",
    assignedTo: "Maria Santos",
    status: "In Progress",
    priority: "High",
    scheduledFor: "Today, 14:00"
  },
  {
    _id: "664fa4c5b8109a1b1c000031",
    room: "664fa2a3b8109a1b1c000010",
    roomName: "The Pavilion Garden Suite",
    task: "Inspection prior to VIP guest arrival",
    assignedTo: "Julian Mercier",
    status: "Pending",
    priority: "Normal",
    scheduledFor: "Tomorrow, 11:00"
  },
  {
    _id: "664fa4c5b8109a1b1c000032",
    room: "664fa2a3b8109a1b1c000015",
    roomName: "The Kyoto Zen Pavilion",
    task: "Evening turn-down & hinoki bath preparation",
    assignedTo: "Kenji Sato",
    status: "Completed",
    priority: "Normal",
    scheduledFor: "Today, 18:30"
  }
];

module.exports = { seedUsers, seedHotels, seedRooms, seedBookings, seedHousekeeping };
