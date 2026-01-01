const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - now in ../server/ folder
const googleDriveRoutes = require("../server/google-drive");
const googleAnalyticsRoutes = require("../server/routes/google/analytics");
const googleCalendarRoutes = require("../server/routes/google/calendar");
const googleGmailRoutes = require("../server/routes/google/gmail");
const googleMapsRoutes = require("../server/routes/google/maps");
const googleIndexingRoutes = require("../server/routes/google/indexing");
const credentialsRoutes = require("../server/routes/credentials");
const stripeRoutes = require("../server/routes/stripe");
const emailRoutes = require("../server/routes/email");
const vnpayRoutes = require("../server/routes/vnpay");
const cassoRoutes = require("../server/routes/casso-webhook");

app.use("/api/drive", googleDriveRoutes);
app.use("/api/google/analytics", googleAnalyticsRoutes);
app.use("/api/google/calendar", googleCalendarRoutes);
app.use("/api/google/gmail", googleGmailRoutes);
app.use("/api/google/maps", googleMapsRoutes);
app.use("/api/google/indexing", googleIndexingRoutes);
app.use("/api/credentials", credentialsRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/vnpay", vnpayRoutes);
app.use("/api/casso", cassoRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Export for Vercel serverless
module.exports = app;
