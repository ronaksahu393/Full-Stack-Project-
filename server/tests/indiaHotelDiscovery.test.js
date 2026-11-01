/**
 * Automated Verification Suite for HotelPro India-Wide Hotel Search,
 * Discovery, Ranking, and Booking Architecture.
 */

const assert = require("assert");
const { setupTestEnvironment } = require("./testHelper");

let BASE_URL = "";

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const contentType = res.headers.get("content-type") || "";
  let body = null;
  if (contentType.includes("application/json")) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  return { status: res.status, ok: res.ok, body };
}

async function runTests() {
  const env = await setupTestEnvironment();
  BASE_URL = env.serverUrl;
  console.log("\n=================================================");
  console.log("  HOTELPRO INDIA HOTEL SEARCH & DISCOVERY SUITE  ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Direct Indian City Search
  await test("Search returns matching properties for Indian city 'Jaipur'", async () => {
    const res = await request("/api/hotels/search?destination=Jaipur");
    assert.strictEqual(res.status, 200);
    assert(res.body.count >= 1, "Should find at least 1 hotel in Jaipur");
    assert(res.body.hotels.some((h) => h.address.city === "Jaipur"), "Result must be in Jaipur");
  });

  // 2. City Alias Normalization (Bombay -> Mumbai)
  await test("City alias 'Bombay' automatically normalizes to 'Mumbai'", async () => {
    const res = await request("/api/hotels/search?destination=bombay");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.normalizedDestination, "Mumbai");
    assert(res.body.count >= 1, "Should locate Mumbai hotels for 'bombay'");
    assert(res.body.hotels.some((h) => h.address.city === "Mumbai"));
  });

  // 3. City Alias Normalization (Calcutta -> Kolkata, Banaras -> Varanasi)
  await test("Historical alias 'Banaras' normalizes to 'Varanasi'", async () => {
    const res = await request("/api/hotels/search?destination=banaras");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.normalizedDestination, "Varanasi");
    assert(res.body.count >= 1, "Should locate Varanasi hotels");
  });

  // 4. Search by Indian State
  await test("Searching for state 'Rajasthan' returns all Rajasthan properties", async () => {
    const res = await request("/api/hotels/search?destination=Rajasthan");
    assert.strictEqual(res.status, 200);
    assert(res.body.count >= 2, "Should find multiple Rajasthan properties (Jaipur, Udaipur, etc.)");
    assert(res.body.hotels.every((h) => h.address.state === "Rajasthan"));
  });

  // 5. Destination Autocomplete
  await test("Autocomplete returns city suggestion with property count", async () => {
    const res = await request("/api/hotels/autocomplete?q=jai");
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.body.suggestions), "Suggestions should be an array");
    const citySug = res.body.suggestions.find((s) => s.city === "Jaipur");
    assert(citySug, "Should suggest Jaipur");
    assert(citySug.propertyCount >= 1, "Should include property count");
  });

  // 6. Filter by Verified Star Classification
  await test("Filtering by 5-star rating returns only verified 5-star properties", async () => {
    const res = await request("/api/hotels/search?starRating=5");
    assert.strictEqual(res.status, 200);
    assert(res.body.count >= 1, "Should have 5-star properties");
    assert(res.body.hotels.every((h) => h.starClassification === 5), "All must be 5-star");
  });

  // 7. Filter by Budget in INR
  await test("Filtering by max price ₹ 6,000 excludes higher priced properties", async () => {
    const res = await request("/api/hotels/search?maxPrice=6000");
    assert.strictEqual(res.status, 200);
    assert(res.body.count >= 1, "Should find affordable Indian properties");
    assert(res.body.hotels.every((h) => h.startingPrice <= 6000), "Starting price must be <= 6000");
  });

  // 8. Filter by Amenities (Swimming Pool)
  await test("Filtering by swimmingPool=true returns only properties with pool facilities", async () => {
    const res = await request("/api/hotels/search?swimmingPool=true");
    assert.strictEqual(res.status, 200);
    assert(res.body.count >= 1);
    assert(res.body.hotels.every((h) => {
      const combined = [...(h.facilities || []), ...(h.amenities || [])].map(f => f.toLowerCase());
      return combined.some(f => f.includes("pool"));
    }));
  });

  // 9. Sorting by Price Low to High
  await test("Sort 'price-asc' arranges hotels in ascending price order", async () => {
    const res = await request("/api/hotels/search?sort=price-asc");
    assert.strictEqual(res.status, 200);
    const prices = res.body.hotels.map((h) => h.effectiveStartingPrice);
    for (let i = 0; i < prices.length - 1; i++) {
      assert(prices[i] <= prices[i + 1], `Price at ${i} (${prices[i]}) must be <= price at ${i + 1} (${prices[i + 1]})`);
    }
  });

  // 10. Transparent Recommendation Ranking Score
  await test("Recommended search returns rankingScore and rankingBreakdown", async () => {
    const res = await request("/api/hotels/search?destination=Goa&sort=recommended");
    assert.strictEqual(res.status, 200);
    assert(res.body.count >= 1);
    const topHotel = res.body.hotels[0];
    assert(typeof topHotel.rankingScore === "number", "Should compute ranking score");
    assert(topHotel.rankingScore > 0 && topHotel.rankingScore <= 100, "Score between 0-100");
    assert(topHotel.rankingBreakdown.ratingScore > 0, "Breakdown should include rating component");
  });

  // 11. Indian GST Tax Calculation Check
  await test("Tax breakdown applies 12% GST for rate < ₹7500 and 18% for >= ₹7500", async () => {
    const res = await request("/api/hotels/search?destination=Mumbai");
    assert.strictEqual(res.status, 200);
    const hotel = res.body.hotels[0];
    assert(hotel.taxDetails, "Must include tax details");
    if (hotel.effectiveStartingPrice >= 7500) {
      assert.strictEqual(hotel.taxDetails.gstPercent, 18, "Should be 18% GST");
    } else {
      assert.strictEqual(hotel.taxDetails.gstPercent, 12, "Should be 12% GST");
    }
  });

  // 12. Non-existent Destination Empty State
  await test("Search for non-existent destination 'AtlantisIsland' returns count 0", async () => {
    const res = await request("/api/hotels/search?destination=AtlantisIsland");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.count, 0, "Must return 0 matching hotels");
  });

  // 13. Hotel Details with Room Types in INR
  await test("GET /api/hotels/:id returns hotel details with INR room types", async () => {
    const res = await request("/api/hotels/660000000000000000000101");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.hotel.name, "Rajputana Heritage Haveli & Spa");
    assert(Array.isArray(res.body.rooms), "Should return associated room types");
    assert(res.body.rooms.length >= 1, "Should have room types");
    assert.strictEqual(res.body.rooms[0].currency, "INR");
  });

  // 14. Date-Based Overlapping Reservation Exclusion
  await test("Date-based search accurately checks room availability", async () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const dayAfter = new Date(Date.now() + 172800000).toISOString().split("T")[0];
    const res = await request(`/api/hotels/search?destination=Jaipur&checkIn=${tomorrow}&checkOut=${dayAfter}`);
    assert.strictEqual(res.status, 200);
    assert(res.body.count >= 1, "Jaipur hotel should be available for tomorrow");
  });

  // 15. Locality Query with City: "Vijay Nagar, Indore"
  await test("Search 'Vijay Nagar, Indore' prioritizes property matching the locality", async () => {
    const res = await request("/api/hotels/search?destination=Vijay Nagar, Indore");
    assert.strictEqual(res.status, 200);
    assert(res.body.count >= 1, "Should find property in Vijay Nagar, Indore");
    const topResult = res.body.hotels[0];
    assert.strictEqual(topResult.address.city, "Indore");
    assert.strictEqual(topResult.address.locality, "Vijay Nagar");
  });

  // 16. Locality Query with State: "Candolim, Goa"
  await test("Search 'Candolim, Goa' returns Goa beachfront property in Candolim", async () => {
    const res = await request("/api/hotels/search?destination=Candolim, Goa");
    assert.strictEqual(res.status, 200);
    assert(res.body.count >= 1, "Should find property in Candolim, Goa");
    assert(res.body.hotels.some(h => h.address.locality === "Candolim" && h.address.state === "Goa"));
  });

  // 17. Country Search: "India"
  await test("Search 'India' returns all nationwide demonstration properties", async () => {
    const res = await request("/api/hotels/search?destination=India");
    assert.strictEqual(res.status, 200);
    assert(res.body.count >= 20, "Should return at least 20 Indian demonstration properties");
    assert(res.body.hotels.every(h => h.address.country === "India"));
  });

  // 18. Case Variations and Multiple Spaces Safely Handled
  await test("Handles case differences and extra whitespace in search safely", async () => {
    const res1 = await request("/api/hotels/search?destination=%20%20%20Jaipur%20%20%20");
    assert.strictEqual(res1.status, 200);
    assert(res1.body.count >= 1, "Should match 'Jaipur' with surrounding spaces");

    const res2 = await request("/api/hotels/search?destination=jAiPuR");
    assert.strictEqual(res2.status, 200);
    assert.strictEqual(res2.body.count, res1.body.count, "Mixed case should match identically");

    const res3 = await request("/api/hotels/search?destination=New%20%20%20Delhi");
    assert.strictEqual(res3.status, 200);
    assert(res3.body.count >= 1, "Multiple internal spaces should collapse and match");
  });

  // 19. Unrelated Similar Names Non-Matching (Requirement 3)
  await test("Does NOT match unrelated destinations merely because words resemble city names ('Goat', 'Goal', 'Purification')", async () => {
    const resGoat = await request("/api/hotels/search?destination=Goat");
    assert.strictEqual(resGoat.status, 200);
    assert.strictEqual(resGoat.body.count, 0, "Goat must NOT match Goa");

    const resGoal = await request("/api/hotels/search?destination=Goal");
    assert.strictEqual(resGoal.status, 200);
    assert.strictEqual(resGoal.body.count, 0, "Goal must NOT match Goa");

    const resPuri = await request("/api/hotels/search?destination=Purification");
    assert.strictEqual(resPuri.status, 200);
    assert.strictEqual(resPuri.body.count, 0, "Purification must NOT match Puri");

    const resLondon = await request("/api/hotels/search?destination=London");
    assert.strictEqual(resLondon.status, 200);
    assert.strictEqual(resLondon.body.count, 0, "London must NOT match any Indian hotels");
  });

  // 20. Missing Ratings Do NOT Receive Artificial Advantage (Requirement 7)
  await test("Unreviewed properties with missing ratings do not receive an artificial advantage", async () => {
    const { calculateRecommendedScore } = require("../utils/rankingEngine");
    const ratedHotel = {
      name: "Established Boutique Stay",
      startingPrice: 5000,
      rating: 4.2,
      reviewCount: 40,
      isStarVerified: true,
      starClassification: 4
    };
    const unratedHotel = {
      name: "New Unrated Boutique Stay",
      startingPrice: 5000,
      rating: null,
      reviewCount: 0,
      isStarVerified: true,
      starClassification: 4
    };

    const scoreRated = calculateRecommendedScore(ratedHotel);
    const scoreUnrated = calculateRecommendedScore(unratedHotel);

    assert(scoreRated.score > scoreUnrated.score, "Established rated hotel must score higher than unrated property");
    assert.strictEqual(scoreUnrated.breakdown.unrated, true, "Unrated property breakdown must flag unrated");
    assert(scoreUnrated.breakdown.ratingScore <= 20, "Unrated rating score must be conservative");
  });

  // 21. Invalid Date Range Handling (checkOut <= checkIn)
  await test("Invalid date ranges (checkOut <= checkIn) return predictable empty response without server error", async () => {
    const res = await request("/api/hotels/search?destination=Jaipur&checkIn=2026-12-10&checkOut=2026-12-05");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.count, 0);
    assert.strictEqual(res.body.invalidDateRange, true, "Should report invalid date range safely");
  });

  // 22. Transparent Demo Scope Disclaimer (Requirement 9 & 12)
  await test("Search API returns explicit demo scope disclaimer and distinguishes demo inventory", async () => {
    const res = await request("/api/hotels/search?destination=India");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.isDemo, true);
    assert.strictEqual(res.body.inventoryScope, "curated_demonstration");
    assert(typeof res.body.inventoryDisclaimer === "string", "Must provide disclaimer text");
    assert(!res.body.inventoryDisclaimer.toLowerCase().includes("every hotel"), "Must not claim every hotel in India");

    const autoRes = await request("/api/hotels/autocomplete?q=Ind");
    assert.strictEqual(autoRes.status, 200);
    const indiaSug = autoRes.body.suggestions.find(s => s.country === "India");
    assert(indiaSug, "Should find India suggestion");
    assert(!indiaSug.label.includes("All Destinations"), "Label should not claim 'All Destinations'");
  });

  // 23. Sort by Price High to Low
  await test("Sort 'price-desc' arranges hotels in descending price order", async () => {
    const res = await request("/api/hotels/search?destination=India&sort=price-desc");
    assert.strictEqual(res.status, 200);
    const prices = res.body.hotels.map((h) => h.effectiveStartingPrice);
    for (let i = 0; i < prices.length - 1; i++) {
      assert(prices[i] >= prices[i + 1], `Price at ${i} (${prices[i]}) must be >= price at ${i + 1} (${prices[i + 1]})`);
    }
  });

  // 24. Sort by Guest Rating
  await test("Sort 'rating' prioritizes highly rated properties", async () => {
    const res = await request("/api/hotels/search?destination=India&sort=rating");
    assert.strictEqual(res.status, 200);
    const ratings = res.body.hotels.map((h) => h.rating || 0);
    for (let i = 0; i < ratings.length - 1; i++) {
      assert(ratings[i] >= ratings[i + 1], `Rating at ${i} (${ratings[i]}) must be >= rating at ${i + 1} (${ratings[i + 1]})`);
    }
  });

  // 25. Filter by Property Category
  await test("Filter by category 'Heritage Palace' returns only heritage palaces", async () => {
    const res = await request("/api/hotels/search?category=Heritage%20Palace");
    assert.strictEqual(res.status, 200);
    assert(res.body.count >= 1);
    assert(res.body.hotels.every((h) => h.propertyCategory === "Heritage Palace"));
  });

  // 26. Multiple Amenities Filter
  await test("Filter with multiple amenities (freeWifi & swimmingPool) matches accurately", async () => {
    const res = await request("/api/hotels/search?freeWifi=true&swimmingPool=true");
    assert.strictEqual(res.status, 200);
    assert(res.body.count >= 1);
    assert(res.body.hotels.every((h) => {
      const combined = [...(h.facilities || []), ...(h.amenities || [])].map((f) => f.toLowerCase());
      const hasWifi = combined.some((f) => f.includes("wi-fi") || f.includes("wifi"));
      const hasPool = combined.some((f) => f.includes("pool"));
      return hasWifi && hasPool;
    }));
  });

  // 27. Pagination Structure and Non-overlapping Slices
  await test("Pagination with limit=3 and page=1 / page=2 returns distinct slices", async () => {
    const page1Res = await request("/api/hotels/search?destination=India&limit=3&page=1");
    const page2Res = await request("/api/hotels/search?destination=India&limit=3&page=2");
    assert.strictEqual(page1Res.status, 200);
    assert.strictEqual(page2Res.status, 200);
    assert.strictEqual(page1Res.body.hotels.length, 3);
    assert.strictEqual(page2Res.body.hotels.length, 3);

    const idsPage1 = new Set(page1Res.body.hotels.map((h) => h._id || h.slug));
    const overlap = page2Res.body.hotels.some((h) => idsPage1.has(h._id || h.slug));
    assert.strictEqual(overlap, false, "Page 1 and Page 2 results must not overlap");
  });

  await env.teardown();

  console.log("\n-------------------------------------------------");
  console.log(`  SUMMARY: ${passed} / ${passed + failed} tests passed successfully.`);
  console.log("-------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
