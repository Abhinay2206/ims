/* eslint-disable no-unused-vars */

import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  useTheme,
  alpha,
  Paper,
  Stack,
  IconButton,
  Card,
  Avatar,
  Divider,
  Tooltip,
  Zoom,
  Link,
} from "@mui/material"
import {
  Inventory,
  Timeline,
  Notifications,
  Security,
  ArrowForward,
  CloudDownload,
  Speed,
  Analytics,
  DataObject,
  CheckCircle,
  Star,
  TrendingUp,
  Code,
  Rocket,
  AutoGraph,
  Shield,
  Cloud,
  Storage,
  Api,
  BugReport,
  Devices,
  VerifiedUser,
  Facebook,
  Twitter,
  LinkedIn,
  GitHub,
  Groups,
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"
import dashImage from "../assets/dash.svg"
import { useNavigate } from "react-router-dom"
import Cookies from 'js-cookie';

const LandingPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const userRole = Cookies.get('userRole');

  const handleGetStarted = () => {
    const isLoggedIn = Cookies.get("jwtToken")
    if (isLoggedIn) {
      if (userRole === 'admin') {
        navigate("/manager/dashboard")
      } else {
        navigate("/user/dashboard")
      }
    } else {
      navigate("/login") 
    }
  }

  const features = [
    {
      icon: <Inventory sx={{ fontSize: 48 }} />,
      title: "Stock Management",
      description: "Comprehensive inventory tracking and management system.",
      color: "#2196F3",
      details: [
        "Real-time stock tracking",
        "Low stock alerts",
        "Automated reordering",
        "Stock optimization",
      ],
      animation: {
        hover: { scale: 1.05, rotate: 5 },
        tap: { scale: 0.95 }
      }
    },
    {
      icon: <DataObject sx={{ fontSize: 48 }} />,
      title: "Bill Generation",
      description: "Fast and efficient billing system with customizable templates.",
      color: "#64B5F6", 
      details: [
        "Professional invoice templates",
        "Automated calculations",
        "Digital receipt generation",
        "Multiple payment methods",
      ],
      animation: {
        hover: { scale: 1.05, y: -10 },
        tap: { scale: 0.95 }
      }
    },
    {
      icon: <Analytics sx={{ fontSize: 48 }} />,
      title: "Advanced Reports",
      description: "Detailed business analytics and custom report generation.",
      color: "#90CAF9",
      details: [
        "Sales analytics",
        "Inventory reports",
        "Financial statements",
        "Custom report builder",
      ],
      animation: {
        hover: { scale: 1.05, x: 10 },
        tap: { scale: 0.95 }
      }
    },
    {
      icon: <Timeline sx={{ fontSize: 48 }} />,
      title: "Chart Analysis",
      description: "Visual data analysis with interactive charts and graphs.",
      color: "#1976D2",
      details: [
        "Sales trends",
        "Inventory movements",
        "Revenue analysis",
        "Growth projections",
      ],
      animation: {
        hover: { scale: 1.05, rotate: -5 },
        tap: { scale: 0.95 }
      }
    },
    {
      icon: <AutoGraph sx={{ fontSize: 48 }} />,
      title: "Product Recommendations",
      description: "AI-powered product suggestions and bundle recommendations.",
      color: "#42A5F5",
      details: [
        "Smart product bundling",
        "Cross-selling suggestions",
        "Seasonal recommendations",
        "Personalized offers",
      ],
      animation: {
        hover: { scale: 1.05, y: 10 },
        tap: { scale: 0.95 }
      }
    },
    {
      icon: <Groups sx={{ fontSize: 48 }} />,
      title: "Customer Analysis",
      description: "Deep insights into customer behavior and preferences.",
      color: "#1E88E5",
      details: [
        "Customer segmentation",
        "Purchase patterns",
        "Loyalty tracking",
        "Customer feedback analysis",
      ],
      animation: {
        hover: { scale: 1.05, x: -10 },
        tap: { scale: 0.95 }
      }
    },
    {
      icon: <Security sx={{ fontSize: 48 }} />,
      title: "Fraud Detection",
      description: "Advanced security measures to detect and prevent fraudulent activities.",
      color: "#0D47A1",
      details: [
        "Real-time fraud detection",
        "Suspicious activity alerts",
        "Transaction verification",
        "Security audit logs",
      ],
      animation: {
        hover: { scale: 1.05, rotate: 10 },
        tap: { scale: 0.95 }
      }
    },
    {
      icon: <VerifiedUser sx={{ fontSize: 48 }} />,
      title: "Bill Analysis",
      description: "Comprehensive bill tracking and analysis system.",
      color: "#2962FF",
      details: [
        "Bill verification",
        "Payment tracking",
        "Expense analysis",
        "Budget monitoring",
      ],
      animation: {
        hover: { scale: 1.05, y: -5 },
        tap: { scale: 0.95 }
      }
    }
  ]

  const metrics = [
    { label: "Global Users", value: "2+", icon: <TrendingUp />, growth: "+127% YoY" },
    { label: "Data Processed", value: "5GB+", icon: <Speed />, growth: "99.99% uptime" },
    { label: "API Requests", value: "10K+", icon: <Code />, growth: "+85% MoM" },
    { label: "Customer Rating", value: "4.9/5", icon: <Star />, growth: "Industry Best" },
  ]

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 100%)",
        color: "#1A237E",
        overflow: "hidden",
        position: "relative",
        minHeight: "100vh",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle at 50% 50%, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0) 70%)",
            pointerEvents: "none",
          }}
        />
      </motion.div>

      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center" sx={{ minHeight: "100vh", py: { xs: 12, md: 16 } }}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Box
                sx={{
                  display: "inline-block",
                  background: "linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(13, 71, 161, 0.1))",
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  mb: 4,
                  backdropFilter: "blur(8px)",
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "#1565C0",
                      fontWeight: 700,
                      letterSpacing: 3,
                    }}
                  >
                    SMART INVENTORY MANAGEMENT
                  </Typography>
                </motion.div>
              </Box>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: "3.5rem", md: "4.5rem" },
                    background: "linear-gradient(135deg, #1565C0, #2196F3)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1.1,
                    mb: 4,
                    letterSpacing: -1.5,
                  }}
                >
                  Optimize Stock.
                  <br />
                  Maximize Profit.
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: "#546E7A",
                    mb: 6,
                    lineHeight: 1.8,
                    fontWeight: 400,
                    maxWidth: "90%",
                    fontSize: "1.35rem",
                  }}
                >
                  Transform your inventory management with AI-powered analytics, real-time tracking, and intelligent demand forecasting.
                </Typography>
              </motion.div>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ xs: "stretch", sm: "center" }}>
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={handleGetStarted}
                    sx={{
                      background: "linear-gradient(135deg, #1565C0, #2196F3)",
                      color: "white",
                      px: 6,
                      py: 2.5,
                      borderRadius: 3,
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      textTransform: "none",
                      boxShadow: "0 20px 40px rgba(33, 150, 243, 0.3)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 30px 60px rgba(33, 150, 243, 0.4)",
                      },
                    }}
                  >
                    Start Managing
                  </Button>
                </motion.div>
              </Stack>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Box
                sx={{
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -20,
                    left: -20,
                    right: -20,
                    bottom: -20,
                    background: "radial-gradient(circle at 50% 50%, rgba(33, 150, 243, 0.2), transparent 70%)",
                    filter: "blur(40px)",
                    borderRadius: 8,
                    zIndex: 0,
                  },
                }}
              >
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 2, 0],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Box
                    component="img"
                    src={dashImage}
                    alt="Platform Preview"
                    sx={{
                      width: "100%",
                      borderRadius: 8,
                      position: "relative",
                      zIndex: 1,
                      boxShadow: "0 25px 80px rgba(33, 150, 243, 0.3)",
                      transition: "all 0.4s ease",
                      "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 35px 100px rgba(33, 150, 243, 0.4)",
                      },
                    }}
                  />
                </motion.div>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Metrics Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 16 } }}>
        <Grid container spacing={4} justifyContent="center">
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: "100%",
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: 4,
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(33, 150, 243, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 20px 40px rgba(33, 150, 243, 0.1)",
                    },
                  }}
                >
                  <Stack spacing={3} alignItems="center" textAlign="center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Box
                        sx={{
                          color: "#2196F3",
                          background: "rgba(33, 150, 243, 0.1)",
                          p: 2,
                          borderRadius: 3,
                        }}
                      >
                        {metric.icon}
                      </Box>
                    </motion.div>
                    <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: -0.5, color: "#1565C0" }}>
                      {metric.value}
                    </Typography>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: "#546E7A", mb: 1 }}>
                        {metric.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#2196F3",
                          background: "rgba(33, 150, 243, 0.1)",
                          px: 2,
                          py: 0.75,
                          borderRadius: 20,
                          fontWeight: 600,
                        }}
                      >
                        {metric.growth}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 16 } }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={feature.animation.hover}
                whileTap={feature.animation.tap}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: "100%",
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: 4,
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(33, 150, 243, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 40px rgba(33, 150, 243, 0.1)",
                    },
                  }}
                >
                  <Stack spacing={3}>
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <IconButton
                        sx={{
                          color: feature.color,
                          background: alpha(feature.color, 0.1),
                          width: "fit-content",
                          p: 2,
                          "&:hover": {
                            background: alpha(feature.color, 0.2),
                          },
                        }}
                      >
                        {feature.icon}
                      </IconButton>
                    </motion.div>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#1565C0",
                        fontWeight: 700,
                        letterSpacing: -0.5,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#546E7A",
                        lineHeight: 1.7,
                      }}
                    >
                      {feature.description}
                    </Typography>
                    <Tooltip
                      title={
                        <Box>
                          {feature.details.map((detail, i) => (
                            <Typography key={i} variant="body2" sx={{ mb: 1 }}>
                              • {detail}
                            </Typography>
                          ))}
                        </Box>
                      }
                      placement="top"
                      TransitionComponent={Zoom}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          color: feature.color,
                          borderColor: alpha(feature.color, 0.5),
                          "&:hover": {
                            borderColor: feature.color,
                            background: alpha(feature.color, 0.1),
                          },
                        }}
                      >
                        Learn More
                      </Button>
                    </Tooltip>
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(33,150,243,0.1) 100%)",
          pt: 8,
          pb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ color: "#1565C0", fontWeight: 700, mb: 2 }}>
                About Us
              </Typography>
              <Typography variant="body2" sx={{ color: "#546E7A", mb: 3 }}>
                We&apos;re on a mission to revolutionize enterprise software development with cutting-edge cloud solutions.
              </Typography>
              <Stack direction="row" spacing={2}>
                <IconButton color="primary" component={Link} href="https://facebook.com" target="_blank">
                  <Facebook />
                </IconButton>
                <IconButton color="primary" component={Link} href="https://twitter.com" target="_blank">
                  <Twitter />
                </IconButton>
                <IconButton color="primary" component={Link} href="https://linkedin.com" target="_blank">
                  <LinkedIn />
                </IconButton>
                <IconButton color="primary" component={Link} href="https://github.com" target="_blank">
                  <GitHub />
                </IconButton>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ color: "#1565C0", fontWeight: 700, mb: 2 }}>
                Product
              </Typography>
              <Stack spacing={1}>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>Features</Link>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>Pricing</Link>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>Documentation</Link>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>API Reference</Link>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ color: "#1565C0", fontWeight: 700, mb: 2 }}>
                Company
              </Typography>
              <Stack spacing={1}>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>About</Link>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>Blog</Link>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>Careers</Link>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>Press</Link>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ color: "#1565C0", fontWeight: 700, mb: 2 }}>
                Support
              </Typography>
              <Stack spacing={1}>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>Help Center</Link>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>Contact</Link>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>Status</Link>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>Security</Link>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ color: "#1565C0", fontWeight: 700, mb: 2 }}>
                Legal
              </Typography>
              <Stack spacing={1}>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>Privacy</Link>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>Terms</Link>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>Cookie Policy</Link>
                <Link href="#" underline="hover" sx={{ color: "#546E7A" }}>Licenses</Link>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Typography variant="body2" align="center" sx={{ color: "#546E7A" }}>
            © {new Date().getFullYear()} Your Company Name. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default LandingPage
