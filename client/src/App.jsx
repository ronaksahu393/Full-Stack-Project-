import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { hotelProTheme } from "./theme/theme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

import HomePage from "./pages/HomePage";
import ExploreStaysPage from "./pages/ExploreStaysPage";
import HotelDetailPage from "./pages/HotelDetailPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import GuestDashboard from "./pages/dashboards/GuestDashboard";
import StaffDashboard from "./pages/dashboards/StaffDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A1628" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              background: "linear-gradient(135deg, #D4AF6B, #B8924A)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "#0A1628",
              animation: "float 2s ease-in-out infinite",
              boxShadow: "0 8px 32px rgba(212,175,107,0.4)"
            }}
          >
            A
          </div>
          <div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: "400", color: "#FAF8F3", letterSpacing: "0.08em", marginBottom: "4px" }}>AtithiGo</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6875rem", fontWeight: "400", letterSpacing: "0.22em", textTransform: "uppercase", color: "#8A9BAE" }}>Connecting to Sanctuary...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider theme={hotelProTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <div className="flex flex-col min-h-screen" style={{ background: "#0A1628", color: "#F0EDE6" }}>
              <ScrollToTop />
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ExploreStaysPage />} />
                  <Route path="/hotels/:id" element={<HotelDetailPage />} />
                  <Route path="/rooms/:id" element={<RoomDetailPage />} />
                  <Route path="/checkout/:roomId" element={<CheckoutPage />} />
                  <Route path="/booking/:roomId" element={<CheckoutPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                  {/* Role Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <GuestDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/staff-portal"
                    element={
                      <ProtectedRoute allowedRoles={["staff", "admin"]}>
                        <StaffDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin-portal"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all 404 */}
                  <Route
                    path="*"
                    element={
                      <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "8rem 1.5rem 4rem" }}>
                        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "6rem", fontWeight: "300", color: "#D4AF6B", lineHeight: 1, marginBottom: "0.75rem" }}>404</h1>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(240,237,230,0.4)", marginBottom: "2rem" }}>
                          Page Not Found
                        </p>
                        <Navigate to="/" replace />
                      </div>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
