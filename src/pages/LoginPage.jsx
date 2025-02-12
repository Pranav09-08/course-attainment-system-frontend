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
import { login } from "../services/authServices";

const darkTheme = createTheme({ palette: { mode: "dark" } });

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.user.role === "admin") navigate("/admin-dashboard");
      else if (user.user.role === "coordinator") navigate("/coordinator-dashboard");
      else navigate("/faculty-dashboard");
    } catch (err) {
      setError("Invalid Credentials!");
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