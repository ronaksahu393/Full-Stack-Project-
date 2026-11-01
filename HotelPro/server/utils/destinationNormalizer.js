/**
 * HotelPro India Destination Normalizer
 * Handles city name variations, historical aliases, and state normalizations.
 */

const CITY_ALIASES = {
  // Karnataka
  "bangalore": "Bengaluru",
  "bengaluru": "Bengaluru",
  "mysore": "Mysuru",
  "mysuru": "Mysuru",
  "mangalore": "Mangaluru",
  "mangaluru": "Mangaluru",
  "coorg": "Coorg",
  "madikeri": "Coorg",
  "hampi": "Hampi",

  // Maharashtra
  "bombay": "Mumbai",
  "mumbai": "Mumbai",
  "poona": "Pune",
  "pune": "Pune",
  "nagpur": "Nagpur",

  // Tamil Nadu
  "madras": "Chennai",
  "chennai": "Chennai",
  "coimbatore": "Coimbatore",
  "madurai": "Madurai",
  "ooty": "Ooty",
  "udhagamandalam": "Ooty",

  // West Bengal
  "calcutta": "Kolkata",
  "kolkata": "Kolkata",
  "siliguri": "Siliguri",
  "darjeeling": "Darjeeling",

  // Uttar Pradesh
  "banaras": "Varanasi",
  "benares": "Varanasi",
  "kashi": "Varanasi",
  "varanasi": "Varanasi",
  "allahabad": "Prayagraj",
  "prayagraj": "Prayagraj",
  "lucknow": "Lucknow",
  "agra": "Agra",

  // Delhi NCR
  "delhi": "New Delhi",
  "new delhi": "New Delhi",
  "dilli": "New Delhi",
  "gurgaon": "Gurugram",
  "gurugram": "Gurugram",
  "noida": "Noida",

  // Kerala
  "cochin": "Kochi",
  "kochi": "Kochi",
  "trivandrum": "Thiruvananthapuram",
  "thiruvananthapuram": "Thiruvananthapuram",
  "alleppey": "Alleppey",
  "alappuzha": "Alleppey",
  "munnar": "Munnar",

  // Gujarat
  "baroda": "Vadodara",
  "vadodara": "Vadodara",
  "ahmedabad": "Ahmedabad",
  "surat": "Surat",

  // Rajasthan
  "jaipur": "Jaipur",
  "udaipur": "Udaipur",
  "jodhpur": "Jodhpur",
  "jaisalmer": "Jaisalmer",

  // Goa
  "goa": "Goa",
  "panaji": "Panaji",
  "panjim": "Panaji",

  // Himachal Pradesh & J&K / Ladakh
  "shimla": "Shimla",
  "simla": "Shimla",
  "manali": "Manali",
  "dharamshala": "Dharamshala",
  "srinagar": "Srinagar",
  "leh": "Leh",
  "ladakh": "Ladakh",

  // Uttarakhand
  "rishikesh": "Rishikesh",
  "haridwar": "Haridwar",
  "dehradun": "Dehradun",
  "nainital": "Nainital",

  // Punjab & Haryana
  "amritsar": "Amritsar",
  "chandigarh": "Chandigarh",
  "ludhiana": "Ludhiana",

  // Madhya Pradesh
  "bhopal": "Bhopal",
  "indore": "Indore",
  "gwalior": "Gwalior",
  "jabalpur": "Jabalpur",

  // Odisha
  "bhubaneswar": "Bhubaneswar",
  "bhubaneshwar": "Bhubaneswar",
  "puri": "Puri",
  "cuttack": "Cuttack",

  // North-East
  "guwahati": "Guwahati",
  "gauhati": "Guwahati",
  "shillong": "Shillong",
  "gangtok": "Gangtok",

  // Telangana & Andhra Pradesh
  "hyderabad": "Hyderabad",
  "secunderabad": "Hyderabad",
  "visakhapatnam": "Visakhapatnam",
  "vizag": "Visakhapatnam",
  "tirupati": "Tirupati",

  // Puducherry
  "pondicherry": "Puducherry",
  "puducherry": "Puducherry"
};

const STATE_MAPPINGS = {
  "delhi": "Delhi",
  "maharashtra": "Maharashtra",
  "karnataka": "Karnataka",
  "tamil nadu": "Tamil Nadu",
  "telangana": "Telangana",
  "andhra pradesh": "Andhra Pradesh",
  "west bengal": "West Bengal",
  "rajasthan": "Rajasthan",
  "uttar pradesh": "Uttar Pradesh",
  "goa": "Goa",
  "kerala": "Kerala",
  "himachal pradesh": "Himachal Pradesh",
  "jammu and kashmir": "Jammu & Kashmir",
  "jammu & kashmir": "Jammu & Kashmir",
  "kashmir": "Jammu & Kashmir",
  "j&k": "Jammu & Kashmir",
  "ladakh": "Ladakh",
  "gujarat": "Gujarat",
  "madhya pradesh": "Madhya Pradesh",
  "punjab": "Punjab",
  "odisha": "Odisha",
  "orissa": "Odisha",
  "assam": "Assam",
  "meghalaya": "Meghalaya",
  "uttarakhand": "Uttarakhand",
  "uttaranchal": "Uttarakhand",
  "puducherry": "Puducherry",
  "pondicherry": "Puducherry"
};

// Sorted by key length descending so longer compound keys match before shorter sub-tokens
const SORTED_CITY_ALIASES = Object.entries(CITY_ALIASES).sort(
  (a, b) => b[0].length - a[0].length
);
const SORTED_STATE_MAPPINGS = Object.entries(STATE_MAPPINGS).sort(
  (a, b) => b[0].length - a[0].length
);

function normalizeDestination(query) {
  if (!query || typeof query !== "string") return "";

  // Normalize spaces, collapse multiple spaces, trim, and lowercase
  const cleaned = query
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  if (!cleaned) return "";

  // 1. Exact city alias match
  if (CITY_ALIASES[cleaned]) {
    return CITY_ALIASES[cleaned];
  }

  // 2. Exact state match
  if (STATE_MAPPINGS[cleaned]) {
    return STATE_MAPPINGS[cleaned];
  }

  // 3. Whole-word boundary check for compound phrases (e.g. "hotels in new delhi", "goa beach", "jaipur palace")
  // Checking longer aliases first prevents "delhi" from intercepting "new delhi"
  for (const [alias, canonical] of SORTED_CITY_ALIASES) {
    const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(cleaned)) {
      return canonical;
    }
  }

  for (const [alias, canonical] of SORTED_STATE_MAPPINGS) {
    const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(cleaned)) {
      return canonical;
    }
  }

  return query.trim().replace(/\s+/g, " ");
}

/**
 * Normalizes explicit structured address components.
 */
function normalizeLocationComponents({ country, state, city, locality } = {}) {
  const normCountry = (country || "").trim().replace(/\s+/g, " ");
  let normState = (state || "").trim().replace(/\s+/g, " ");
  let normCity = (city || "").trim().replace(/\s+/g, " ");
  const normLocality = (locality || "").trim().replace(/\s+/g, " ");

  if (normCity && CITY_ALIASES[normCity.toLowerCase()]) {
    normCity = CITY_ALIASES[normCity.toLowerCase()];
  }

  if (normState && STATE_MAPPINGS[normState.toLowerCase()]) {
    normState = STATE_MAPPINGS[normState.toLowerCase()];
  }

  return {
    country: normCountry,
    state: normState,
    city: normCity,
    locality: normLocality
  };
}

module.exports = {
  CITY_ALIASES,
  STATE_MAPPINGS,
  normalizeDestination,
  normalizeLocationComponents
};
