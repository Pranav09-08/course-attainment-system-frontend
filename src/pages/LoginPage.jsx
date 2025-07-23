
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  Avatar,
  FormControlLabel,
  Checkbox,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import LockOutlined from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { getCurrentUser, login } from "../services/authServices";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import bg from "../assets/signin.svg";

const glassTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4a80f0", // Updated to solid blue
    },
    secondary: {
      main: "#ff6b6b", // Updated to coral
    },
    background: {
      default: "#121212",
      paper: "rgba(30, 30, 30, 0.8)",
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255, 255, 255, 0.07)",
            backdropFilter: "blur(10px)",
          },
        },
      },
    },
  },
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await getCurrentUser();
      if (storedUser?.user?.role) {
        dispatch({ type: "setRole", userRole: storedUser.user.role });
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
  }, [navigate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user && user.user && user.user.role) {
        dispatch({ type: "setRole", userRole: user.user.role });
        localStorage.setItem("user", JSON.stringify(user));
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
      }
    } catch (err) {
      setError("Invalid Credentials! Try again.");
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      }}
    >
      <ThemeProvider theme={glassTheme}>
        <Box
          sx={{
            width: { xs: "90%", sm: "80%", md: "70%" },
            maxWidth: "800px",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(16px)",
            backgroundColor: "rgba(30, 30, 45, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            transform: isHovered ? "translateY(-5px)" : "translateY(0)",
            transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Grid container>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: "100%",
                  minHeight: "300px",
                  background: "rgba(20, 20, 40, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 3,
                  position: "relative",
                }}
              >
                <Box
                  component="img"
                  src={bg}
                  alt="Login illustration"
                  sx={{
                    width: "90%",
                    height: "auto",
                    maxWidth: "300px",
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))",
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  background: "rgba(40, 40, 60, 0.6)",
                  backdropFilter: "blur(5px)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: "transparent",
                      border: "2px solid #4a80f0",
                      mb: 1.5,
                      transform: isHovered ? "rotate(8deg)" : "rotate(0)",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <LockOutlined
                      sx={{
                        fontSize: 28,
                        color: "#4a80f0",
                      }}
                    />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "white" }}>
                    Sign In
                  </Typography>
                </Box>

                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                      backgroundColor: "rgba(255, 80, 80, 0.2)",
                      borderLeft: "4px solid #ff6b6b",
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "#4a80f0",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "rgba(255, 255, 255, 0.7)",
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "#4a80f0",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "rgba(255, 255, 255, 0.7)",
                      },
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 1.5,
                      mb: 2,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            "&.Mui-checked": {
                              color: "#4a80f0",
                            },
                          }}
                        />
                      }
                      label="Remember me"
                      sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                    />

                    <Link
                      to="/forgot-password"
                      style={{
                        textDecoration: "none",
                        color: "#4a80f0",
                        fontWeight: 500,
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="medium"
                    type="submit"
                    sx={{
                      py: 1.2,
                      borderRadius: "10px",
                      fontWeight: 600,
                      background: "linear-gradient(45deg, #4a80f0, #6a5acd)",
                      color: "white",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
                        background: "linear-gradient(45deg, #3a70e0, #5a4abd)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Sign In
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </ThemeProvider>
    </Box>
  );
};

export default Login;