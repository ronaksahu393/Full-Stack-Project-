const express = require("express");
const router = express.Router();
const {
  getProviderStatus,
  searchHotels,
  getAutocomplete,
  getHotelById,
  getFeaturedHotels,
  getDestinations
} = require("../controllers/hotelController");

router.get("/provider-status", getProviderStatus);
router.get("/search", searchHotels);
router.get("/autocomplete", getAutocomplete);
router.get("/featured", getFeaturedHotels);
router.get("/destinations", getDestinations);
router.get("/:id", getHotelById);

module.exports = router;
