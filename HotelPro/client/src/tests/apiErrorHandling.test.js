import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { handleResponse, fetchWithTimeout, api } from "../services/api.js";

// Mock localStorage and window Event dispatch for Node testing
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

describe("Frontend API Service - Error Handling & Fallbacks", () => {
  let originalFetch;
  let dispatchedEvents = [];

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.localStorage = new MockLocalStorage();
    dispatchedEvents = [];
    globalThis.window = {
      dispatchEvent: (event) => {
        dispatchedEvents.push(event.type);
      }
    };
    globalThis.Event = class Event {
      constructor(type) {
        this.type = type;
      }
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete globalThis.window;
    delete globalThis.Event;
  });

  describe("handleResponse & HTTP Status Codes", () => {
    it("handles 401 Session Expiration: clears auth storage and dispatches unauthorized event", async () => {
      globalThis.localStorage.setItem("hotelpro_jwt_token", "expired_token_123");
      globalThis.localStorage.setItem("hotelpro_user_session", JSON.stringify({ name: "Guest" }));

      const mockRes = {
        ok: false,
        status: 401,
        json: async () => ({ message: "Session expired or token invalid" })
      };

      await assert.rejects(
        async () => {
          await handleResponse(mockRes);
        },
        (err) => {
          assert.equal(err.status, 401);
          assert.match(err.message, /Session expired/);
          return true;
        }
      );

      // Verify credentials cleared
      assert.equal(globalThis.localStorage.getItem("hotelpro_jwt_token"), null);
      assert.equal(globalThis.localStorage.getItem("hotelpro_user_session"), null);
      // Verify event dispatched
      assert.ok(dispatchedEvents.includes("hotelpro:unauthorized"));
    });

    it("handles 400 Validation Error: preserves precise user-facing error message", async () => {
      const mockRes = {
        ok: false,
        status: 400,
        json: async () => ({ message: "Check-out date must be after check-in date" })
      };

      await assert.rejects(
        async () => {
          await handleResponse(mockRes);
        },
        (err) => {
          assert.equal(err.status, 400);
          assert.equal(err.message, "Check-out date must be after check-in date");
          return true;
        }
      );
    });

    it("sanitizes 500 internal errors: prevents leaking Mongo errors or stack traces to users", async () => {
      const mockRes = {
        ok: false,
        status: 500,
        json: async () => ({
          message: "MongoServerError: E11000 duplicate key error collection: hotelpro.bookings index: slug_1 at Object.execute (node_modules/mongodb/index.js:124)"
        })
      };

      await assert.rejects(
        async () => {
          await handleResponse(mockRes);
        },
        (err) => {
          assert.equal(err.status, 500);
          assert.equal(err.message, "A server processing error occurred. Please try again or contact concierge support.");
          assert.doesNotMatch(err.message, /MongoServerError/);
          assert.doesNotMatch(err.message, /node_modules/);
          return true;
        }
      );
    });

    it("handles 503 Service Unavailable: provides a polite retry message", async () => {
      const mockRes = {
        ok: false,
        status: 503,
        json: async () => ({})
      };

      await assert.rejects(
        async () => {
          await handleResponse(mockRes);
        },
        (err) => {
          assert.equal(err.status, 503);
          assert.match(err.message, /temporarily unavailable/i);
          return true;
        }
      );
    });

    it("returns parsed JSON when response is ok", async () => {
      const mockRes = {
        ok: true,
        status: 200,
        json: async () => ({ success: true, hotels: [{ id: "h1", name: "Taj Lake Palace" }] })
      };

      const result = await handleResponse(mockRes);
      assert.equal(result.success, true);
      assert.equal(result.hotels.length, 1);
    });
  });

  describe("Network and Timeout Handling", () => {
    it("converts failed fetch / NetworkError to a clean user-friendly message", async () => {
      globalThis.fetch = async () => {
        throw new TypeError("Failed to fetch");
      };

      await assert.rejects(
        async () => {
          await fetchWithTimeout("/api/rooms");
        },
        (err) => {
          assert.equal(err.isNetworkError, true);
          assert.match(err.message, /Unable to connect to HotelPro backend server/);
          return true;
        }
      );
    });

    it("triggers timeout error when request exceeds timeoutMs", async () => {
      globalThis.fetch = async (url, options) => {
        return new Promise((resolve, reject) => {
          options.signal.addEventListener("abort", () => {
            const abortErr = new Error("The operation was aborted");
            abortErr.name = "AbortError";
            reject(abortErr);
          });
        });
      };

      await assert.rejects(
        async () => {
          await fetchWithTimeout("/api/slow-endpoint", { timeout: 50 });
        },
        (err) => {
          assert.equal(err.isTimeout, true);
          assert.equal(err.status, 408);
          assert.match(err.message, /Request timed out/);
          return true;
        }
      );
    });
  });

  describe("Booking and Payment Status Integrity", () => {
    it("returns paid booking when payment verification succeeds", async () => {
      globalThis.fetch = async (url) => {
        if (url.includes("/api/bookings") && !url.includes("verify-payment")) {
          return {
            ok: true,
            status: 201,
            json: async () => ({
              booking: { _id: "b_12345", paymentStatus: "Pending", totalPrice: 15000 }
            })
          };
        }
        if (url.includes("verify-payment")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              booking: { _id: "b_12345", paymentStatus: "Paid", totalPrice: 15000, transactionId: "tx_999" }
            })
          };
        }
      };

      const result = await api.createBooking({ roomId: "r1", nights: 2 });
      assert.equal(result._id, "b_12345");
      assert.equal(result.paymentStatus, "Paid");
      assert.equal(result.transactionId, "tx_999");
    });

    it("never presents failed payment as paid; preserves 'Pending' status and attaches paymentError", async () => {
      globalThis.fetch = async (url) => {
        if (url.includes("/api/bookings") && !url.includes("verify-payment")) {
          return {
            ok: true,
            status: 201,
            json: async () => ({
              booking: { _id: "b_67890", paymentStatus: "Pending", totalPrice: 22000 }
            })
          };
        }
        if (url.includes("verify-payment")) {
          return {
            ok: false,
            status: 400,
            json: async () => ({
              message: "Payment gateway card validation declined by issuer"
            })
          };
        }
      };

      const result = await api.createBooking({ roomId: "r2", nights: 3 });
      assert.equal(result._id, "b_67890");
      assert.equal(result.paymentStatus, "Pending");
      assert.match(result.paymentError, /Payment gateway card validation declined/);
    });
  });

  describe("Provider Status & Mock Fallback Governance", () => {
    it("returns offline mode without silent mock fabrication when backend fails in production mode", async () => {
      globalThis.fetch = async () => {
        throw new TypeError("Failed to fetch");
      };

      const status = await api.getProviderStatus();
      assert.equal(status.mode, "offline");
      assert.equal(status.isConfigured, false);
      assert.equal(status.isLiveIntegrated, false);
      assert.match(status.error, /unreachable/);
    });

    it("returns empty suggestions gracefully for autocomplete failure without throwing", async () => {
      globalThis.fetch = async () => {
        throw new TypeError("Failed to fetch");
      };

      const suggestions = await api.getAutocomplete("Mumbai");
      assert.deepEqual(suggestions, []);
    });
  });
});
