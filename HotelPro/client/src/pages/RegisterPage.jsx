import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  LinearProgress
} from "@mui/material";
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Star
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotify } from "../context/NotificationContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register } = useAuth();
  const { notify } = useNotify();
  const navigate = useNavigate();

  // Password strength calculation
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "None", color: "#8A9BAE" };
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 10) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 25;

    if (score <= 25) return { score: 25, label: "Weak", color: "#B83D3D" };
    if (score <= 50) return { score: 50, label: "Fair", color: "#B77924" };
    if (score <= 75) return { score: 75, label: "Good", color: "#2B5C6E" };
    return { score: 100, label: "Strong & Secure", color: "#287A55" };
  };

  const strength = calculatePasswordStrength(formData.password);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name.trim()) {
      setErrorMsg("Please provide your full legal name.");
      return;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMsg("Please provide a valid email address.");
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg("Password must contain at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify both fields.");
      return;
    }
    if (!termsAccepted || !privacyAccepted) {
      setErrorMsg("Please review and accept our Terms of Service and Privacy Policy.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      notify("Welcome to HotelPro! Your account has been created successfully.", "success");
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.message || "Failed to register account. Please try again.");
    } finally {
      setSubmitting(false);
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
        pt: "70px"
      }}
    >
      {/* ── LEFT SHOWCASE PANEL (Desktop) ── */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          flex: "1 1 45%",
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
            backgroundImage: "url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1800&q=90')",
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
                Private Guest Atelier
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Center Benefits */}
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
              Member Privileges
            </Typography>
          </Box>

          <Typography
            variant="h3"
            sx={{
              color: "#FAF8F3",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: { lg: "2.1rem", xl: "2.6rem" },
              fontWeight: 400,
              lineHeight: 1.25,
              mb: 3
            }}
          >
            Create your account to unlock private sanctuary suites.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {[
              { title: "Direct Reservation Management", desc: "Modify dates, review flexible cancellation windows, and download tax invoices anytime." },
              { title: "Curated Royal Welcome", desc: "Complimentary breakfast, heritage palace tours, and customized dining preparations." },
              { title: "High-Priority Concierge", desc: "24/7 dedicated support desk with live operational tracking and seamless room service." }
            ].map((b, i) => (
              <Box key={i} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(212,175,107,0.15)",
                    border: "1px solid #D4AF6B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#D4AF6B",
                    flexShrink: 0
                  }}
                >
                  <CheckCircle2 size={16} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: "#FAF8F3", fontWeight: 600 }}>
                    {b.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.6)", lineHeight: 1.5, display: "block" }}>
                    {b.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bottom Security Note */}
        <Box sx={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <ShieldCheck size={16} color="#D4AF6B" />
          <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.6)" }}>
            Zero spam promise. Your data is encrypted and strictly protected.
          </Typography>
        </Box>
      </Box>

      {/* ── RIGHT REGISTRATION FORM PANEL ── */}
      <Box
        sx={{
          flex: "1 1 55%",
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
            maxWidth: 540,
            background: "#0A1628",
            border: "1px solid rgba(212,175,107,0.22)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            borderRadius: 1
          }}
        >
          <CardContent sx={{ p: { xs: 3.5, sm: 5 } }}>
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
                Create Sanctuary Account
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.6)" }}>
                Begin your journey across India's most extraordinary heritage properties.
              </Typography>
            </Box>

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 0, fontSize: "0.8125rem" }}>
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                required
                label="Full Name"
                placeholder="e.g. Maharaja Vikramaditya"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={18} color="#D4AF6B" />
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

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email Address"
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} color="#D4AF6B" />
                      </InputAdornment>
                    )
                  }}
                  sx={{
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
                  type="tel"
                  label="Mobile Number"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone size={18} color="#D4AF6B" />
                      </InputAdornment>
                    )
                  }}
                  sx={{
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
              </Box>

              <TextField
                fullWidth
                required
                type={showPassword ? "text" : "password"}
                label="Security Password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
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
                  mb: 1,
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <Box sx={{ mb: 2, px: 0.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.6)", fontSize: "0.7rem" }}>
                      Password Strength:
                    </Typography>
                    <Typography variant="caption" sx={{ color: strength.color, fontWeight: 700, fontSize: "0.7rem" }}>
                      {strength.label}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={strength.score}
                    sx={{
                      height: 5,
                      borderRadius: 1,
                      backgroundColor: "rgba(255,255,255,0.08)",
                      "& .MuiLinearProgress-bar": { backgroundColor: strength.color }
                    }}
                  />
                </Box>
              )}

              <TextField
                fullWidth
                required
                type={showPassword ? "text" : "password"}
                label="Confirm Password"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={18} color="#D4AF6B" />
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

              {/* Terms and Privacy Checkboxes */}
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      size="small"
                      sx={{ color: "rgba(212,175,107,0.4)", "&.Mui-checked": { color: "#D4AF6B" } }}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.7)" }}>
                      I agree to the HotelPro Terms of Service and Reservation Guidelines.
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      size="small"
                      sx={{ color: "rgba(212,175,107,0.4)", "&.Mui-checked": { color: "#D4AF6B" } }}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ color: "rgba(240,237,230,0.7)" }}>
                      I accept the Privacy Policy regarding guest authentication &amp; data retention.
                    </Typography>
                  }
                />
              </Box>

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
                {submitting ? <CircularProgress size={22} color="inherit" /> : "Complete Registration & Verify"}
              </Button>
            </form>

            <Box sx={{ mt: 3, pt: 2.5, borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.6)" }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#D4AF6B",
                    textDecoration: "none",
                    fontWeight: 600
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
