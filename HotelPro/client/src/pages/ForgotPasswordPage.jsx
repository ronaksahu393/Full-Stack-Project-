import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Container
} from "@mui/material";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff
} from "lucide-react";
import { api } from "../services/api";
import { useNotify } from "../context/NotificationContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { notify } = useNotify();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg("Please provide your registered email address.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify both fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.resetPassword(email, null, newPassword);
      notify("Password reset successfully! Please sign in with your new credentials.", "success");
      setSuccessMsg(res.message || "Password updated! Redirecting to sign in...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update password. Please check your email and retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#071020",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pt: "90px",
        pb: 8,
        px: 2
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            background: "#0A1628",
            border: "1px solid rgba(212,175,107,0.25)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            borderRadius: 1,
            overflow: "hidden"
          }}
        >
          {/* Top Brand Banner */}
          <Box
            sx={{
              p: 3,
              background: "linear-gradient(135deg, rgba(23,63,53,0.6) 0%, rgba(10,22,40,0.9) 100%)",
              borderBottom: "1px solid rgba(212,175,107,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 2
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                background: "linear-gradient(135deg, #D4AF6B, #9E8047)",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0A1628",
                fontWeight: 700
              }}
            >
              <KeyRound size={22} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "#FAF8F3",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 600,
                  letterSpacing: "0.02em"
                }}
              >
                Reset Password
              </Typography>
              <Typography variant="caption" sx={{ color: "#D4AF6B", letterSpacing: "0.08em" }}>
                DIRECT ACCOUNT RECOVERY
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.7)", mb: 3 }}>
              Enter your registered email and your new desired password to easily update your credentials.
            </Typography>

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 0, fontSize: "0.875rem" }}>
                {errorMsg}
              </Alert>
            )}

            {successMsg && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 0, fontSize: "0.875rem" }}>
                {successMsg}
              </Alert>
            )}

            <form onSubmit={handleResetPassword}>
              <TextField
                fullWidth
                required
                type="email"
                label="Registered Email Address"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                    "& fieldset": { borderColor: "rgba(212,175,107,0.3)" },
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
                label="New Password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={18} color="#D4AF6B" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        sx={{ color: "rgba(240,237,230,0.6)" }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.03)",
                    color: "#FAF8F3",
                    "& fieldset": { borderColor: "rgba(212,175,107,0.3)" },
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
                label="Confirm New Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ShieldCheck size={18} color="#D4AF6B" />
                    </InputAdornment>
                  )
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.03)",
                    color: "#FAF8F3",
                    "& fieldset": { borderColor: "rgba(212,175,107,0.3)" },
                    "&:hover fieldset": { borderColor: "#D4AF6B" },
                    "&.Mui-focused fieldset": { borderColor: "#D4AF6B" }
                  },
                  "& .MuiInputLabel-root": { color: "rgba(240,237,230,0.6)" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#D4AF6B" }
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
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
                {loading ? <CircularProgress size={22} color="inherit" /> : "Update Password"}
              </Button>
            </form>

            <Box sx={{ mt: 3, pt: 2.5, borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "rgba(240,237,230,0.6)" }}>
                Remember your password?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#D4AF6B",
                    textDecoration: "none",
                    fontWeight: 600
                  }}
                >
                  Return to Sign In
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
