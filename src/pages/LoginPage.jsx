import React, { useState, useEffect } from "react";
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
import { getCurrentUser, login } from "../services/authServices";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import bg from "../assets/signin.svg";
import bgimg from "../assets/backimg.jpg";
import { useDispatch } from "react-redux"; 

const darkTheme = createTheme({ palette: { mode: "dark" } });

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Persistent Login
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await getCurrentUser();  // ✅ Ensure token refresh

      if (storedUser?.user?.role) {
        dispatch({ type: "setRole", userRole: storedUser.user.role });

        // Redirect to respective dashboard
        switch (storedUser.user.role) {
          case "admin":
            navigate("/admin-dashboard");
            break;
          case "coordinator":
            navigate("/coordinator-dashboard");
            break;
          default:
            navigate("/faculty-dashboard");
        }
      }
    };

    fetchUser();
  }, [navigate, dispatch]); // ✅ Ensure effect only runs once

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const user = await login(email, password);
      console.log("Login Successful: ", user);
  
      if (user && user.user && user.user.role) {
        dispatch({ type: "setRole", userRole: user.user.role });
        // setUser(user); // ✅ Update local state
        localStorage.setItem("user", JSON.stringify(user)); // ✅ Store in localStorage
  
        // Redirect based on role
        switch (user.user.role) {
          case "admin":
            navigate("/admin-dashboard");
            break;
          case "coordinator":
            navigate("/coordinator-dashboard");
            break;
          default:
            navigate("/faculty-dashboard");
        }
      } else {
        throw new Error("Invalid user data received");
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      setError("❌ Invalid Credentials! Try again.");
    }
  };    
  

  return (
    <div className="login-container" style={{ backgroundImage: `url(${bgimg})` }}>
      <Box position="absolute" top={20} right={70}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate("/")}
        >
          Home
        </Button>
      </Box>
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
                  <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
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
};

export default Login;
