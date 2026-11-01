/**
 * HotelPro Transparent Ranking Engine
 * Computes a deterministic, evidence-based score for hotel recommendations.
 *
 * Scoring Components (0-100 total):
 * 1. Bayesian Smoothed Rating (0-40 pts):
 *    WR = (v / (v + m)) * R + (m / (v + m)) * C
 *    where v = reviewCount, m = 10 (minimum threshold), R = hotel.rating, C = 3.8 (prior mean).
 *    Unrated properties receive a conservative baseline (18 pts) to ensure missing ratings
 *    do not receive an artificial advantage over established properties with real guest reviews.
 * 2. Search Relevance (0-30 pts):
 *    Matches on city, state, name, or locality.
 * 3. Star Classification (0-15 pts):
 *    Verified star classification weight (3 pts per star).
 * 4. Value / Price Sweet Spot (0-15 pts):
 *    Rewards balanced price-to-rating ratio and budget adherence.
 */

const PRIOR_MIN_REVIEWS = 10;
const PRIOR_MEAN_RATING = 3.8;

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function calculateBayesianRating(rating, reviewCount = 0) {
  const v = Math.max(0, Number(reviewCount) || 0);
  if (rating === null || rating === undefined || isNaN(Number(rating)) || v === 0) {
    return null; // Unrated / newly listed property
  }
  const R = Math.min(5, Math.max(1, Number(rating)));
  const m = PRIOR_MIN_REVIEWS;
  const C = PRIOR_MEAN_RATING;

  // Bayesian weighted average
  return (v / (v + m)) * R + (m / (v + m)) * C;
}

function calculateRecommendedScore(hotel, searchParams = {}) {
  let score = 0;
  const breakdown = {};

  // 1. Bayesian Rating (Max 40 points)
  const smoothedRating = calculateBayesianRating(hotel.rating, hotel.reviewCount);
  let ratingScore = 0;
  if (smoothedRating !== null) {
    ratingScore = (smoothedRating / 5.0) * 40;
    breakdown.smoothedRating = Math.round(smoothedRating * 100) / 100;
    breakdown.unrated = false;
  } else {
    // Missing ratings do NOT receive an artificial advantage over established stays
    ratingScore = 18.0; // Conservative neutral baseline
    breakdown.smoothedRating = null;
    breakdown.unrated = true;
  }
  score += ratingScore;
  breakdown.ratingScore = Math.round(ratingScore * 10) / 10;

  // 2. Search Relevance (Max 30 points)
  let relevanceScore = 10; // Baseline
  const query = (searchParams.destination || searchParams.search || "").toLowerCase().trim();
  if (query) {
    const cityName = (hotel.address?.city || "").toLowerCase();
    const stateName = (hotel.address?.state || "").toLowerCase();
    const hotelName = (hotel.name || "").toLowerCase();
    const locality = (hotel.address?.locality || "").toLowerCase();

    if (locality && new RegExp(`\\b${escapeRegex(locality)}\\b`, "i").test(query)) {
      relevanceScore += 22;
    } else if (hotelName && hotelName.includes(query)) {
      relevanceScore += 20;
    } else if (cityName && (cityName === query || new RegExp(`\\b${escapeRegex(cityName)}\\b`, "i").test(query))) {
      relevanceScore += 18;
    } else if (stateName && (stateName === query || new RegExp(`\\b${escapeRegex(stateName)}\\b`, "i").test(query))) {
      relevanceScore += 12;
    }
  } else {
    relevanceScore = 20;
  }
  relevanceScore = Math.min(30, relevanceScore);
  score += relevanceScore;
  breakdown.relevanceScore = relevanceScore;

  // 3. Star Classification (Max 15 points)
  let starScore = 0;
  if (hotel.isStarVerified && hotel.starClassification) {
    starScore = Math.min(15, hotel.starClassification * 3);
  } else if (hotel.starClassification) {
    starScore = Math.min(10, hotel.starClassification * 2);
  } else {
    starScore = 8; // Independent boutique default
  }
  score += starScore;
  breakdown.starScore = starScore;

  // 4. Value / Availability (Max 15 points)
  let valueScore = 10;
  if (hotel.startingPrice && hotel.startingPrice > 0) {
    if (searchParams.maxPrice) {
      const budget = Number(searchParams.maxPrice);
      if (hotel.startingPrice <= budget) {
        valueScore = 15;
      } else {
        valueScore = 5;
      }
    } else {
      valueScore = 12;
    }
  }
  score += valueScore;
  breakdown.valueScore = valueScore;

  const totalScore = Math.min(100, Math.round(score));
  return {
    score: totalScore,
    breakdown
  };
}

module.exports = {
  calculateBayesianRating,
  calculateRecommendedScore
};
