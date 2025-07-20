import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Tooltip,
  Alert,
  Collapse,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Key as KeyIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Send as SendIcon,
  RestartAlt as ResetIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";

// Styled container
const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#20232a",
  borderRadius: "16px",
  padding: theme.spacing(5),
  maxWidth: 600,
  margin: "80px auto",
  color: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
}));

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
      setMessage("❌ Passwords do not match");
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
    <Container>
      <StyledBox>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Forgot / Reset Password
        </Typography>
        <Typography variant="body1" sx={{ color: "#ccc", mb: 3 }}>
          {otpSent
            ? "Enter OTP and your new password below."
            : "Enter your registered email to receive an OTP."}
        </Typography>

        <form onSubmit={otpSent ? handleResetPassword : handleSendOTP}>
          {/* Email */}
          <Tooltip title="Faculty registered email" placement="top-start" arrow>
            <TextField
              fullWidth
              label="Email"
              type="email"
              required
              margin="normal"
              variant="filled"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#ccc" }} />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ style: { color: "#aaa" } }}
              sx={{
                backgroundColor: "#2c2f36",
                borderRadius: 1,
                input: { color: "#fff" },
              }}
              disabled={otpSent}
            />
          </Tooltip>

          {/* OTP */}
          {otpSent && (
            <Tooltip title="OTP sent to your email" arrow>
              <TextField
                fullWidth
                label="OTP"
                type="text"
                required
                margin="normal"
                variant="filled"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon sx={{ color: "#ccc" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ style: { color: "#aaa" } }}
                sx={{
                  backgroundColor: "#2c2f36",
                  borderRadius: 1,
                  input: { color: "#fff" },
                }}
              />
            </Tooltip>
          )}

          {/* New Password */}
          {otpSent && (
            <Tooltip title="Create new password" arrow>
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? "text" : "password"}
                required
                margin="normal"
                variant="filled"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#ccc" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ style: { color: "#aaa" } }}
                sx={{
                  backgroundColor: "#2c2f36",
                  borderRadius: 1,
                  input: { color: "#fff" },
                }}
              />
            </Tooltip>
          )}

          {/* Confirm Password */}
          {otpSent && (
            <Tooltip title="Re-enter new password" arrow>
              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                required
                margin="normal"
                variant="filled"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOpenIcon sx={{ color: "#ccc" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end">
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ style: { color: "#aaa" } }}
                sx={{
                  backgroundColor: "#2c2f36",
                  borderRadius: 1,
                  input: { color: "#fff" },
                }}
              />
            </Tooltip>
          )}

          <Box mt={4}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              endIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : otpSent ? (
                  <ResetIcon />
                ) : (
                  <SendIcon />
                )
              }
              disabled={loading}
              sx={{ py: 1.5, fontWeight: "bold", fontSize: "1rem" }}
            >
              {loading
                ? "Processing..."
                : otpSent
                ? "Reset Password"
                : "Send OTP"}
            </Button>
          </Box>
        </form>

        {/* Alert Messages */}
        <Collapse in={!!message}>
          <Box mt={3}>
            <Alert severity={severity}>{message}</Alert>
          </Box>
        </Collapse>
      </StyledBox>
    </Container>
  );
};

export default ResetPassword;
