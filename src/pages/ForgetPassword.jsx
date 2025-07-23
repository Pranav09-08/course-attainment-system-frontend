

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Email as EmailIcon,
  Key as KeyIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import axios from "axios";

const glassTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4a80f0",
    },
    secondary: {
      main: "#ff6b6b",
    },
    background: {
      default: "#121212",
      paper: "rgba(30, 30, 30, 0.8)",
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
});

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("https://teacher-attainment-system-backend.onrender.com/auth/send-otp", { email });
      setMessage(res.data.message);
      setSeverity("success");
      setOtpSent(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP";
      setMessage(msg);
      setSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setSeverity("error");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("https://teacher-attainment-system-backend.onrender.com/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      setMessage(res.data.message);
      setSeverity("success");
      setOtpSent(false);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password";
      setMessage(msg);
      setSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={glassTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        }}
      >
        <Container maxWidth="sm">
          <Box
            sx={{
              borderRadius: "16px",
              padding: 4,
              backdropFilter: "blur(16px)",
              backgroundColor: "rgba(30, 30, 45, 0.7)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 4,
              }}
            >
              <LockIcon
                sx={{
                  fontSize: 48,
                  color: "#4a80f0",
                  mb: 2,
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700, color: "white" }}>
                Reset Password
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)", mt: 1 }}>
                {otpSent ? "Enter OTP and new password" : "Enter your email to receive OTP"}
              </Typography>
            </Box>

            {message && (
              <Alert
                severity={severity}
                sx={{
                  mb: 3,
                  backgroundColor:
                    severity === "error" ? "rgba(255, 80, 80, 0.2)" : "rgba(70, 200, 70, 0.2)",
                  borderLeft: `4px solid ${severity === "error" ? "#ff6b6b" : "#4CAF50"}`,
                }}
              >
                {message}
              </Alert>
            )}

            <Box component="form" onSubmit={otpSent ? handleResetPassword : handleSendOTP}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                margin="normal"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
                    </InputAdornment>
                  ),
                }}
                disabled={otpSent}
                sx={{ mb: 2 }}
              />

              {otpSent && (
                <>
                  <TextField
                    fullWidth
                    label="OTP"
                    type="text"
                    required
                    margin="normal"
                    variant="outlined"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? "text" : "password"}
                    required
                    margin="normal"
                    variant="outlined"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirm ? "text" : "password"}
                    required
                    margin="normal"
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOpenIcon sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirm(!showConfirm)}
                            edge="end"
                            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                          >
                            {showConfirm ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />
                </>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                sx={{
                  py: 1.5,
                  background: "linear-gradient(45deg, #4a80f0, #6a5acd)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #3a70e0, #5a4abd)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : otpSent ? (
                  "Reset Password"
                ) : (
                  "Send OTP"
                )}
              </Button>

              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Link
                  to="/login"
                  style={{
                    color: "#4a80f0",
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Back to Login
                </Link>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ResetPassword;