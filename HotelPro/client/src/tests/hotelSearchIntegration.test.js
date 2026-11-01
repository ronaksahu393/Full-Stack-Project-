import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { api } from "../services/api.js";

describe("Frontend Hotel Search API Integration Suite", () => {
  let originalFetch;
  let lastFetchUrl = null;
  let lastFetchOptions = null;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    lastFetchUrl = null;
    lastFetchOptions = null;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("searchHotels correctly serializes destination, dates, occupancy, and filters", async () => {
    globalThis.fetch = async (url, options) => {
      lastFetchUrl = url;
      lastFetchOptions = options;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          count: 2,
          totalCount: 15,
          totalPages: 3,
          page: 1,
          normalizedDestination: "Jaipur",
          providerMode: "demo",
          inventoryDisclaimer: "Curated demonstration catalog",
          hotels: [
            { _id: "h1", name: "Rajputana Haveli", startingPrice: 6500 },
            { _id: "h2", name: "Amber Fort Villa", startingPrice: 9000 }
          ]
        })
      };
    };

    const searchParams = {
      destination: "Jaipur",
      checkIn: "2026-11-10",
      checkOut: "2026-11-15",
      adults: "2",
      children: "1",
      rooms: "1",
      starRating: "5",
      maxPrice: 20000,
      page: 1,
      limit: 6,
      freeWifi: "true"
    };

    const res = await api.searchHotels(searchParams);

    assert.ok(lastFetchUrl.startsWith("/api/hotels/search?"));
    const urlObj = new URL(lastFetchUrl, "http://localhost");
    assert.equal(urlObj.searchParams.get("destination"), "Jaipur");
    assert.equal(urlObj.searchParams.get("checkIn"), "2026-11-10");
    assert.equal(urlObj.searchParams.get("checkOut"), "2026-11-15");
    assert.equal(urlObj.searchParams.get("adults"), "2");
    assert.equal(urlObj.searchParams.get("children"), "1");
    assert.equal(urlObj.searchParams.get("rooms"), "1");
    assert.equal(urlObj.searchParams.get("starRating"), "5");
    assert.equal(urlObj.searchParams.get("maxPrice"), "20000");
    assert.equal(urlObj.searchParams.get("freeWifi"), "true");

    assert.equal(res.hotels.length, 2);
    assert.equal(res.totalCount, 15);
    assert.equal(res.totalPages, 3);
    assert.equal(res.normalizedDestination, "Jaipur");
    assert.equal(res.providerMode, "demo");
  });

  it("searchHotels omits empty, null, or 'All' filter parameters from query string", async () => {
    globalThis.fetch = async (url) => {
      lastFetchUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => ({ count: 0, hotels: [] })
      };
    };

    await api.searchHotels({
      destination: "Goa",
      category: "All",
      starRating: "All",
      minRating: "All",
      children: "",
      checkIn: null,
      checkOut: undefined
    });

    const urlObj = new URL(lastFetchUrl, "http://localhost");
    assert.equal(urlObj.searchParams.get("destination"), "Goa");
    assert.equal(urlObj.searchParams.has("category"), false);
    assert.equal(urlObj.searchParams.has("starRating"), false);
    assert.equal(urlObj.searchParams.has("minRating"), false);
    assert.equal(urlObj.searchParams.has("checkIn"), false);
    assert.equal(urlObj.searchParams.has("checkOut"), false);
  });

  it("getAutocomplete formats encoded query and safely returns suggestions array", async () => {
    globalThis.fetch = async (url) => {
      lastFetchUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          suggestions: [
            { label: "Jaipur, Rajasthan", type: "city", city: "Jaipur", propertyCount: 4 }
          ]
        })
      };
    };

    const suggestions = await api.getAutocomplete("Jai pur");
    assert.ok(lastFetchUrl.includes("q=Jai%20pur"));
    assert.equal(suggestions.length, 1);
    assert.equal(suggestions[0].city, "Jaipur");
  });

  it("getHotelById forwards check-in and check-out parameters", async () => {
    globalThis.fetch = async (url) => {
      lastFetchUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          hotel: { _id: "660000000000000000000101", name: "Rajputana Heritage Haveli" },
          rooms: [{ _id: "r1", name: "Royal Suite", pricePerNight: 8500, isAvailable: true }],
          roomCount: 1
        })
      };
    };

    const result = await api.getHotelById("660000000000000000000101", {
      checkIn: "2026-12-01",
      checkOut: "2026-12-05"
    });

    assert.ok(lastFetchUrl.includes("/api/hotels/660000000000000000000101?"));
    const urlObj = new URL(lastFetchUrl, "http://localhost");
    assert.equal(urlObj.searchParams.get("checkIn"), "2026-12-01");
    assert.equal(urlObj.searchParams.get("checkOut"), "2026-12-05");
    assert.equal(result.hotel.name, "Rajputana Heritage Haveli");
    assert.equal(result.rooms.length, 1);
    assert.equal(result.rooms[0].isAvailable, true);
  });

  it("getHotelById safely supports hotel slug identifier", async () => {
    globalThis.fetch = async (url) => {
      lastFetchUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          hotel: { _id: "h1", slug: "rajputana-heritage-haveli", name: "Rajputana Heritage Haveli" },
          rooms: []
        })
      };
    };

    const result = await api.getHotelById("rajputana-heritage-haveli");
    assert.ok(lastFetchUrl.endsWith("/api/hotels/rajputana-heritage-haveli"));
    assert.equal(result.hotel.slug, "rajputana-heritage-haveli");
  });

  it("searchHotels rejects when backend returns an error status", async () => {
    globalThis.fetch = async () => ({
      ok: false,
      status: 503,
      json: async () => ({ message: "Hotel discovery service temporarily unavailable" })
    });

    await assert.rejects(
      async () => {
        await api.searchHotels({ destination: "Varanasi" });
      },
      (err) => {
        assert.equal(err.status, 503);
        assert.match(err.message, /temporarily unavailable/i);
        return true;
      }
    );
  });
});
