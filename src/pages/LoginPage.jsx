import React, { useState, forwardRef } from "react";
import {
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  Container,
  Avatar,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Stack,
  Slide,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css"; // Import the CSS file
import bg from "../assets/signin.svg";
import bgimg from "../assets/backimg.jpg";

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function Login() {
  const [open, setOpen] = useState(false);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    setOpen(true);
    event.preventDefault();
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  function TransitionLeft(props) {
    return <Slide {...props} direction="left" />;
  }

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        TransitionComponent={TransitionLeft}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          Failed! Enter correct username and password.
        </Alert>
      </Snackbar>

      <div className="login-container" style={{ backgroundImage: `url(${bgimg})` }}>
        <Box className="login-box">
          <Grid container>
            <Grid item xs={12} sm={12} lg={6}>
              <Box
                className="login-bg"
                style={{ backgroundImage: `url(${bg})` }}
              ></Box>
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
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={12} className="input-container">
                          <TextField required fullWidth id="email" label="Username" name="email" autoComplete="email" />
                        </Grid>
                        <Grid item xs={12} className="input-container">
                          <TextField required fullWidth name="password" label="Password" type="password" id="password" autoComplete="new-password" />
                        </Grid>
                        <Grid item xs={12} className="input-container">
                          <Stack direction="row" spacing={2}>
                            <FormControlLabel
                              className="remember-me"
                              control={<Checkbox checked={remember} onChange={() => setRemember(!remember)} />}
                              label="Remember me"
                            />
                            <Typography className="forgot-password" onClick={() => navigate("/reset-password")}>
                              Forgot password?
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} className="button-container">
                          <Button type="submit" variant="contained" fullWidth size="large" className="signin-button">
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
    </>
  );
}
