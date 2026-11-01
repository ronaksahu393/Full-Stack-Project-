/**
 * HotelPro Test Helper Utility
 *
 * Provides automatic environment bootstrapping, health checking, and
 * isolated in-memory test server lifecycle management.
 *
 * Ensures any individual test suite can be executed standalone without
 * requiring a pre-existing server or external database.
 */

const http = require("http");
const path = require("path");

function probeHealth(url, timeoutMs = 800) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = http.request(
        {
          hostname: u.hostname,
          port: u.port || 80,
          path: u.pathname,
          method: "GET",
          timeout: timeoutMs
        },
        (res) => {
          resolve(res.statusCode === 200);
        }
      );
      req.on("error", () => resolve(false));
      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    } catch (e) {
      resolve(false);
    }
  });
}

let ephemeralServer = null;

async function setupTestEnvironment(defaultPort = 5055) {
  // If explicitly instructed via TEST_API_URL, attach to external running server
  if (process.env.TEST_API_URL) {
    const envUrl = process.env.TEST_API_URL;
    const isRunning = await probeHealth(`${envUrl.replace(/\/api\/?$/, "")}/api/health`, 800);
    if (isRunning) {
      return {
        baseUrl: envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`,
        serverUrl: envUrl.replace(/\/api\/?$/, ""),
        isEphemeral: false,
        teardown: async () => {}
      };
    }
  }

  // Otherwise, spin up isolated ephemeral in-memory test server
  process.env.NODE_ENV = "test";
  process.env.DATA_STORE = "memory";
  process.env.ALLOW_IN_MEMORY_DB = "true";
  process.env.HOTEL_INVENTORY_PROVIDER = "demo";
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "hotelpro_isolated_test_secret_32_characters_minimum";
  }
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    process.env.RAZORPAY_WEBHOOK_SECRET = "hotelpro_test_razorpay_webhook_secret_key";
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    process.env.STRIPE_WEBHOOK_SECRET = "hotelpro_test_stripe_webhook_secret_key";
  }

  const { startServer } = require("../server");
  const server = await startServer(defaultPort);
  ephemeralServer = server;

  const serverUrl = `http://127.0.0.1:${defaultPort}`;
  const baseUrl = `${serverUrl}/api`;

  return {
    baseUrl,
    serverUrl,
    isEphemeral: true,
    teardown: async () => {
      if (server) {
        await new Promise((resolve) => server.close(resolve));
        const { closeDataStore } = require("../config/database");
        await closeDataStore();
        ephemeralServer = null;
      }
    }
  };
}

module.exports = {
  probeHealth,
  setupTestEnvironment
};
