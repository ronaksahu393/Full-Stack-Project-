import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from "@mui/material";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  UserCheck,
  Eye,
  EyeOff,
  Sparkles,
  Star,
  CheckCircle2,
  Compass,
  KeyRound,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotify } from "../context/NotificationContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState(0); // 0: Customer, 1: Staff, 2: Administrator

  const { login } = useAuth();
  const { notify } = useNotify();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  // Restore saved email if rememberMe was active
  useEffect(() => {
    const savedEmail = localStorage.getItem("hotelpro_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setErrorMsg("");
    if (newValue === 1) {
      // Staff pre-fill helper
      setEmail("staff@hotelpro.com");
      setPassword("Staff@123");
    } else if (newValue === 2) {
      // Admin pre-fill helper
      setEmail("admin@hotelpro.com");
      setPassword("Admin@123");
    } else {
      // Customer
      const savedEmail = localStorage.getItem("hotelpro_remember_email");
      setEmail(savedEmail || "");
      setPassword("");
    }
  };

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your account password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email, password, rememberMe);
      notify(`Welcome back, ${res.user.name}.`, "success");

      // Redirect strictly based on verified backend role
      const verifiedRole = res.user.role;
      if (from && verifiedRole !== "admin" && verifiedRole !== "staff") {
        navigate(from, { replace: true });
      } else if (verifiedRole === "admin") {
        navigate("/admin-portal", { replace: true });
      } else if (verifiedRole === "staff") {
        navigate("/staff-portal", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setSubmitting(false);
    }
  };

  // Continue as Guest: directs to destination or explore stays
  const handleContinueAsGuest = () => {
    notify("Continuing as guest. You can explore our sanctuaries and reserve suites anytime.", "info");
    if (from) {
      navigate(from, { replace: true });
    } else {
      navigate("/explore", { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#071020",
        display: "flex",
        alignItems: "stretch",
        position: "relative",
        pt: "70px" // navbar offset
      }}
    >
      {/* ── LEFT SHOWCASE PANEL (Desktop) ── */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          flex: "1 1 50%",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "space-between",
          p: { lg: 6, xl: 8 },
          background: "#0A1628"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1800&q=90')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.35) saturate(1.15)"
          }}
        />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(7,16,32,0.92) 0%, rgba(10,22,40,0.6) 60%, rgba(7,16,32,0.95) 100%)"
          }}
        />

        {/* Top Branding */}
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                background: "linear-gradient(135deg, #173F35 0%, #0A1628 100%)",
                border: "1.5px solid #D4AF6B",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#D4AF6B",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.5rem",
                fontWeight: 700
              }}
            >
              H
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "#FAF8F3",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "1.35rem",
                  letterSpacing: "0.08em"
                }}
              >
                AtithiGo
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#D4AF6B",
                  fontSize: "0.65rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase"
                }}
              >
                Sanctuaries &amp; Heritage Estates
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Center Quote */}
        <Box sx={{ position: "relative", zIndex: 2, my: 6 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.5,
              mb: 3,
              background: "rgba(212,175,107,0.1)",
              border: "1px solid rgba(212,175,107,0.3)",
              borderRadius: "20px"
            }}
          >
            <Sparkles size={13} color="#D4AF6B" />
            <Typography variant="caption" sx={{ color: "#D4AF6B", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
              Privileged Hospitality
            </Typography>
          </Box>

          <Typography
            variant="h3"
            sx={{
              color: "#FAF8F3",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: { lg: "2.2rem", xl: "2.75rem" },
              fontWeight: 400,
              lineHeight: 1.25,
              mb: 2.5
            }}
          >
            "A seamless gateway to the world's most distinguished sanctuaries."
          </Typography>

          <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.6)", maxWidth: "480px", lineHeight: 1.7 }}>
            Experience verified reservations, concierge assistance, bespoke royal retreats, and personalized itineraries curated across India's finest destinations.
          </Typography>

          {/* Social Proof */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 4 }}>
            <Box>
              <Box sx={{ display: "flex", gap: 0.5, color: "#D4AF6B", mb: 0.5 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#D4AF6B" />
                ))}
              </Box>
              <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.7)" }}>
                4.97 / 5.0 Global Member Rating
              </Typography>
            </Box>
            <Box sx={{ width: "1px", height: "30px", background: "rgba(212,175,107,0.25)" }} />
            <Box>
              <Typography variant="subtitle2" sx={{ color: "#FAF8F3", fontWeight: 700 }}>
                100% Verified
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.7)" }}>
                Audited Properties &amp; Security
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Bottom Feature Badges */}
        <Box sx={{ position: "relative", zIndex: 2, display: "flex", gap: 3 }}>
          {[
            { icon: <ShieldCheck size={16} color="#D4AF6B" />, text: "256-Bit SSL Encryption" },
            { icon: <CheckCircle2 size={16} color="#D4AF6B" />, text: "Instant Confirmation" },
            { icon: <UserCheck size={16} color="#D4AF6B" />, text: "Dedicated Concierge" }
          ].map((item, idx) => (
            <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {item.icon}
              <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.6)", fontSize: "0.75rem" }}>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── RIGHT SIGN-IN FORM PANEL ── */}
      <Box
        sx={{
          flex: "1 1 50%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 3, sm: 6, lg: 8 },
          background: "#071020"
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 500,
            background: "#0A1628",
            border: "1px solid rgba(212,175,107,0.22)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            borderRadius: 1
          }}
        >
          <CardContent sx={{ p: { xs: 3.5, sm: 5 } }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  color: "#FAF8F3",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 600,
                  fontSize: { xs: "1.75rem", sm: "2rem" },
                  mb: 0.5
                }}
              >
                Sign In to Sanctuary
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.6)" }}>
                Access your bookings, personal concierge, and estate operations.
              </Typography>
            </Box>

            {/* Role Access Navigation Tabs */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                mb: 3,
                minHeight: 40,
                borderBottom: "1px solid rgba(212,175,107,0.15)",
                "& .MuiTab-root": {
                  color: "rgba(240,237,230,0.6)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "none",
                  minHeight: 40,
                  "&.Mui-selected": { color: "#D4AF6B" }
                },
                "& .MuiTabs-indicator": { backgroundColor: "#D4AF6B" }
              }}
            >
              <Tab label="Customer / Guest" />
              <Tab label="Staff Portal" />
              <Tab label="Administrator" />
            </Tabs>

            {/* Error Message Alert */}
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 0, fontSize: "0.8125rem" }}>
                {errorMsg}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSignIn}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email Address or Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} color="#D4AF6B" />
                    </InputAdornment>
                  )
                }}
                sx={{
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.03)",
                    color: "#FAF8F3",
                    "& fieldset": { borderColor: "rgba(212,175,107,0.25)" },
                    "&:hover fieldset": { borderColor: "#D4AF6B" },
                    "&.Mui-focused fieldset": { borderColor: "#D4AF6B" }
                  },
                  "& .MuiInputLabel-root": { color: "rgba(240,237,230,0.6)" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#D4AF6B" }
                }}
              />

              <TextField
                fullWidth
                required
                type={showPassword ? "text" : "password"}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={18} color="#D4AF6B" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "rgba(240,237,230,0.6)" }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.03)",
                    color: "#FAF8F3",
                    "& fieldset": { borderColor: "rgba(212,175,107,0.25)" },
                    "&:hover fieldset": { borderColor: "#D4AF6B" },
                    "&.Mui-focused fieldset": { borderColor: "#D4AF6B" }
                  },
                  "& .MuiInputLabel-root": { color: "rgba(240,237,230,0.6)" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#D4AF6B" }
                }}
              />

              {/* Remember Me and Forgot Password */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{
                        color: "rgba(212,175,107,0.4)",
                        "&.Mui-checked": { color: "#D4AF6B" }
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.7)", fontSize: "0.8125rem" }}>
                      Remember Me
                    </Typography>
                  }
                />

                <Link
                  to="/forgot-password"
                  style={{
                    color: "#D4AF6B",
                    fontSize: "0.8125rem",
                    textDecoration: "none",
                    fontWeight: 500
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>

              {/* Sign In Button */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  py: 1.5,
                  background: "linear-gradient(135deg, #D4AF6B, #B8924A)",
                  color: "#0A1628",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  letterSpacing: "0.08em",
                  "&:hover": { background: "linear-gradient(135deg, #E5C385, #C4A46B)" }
                }}
              >
                {submitting ? <CircularProgress size={22} color="inherit" /> : "Sign In to HotelPro"}
              </Button>
            </form>

            {/* Continue as Guest Button */}
            <Button
              fullWidth
              variant="outlined"
              onClick={handleContinueAsGuest}
              startIcon={<Compass size={16} />}
              sx={{
                mt: 1.5,
                py: 1.25,
                borderColor: "rgba(212,175,107,0.35)",
                color: "#FAF8F3",
                textTransform: "none",
                fontSize: "0.8125rem",
                "&:hover": { borderColor: "#D4AF6B", backgroundColor: "rgba(212,175,107,0.06)" }
              }}
            >
              Continue as Guest (Explore Sanctuaries)
            </Button>

            {/* Bottom Register Prompt */}
            <Box sx={{ mt: 3, pt: 2.5, borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.6)" }}>
                New to HotelPro Sanctuaries?{" "}
                <Link
                  to="/register"
                  style={{
                    color: "#D4AF6B",
                    textDecoration: "none",
                    fontWeight: 600
                  }}
                >
                  Create Atelier Account
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
