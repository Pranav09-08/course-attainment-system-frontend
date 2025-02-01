import React, { useState } from "react";
import {
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  Container,
  Avatar,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import bg from "../assets/signin.svg";
import bgimg from "../assets/backimg.jpg";

const darkTheme = createTheme({ palette: { mode: "dark" } });

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Reset error

    try {
      const response = await fetch("https://teacher-attainment-system-backend.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid login credentials");
      }

      // Save token or session data
      localStorage.setItem("token", data.token);
      localStorage.setItem("role",data.user.role)

      // Navigate based on role
    const role = data.user.role;
    setTimeout(() => {
      if (role === "admin") {
        navigate("/admin-dashboard", {replace:true});
      } else if (role === "faculty") {
        navigate("/faculty-dashboard");
      } else if (role === "coordinator") {
        navigate("/coordinator-dashboard");
      } else {
        navigate("/");
      }
    }, 100);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${bgimg})` }}>
      <Box className="login-box">
        <Grid container>
          <Grid item xs={12} sm={12} lg={6}>
            <Box className="login-bg" style={{ backgroundImage: `url(${bg})` }}></Box>
          </Grid>

          <Grid item xs={12} sm={12} lg={6}>
            <Box className="login-form">
              <ThemeProvider theme={darkTheme}>
                <Container>
                  <Box height={35} />
                  <Box className="login-header">
                    <Avatar className="login-avatar">
                      <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h4">
                      Sign In
                    </Typography>
                  </Box>
                  {error && <Alert severity="error">{error}</Alert>}
                  <Box component="form" sx={{ mt: 2 }} onSubmit={handleLogin}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Username"
                          name="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Password"
                          type="password"
                          name="password"
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel control={<Checkbox />} label="Remember me" />
                      </Grid>
                      <Grid item xs={12}>
                        <Button type="submit" variant="contained" fullWidth size="large">
                          Sign in
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Container>
              </ThemeProvider>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}