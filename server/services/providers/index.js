const DemoHotelProvider = require("./demoProvider");
const LiveHotelProviderInterface = require("./liveProviderInterface");

let activeProvider = null;
let currentMode = null;

/**
 * Returns the configured hotel inventory provider.
 * Enforces explicit separation between Demo and Live modes:
 * - When HOTEL_INVENTORY_PROVIDER=live, returns the live provider adapter.
 * - NEVER silently falls back to demo data under a live configuration.
 */
function getHotelProvider() {
  const configuredMode = (process.env.HOTEL_INVENTORY_PROVIDER || "demo").toLowerCase().trim();

  // Re-instantiate if configuration mode changed dynamically
  if (activeProvider && currentMode === configuredMode) {
    return activeProvider;
  }

  currentMode = configuredMode;

  if (configuredMode === "live") {
    activeProvider = new LiveHotelProviderInterface();
  } else {
    activeProvider = new DemoHotelProvider();
  }

  return activeProvider;
}

/**
 * Returns telemetry regarding current provider configuration, mode, and external integration status.
 */
function getProviderStatus() {
  const configuredMode = (process.env.HOTEL_INVENTORY_PROVIDER || "demo").toLowerCase().trim();
  const provider = getHotelProvider();
  const isConfigured = provider.isConfigured ? provider.isConfigured() : true;
  const isLiveIntegrated = provider.isLiveIntegrated ? provider.isLiveIntegrated() : false;

  let message = "";
  if (configuredMode === "live") {
    if (isConfigured) {
      message = "Live hotel inventory provider credentials configured. Upstream provider endpoint integration is awaiting an active partner contract.";
    } else {
      message = "Live hotel inventory mode is enabled, but required external credentials (LIVE_HOTEL_API_KEY) are not configured in backend/.env.";
    }
  } else {
    message = "HotelPro Demonstration Inventory Mode is active (Local curated Indian stays catalog).";
  }

  return {
    mode: configuredMode,
    providerName: provider.name,
    isConfigured,
    isLiveIntegrated,
    message
  };
}

module.exports = {
  getHotelProvider,
  getProviderStatus
};
