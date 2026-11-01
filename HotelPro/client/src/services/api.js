const API_BASE = "/api";

const LS_USER_KEY = "hotelpro_user_session";
const LS_TOKEN_KEY = "hotelpro_jwt_token";

// Development Mock Gate: Mock fallbacks are only allowed when explicitly enabled in dev mode
const isDevMockEnabled = Boolean(
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.DEV &&
  import.meta.env.VITE_ENABLE_DEV_MOCKS === "true"
);

const DEFAULT_TIMEOUT_MS = 15000;

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn("Failed to load Razorpay Checkout script");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const getHeaders = (includeAuth = true) => {
  const headers = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem(LS_TOKEN_KEY) : null;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const handleResponse = async (res) => {
  if (res.status === 401) {
    // Session expired or invalid token
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(LS_TOKEN_KEY);
      localStorage.removeItem(LS_USER_KEY);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("hotelpro:unauthorized"));
    }
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || "Your session has expired. Please sign in again.");
    error.status = 401;
    throw error;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    let message = err.message || err.error;

    if (!message || typeof message !== "string") {
      if (res.status === 403) {
        message = "You do not have authorization to perform this action.";
      } else if (res.status === 404) {
        message = "The requested resource was not located.";
      } else if (res.status === 503) {
        message = "HotelPro service is temporarily unavailable. Please try again shortly.";
      } else {
        message = `Request failed with status ${res.status}`;
      }
    } else if (
      message.includes("MongoServerError") ||
      message.includes("Cast to ObjectId") ||
      message.includes("SyntaxError") ||
      message.includes("TypeError") ||
      message.includes("at ") ||
      message.includes("node_modules")
    ) {
      // Prevent leaking backend stack traces or internal database errors to the user
      message = "A server processing error occurred. Please try again or contact concierge support.";
    }

    const error = new Error(message);
    error.status = res.status;
    if (err.code) error.code = err.code;
    throw error;
  }

  return res.json();
};

export const fetchWithTimeout = async (url, options = {}) => {
  const { timeout = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    return response;
  } catch (err) {
    if (err.name === "AbortError") {
      const timeoutErr = new Error("Request timed out. The server took too long to respond.");
      timeoutErr.status = 408;
      timeoutErr.isTimeout = true;
      throw timeoutErr;
    }
    if (
      err.message &&
      (err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError") ||
        err.message.includes("Load failed") ||
        err.message.includes("fetch failed"))
    ) {
      const netErr = new Error("Unable to connect to HotelPro backend server. Please verify your network connection.");
      netErr.isNetworkError = true;
      throw netErr;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const api = {
  // --- AUTHENTICATION & IDENTITY ---
  async login(email, password, rememberMe = false) {
    const res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email: email.trim(), password, rememberMe })
    });
    const data = await handleResponse(res);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LS_TOKEN_KEY, data.token);
      localStorage.setItem(LS_USER_KEY, JSON.stringify(data.user));
      if (rememberMe) {
        localStorage.setItem("hotelpro_remember_email", email.trim());
      } else {
        localStorage.removeItem("hotelpro_remember_email");
      }
    }
    return data;
  },

  async register(userData) {
    const res = await fetchWithTimeout(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({
        name: userData.name.trim(),
        email: userData.email.trim(),
        password: userData.password,
        phone: userData.phone ? userData.phone.trim() : ""
      })
    });
    const data = await handleResponse(res);
    if (data.token && typeof localStorage !== "undefined") {
      localStorage.setItem(LS_TOKEN_KEY, data.token);
      localStorage.setItem(LS_USER_KEY, JSON.stringify(data.user));
    }
    return data;
  },

  async verifyEmail(email, otp) {
    const res = await fetchWithTimeout(`${API_BASE}/auth/verify-email`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
    });
    const data = await handleResponse(res);
    if (data.token && typeof localStorage !== "undefined") {
      localStorage.setItem(LS_TOKEN_KEY, data.token);
      localStorage.setItem(LS_USER_KEY, JSON.stringify(data.user));
    }
    return data;
  },

  async resendVerificationOtp(email) {
    const res = await fetchWithTimeout(`${API_BASE}/auth/resend-verification-otp`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email: email.trim() })
    });
    return await handleResponse(res);
  },

  async forgotPassword(email) {
    const res = await fetchWithTimeout(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email: email.trim() })
    });
    return await handleResponse(res);
  },

  async verifyResetOtp(email, otp) {
    const res = await fetchWithTimeout(`${API_BASE}/auth/verify-reset-otp`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
    });
    return await handleResponse(res);
  },

  async resetPassword(email, otp, newPassword) {
    const body = { email: email.trim(), newPassword };
    if (otp) body.otp = otp.trim();
    const res = await fetchWithTimeout(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify(body)
    });
    return await handleResponse(res);
  },

  async socialLogin(provider, socialToken, profile) {
    const res = await fetchWithTimeout(`${API_BASE}/auth/social-login`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ provider, socialToken, profile })
    });
    const data = await handleResponse(res);
    if (data.token && typeof localStorage !== "undefined") {
      localStorage.setItem(LS_TOKEN_KEY, data.token);
      localStorage.setItem(LS_USER_KEY, JSON.stringify(data.user));
    }
    return data;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetchWithTimeout(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return await handleResponse(res);
  },

  async getMe() {
    const res = await fetchWithTimeout(`${API_BASE}/auth/me`, {
      headers: getHeaders(true)
    });
    const data = await handleResponse(res);
    if (data.user && typeof localStorage !== "undefined") {
      localStorage.setItem(LS_USER_KEY, JSON.stringify(data.user));
    }
    return data.user;
  },

  async updateProfile(profileData) {
    const res = await fetchWithTimeout(`${API_BASE}/auth/profile`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(profileData)
    });
    const data = await handleResponse(res);
    if (data.user && typeof localStorage !== "undefined") {
      localStorage.setItem(LS_USER_KEY, JSON.stringify(data.user));
    }
    return data.user;
  },

  getCurrentUser() {
    if (typeof localStorage === "undefined") return null;
    const userStr = localStorage.getItem(LS_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken() {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(LS_TOKEN_KEY);
  },

  async logout() {
    try {
      await fetchWithTimeout(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: getHeaders(true)
      });
    } catch (e) {
      // Continue client cleanup even if network fails
    }
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(LS_TOKEN_KEY);
      localStorage.removeItem(LS_USER_KEY);
    }
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("hotelpro:unauthorized"));
    }
  },


  // --- ROOMS ---
  async getRooms(params = {}) {
    const cleanParams = {};
    if (params.search) cleanParams.search = params.search;
    if (params.category && params.category !== "All") cleanParams.category = params.category;
    if (params.minPrice) cleanParams.minPrice = params.minPrice;
    if (params.maxPrice) cleanParams.maxPrice = params.maxPrice;
    if (params.guests) cleanParams.guests = params.guests;
    if (params.featured) cleanParams.featured = params.featured;
    if (params.sort) cleanParams.sort = params.sort;

    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetchWithTimeout(`${API_BASE}/rooms${query ? `?${query}` : ""}`);
    const data = await handleResponse(res);
    return data.rooms || [];
  },

  async getRoomById(id) {
    const res = await fetchWithTimeout(`${API_BASE}/rooms/${id}`);
    const data = await handleResponse(res);
    return data.room;
  },

  async createRoom(roomData) {
    const res = await fetchWithTimeout(`${API_BASE}/rooms`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(roomData)
    });
    const data = await handleResponse(res);
    return data.room;
  },

  async updateRoom(id, roomData) {
    const res = await fetchWithTimeout(`${API_BASE}/rooms/${id}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(roomData)
    });
    const data = await handleResponse(res);
    return data.room;
  },

  async deleteRoom(id) {
    const res = await fetchWithTimeout(`${API_BASE}/rooms/${id}`, {
      method: "DELETE",
      headers: getHeaders(true)
    });
    await handleResponse(res);
    return true;
  },

  // --- BOOKINGS ---
  async createBooking(bookingData, options = {}) {
    // 1. Submit reservation to backend (backend computes price, validates capacity & date collision)
    const res = await fetchWithTimeout(`${API_BASE}/bookings`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(bookingData)
    });
    const data = await handleResponse(res);
    const createdBooking = data.booking;

    // If caller requests raw created booking (e.g. to initiate Razorpay checkout modal)
    if (options.skipVerify) {
      return createdBooking;
    }

    // 2. Process and verify payment settlement with backend
    try {
      const paymentRes = await fetchWithTimeout(`${API_BASE}/bookings/${createdBooking._id}/verify-payment`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          paymentMethod: "Demo_Simulated",
          simulatedToken: `sim_token_${Date.now()}`
        })
      });
      const paymentData = await handleResponse(paymentRes);
      return paymentData.booking || createdBooking;
    } catch (payErr) {
      console.warn("Payment verification incomplete:", payErr.message);
      // Retain explicit pending status and attach paymentError details so UI can inform the user
      return {
        ...createdBooking,
        paymentStatus: "Pending",
        paymentError: payErr.message || "Payment verification incomplete"
      };
    }
  },

  async createRazorpayOrder(bookingId) {
    const res = await fetchWithTimeout(`${API_BASE}/bookings/${bookingId}/create-razorpay-order`, {
      method: "POST",
      headers: getHeaders(true)
    });
    return await handleResponse(res);
  },

  async verifyPayment(bookingId, paymentPayload) {
    const res = await fetchWithTimeout(`${API_BASE}/bookings/${bookingId}/verify-payment`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(paymentPayload)
    });
    return await handleResponse(res);
  },

  async getPaymentGatewayTelemetry() {
    const res = await fetchWithTimeout(`${API_BASE}/bookings/payment-telemetry`);
    return await handleResponse(res);
  },

  async getMyBookings() {
    const res = await fetchWithTimeout(`${API_BASE}/bookings/my`, {
      headers: getHeaders(true)
    });
    const data = await handleResponse(res);
    return data.bookings || [];
  },

  async getAllBookings() {
    const res = await fetchWithTimeout(`${API_BASE}/bookings`, {
      headers: getHeaders(true)
    });
    const data = await handleResponse(res);
    return data.bookings || [];
  },

  async cancelBooking(id) {
    const res = await fetchWithTimeout(`${API_BASE}/bookings/${id}/cancel`, {
      method: "PUT",
      headers: getHeaders(true)
    });
    const data = await handleResponse(res);
    return data.booking;
  },

  async updateBookingStatus(id, status) {
    const res = await fetchWithTimeout(`${API_BASE}/bookings/${id}/status`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify({ status })
    });
    const data = await handleResponse(res);
    return data.booking;
  },

  // --- STAFF OPERATIONS ---
  async getStaffOverview() {
    const res = await fetchWithTimeout(`${API_BASE}/staff/overview`, {
      headers: getHeaders(true)
    });
    return await handleResponse(res);
  },

  async updateCleaningStatus(roomId, cleaningStatus) {
    const res = await fetchWithTimeout(`${API_BASE}/staff/rooms/${roomId}/cleaning`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify({ cleaningStatus })
    });
    return await handleResponse(res);
  },

  async getStaffTasks() {
    const res = await fetchWithTimeout(`${API_BASE}/staff/tasks`, {
      headers: getHeaders(true)
    });
    return await handleResponse(res);
  },

  async updateTaskStatus(taskId, status, note = "") {
    const res = await fetchWithTimeout(`${API_BASE}/staff/tasks/${taskId}/status`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify({ status, note })
    });
    return await handleResponse(res);
  },

  async recordStaffCheckIn(bookingId) {
    const res = await fetchWithTimeout(`${API_BASE}/staff/bookings/${bookingId}/check-in`, {
      method: "PUT",
      headers: getHeaders(true)
    });
    return await handleResponse(res);
  },

  async recordStaffCheckOut(bookingId) {
    const res = await fetchWithTimeout(`${API_BASE}/staff/bookings/${bookingId}/check-out`, {
      method: "PUT",
      headers: getHeaders(true)
    });
    return await handleResponse(res);
  },


  // --- INDIA-WIDE HOTEL DISCOVERY ---
  async getProviderStatus() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/hotels/provider-status`);
      return await handleResponse(res);
    } catch (err) {
      if (isDevMockEnabled) {
        return {
          mode: "demo",
          providerName: "HotelPro_Dev_Mock",
          isConfigured: true,
          isLiveIntegrated: false,
          isDevMock: true
        };
      }
      return {
        mode: "offline",
        providerName: "Unavailable",
        isConfigured: false,
        isLiveIntegrated: false,
        error: "Backend hotel discovery service is unreachable."
      };
    }
  },

  async searchHotels(params = {}) {
    const cleanParams = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== "" && val !== "All") {
        cleanParams[key] = val;
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetchWithTimeout(`${API_BASE}/hotels/search${query ? `?${query}` : ""}`);
    return await handleResponse(res);
  },

  async getAutocomplete(query) {
    if (!query || !query.trim()) return [];
    try {
      const res = await fetchWithTimeout(`${API_BASE}/hotels/autocomplete?q=${encodeURIComponent(query.trim())}`, {
        timeout: 5000
      });
      const data = await handleResponse(res);
      return data.suggestions || [];
    } catch (err) {
      return [];
    }
  },

  async getHotelById(id, dates = {}) {
    const params = new URLSearchParams();
    if (dates.checkIn) params.append("checkIn", dates.checkIn);
    if (dates.checkOut) params.append("checkOut", dates.checkOut);
    const query = params.toString();
    const res = await fetchWithTimeout(`${API_BASE}/hotels/${id}${query ? `?${query}` : ""}`);
    return await handleResponse(res);
  },

  async getFeaturedHotels() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/hotels/featured`);
      const data = await handleResponse(res);
      return data.hotels || [];
    } catch (err) {
      if (isDevMockEnabled) {
        return [
          {
            _id: "dev_mock_featured_1",
            slug: "dev-heritage-retreat",
            name: "Dev Mock Heritage Palace",
            propertyCategory: "Heritage Palace",
            starClassification: 5,
            startingPrice: 18000,
            address: { city: "Jaipur", state: "Rajasthan" },
            isDemo: true,
            isDevMock: true
          }
        ];
      }
      throw err;
    }
  },

  async getDestinations() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/hotels/destinations`);
      const data = await handleResponse(res);
      return data.destinations || [];
    } catch (err) {
      if (isDevMockEnabled) {
        return [
          { name: "Jaipur", state: "Rajasthan", isDevMock: true },
          { name: "Goa", state: "Goa", isDevMock: true }
        ];
      }
      throw err;
    }
  },

  // --- ADMIN HOTEL MANAGEMENT ---
  async getAdminHotels() {
    const res = await fetchWithTimeout(`${API_BASE}/admin/hotels`, {
      headers: getHeaders(true)
    });
    return await handleResponse(res);
  },

  async createAdminHotel(hotelData) {
    const res = await fetchWithTimeout(`${API_BASE}/admin/hotels`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(hotelData)
    });
    return await handleResponse(res);
  },

  async updateAdminHotel(id, hotelData) {
    const res = await fetchWithTimeout(`${API_BASE}/admin/hotels/${id}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(hotelData)
    });
    return await handleResponse(res);
  },

  async addAdminHotelRoom(hotelId, roomData) {
    const res = await fetchWithTimeout(`${API_BASE}/admin/hotels/${hotelId}/rooms`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(roomData)
    });
    return await handleResponse(res);
  },

  // --- ADMIN TELEMETRY & MANAGEMENT ---
  async getAdminMetrics() {
    const res = await fetchWithTimeout(`${API_BASE}/admin/metrics`, {
      headers: getHeaders(true)
    });
    return await handleResponse(res);
  },

  async getAllUsers() {
    const res = await fetchWithTimeout(`${API_BASE}/admin/users`, {
      headers: getHeaders(true)
    });
    return await handleResponse(res);
  },

  async updateUserRole(userId, role) {
    const res = await fetchWithTimeout(`${API_BASE}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify({ role })
    });
    return await handleResponse(res);
  },

  async updateUserStatus(userId, status) {
    const res = await fetchWithTimeout(`${API_BASE}/admin/users/${userId}/status`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify({ status })
    });
    return await handleResponse(res);
  },

  async deleteUser(userId) {
    const res = await fetchWithTimeout(`${API_BASE}/admin/users/${userId}`, {
      method: "DELETE",
      headers: getHeaders(true)
    });
    return await handleResponse(res);
  },

  async createStaffAccount(staffData) {
    const res = await fetchWithTimeout(`${API_BASE}/admin/staff`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(staffData)
    });
    return await handleResponse(res);
  },

  async getAllStaff() {
    const res = await fetchWithTimeout(`${API_BASE}/admin/staff`, {
      headers: getHeaders(true)
    });
    return await handleResponse(res);
  },

  async createAdminTask(taskData) {
    const res = await fetchWithTimeout(`${API_BASE}/admin/tasks`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(taskData)
    });
    return await handleResponse(res);
  },

  async getAllAdminTasks() {
    const res = await fetchWithTimeout(`${API_BASE}/admin/tasks`, {
      headers: getHeaders(true)
    });
    return await handleResponse(res);
  },

  async getAllAdminBookings() {
    const res = await fetchWithTimeout(`${API_BASE}/admin/bookings`, {
      headers: getHeaders(true)
    });
    return await handleResponse(res);
  }
};
