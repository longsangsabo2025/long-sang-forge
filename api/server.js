const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const googleDriveRoutes = require('./google-drive');
const googleAnalyticsRoutes = require('./routes/google/analytics');
const googleCalendarRoutes = require('./routes/google/calendar');
const googleGmailRoutes = require('./routes/google/gmail');
const googleMapsRoutes = require('./routes/google/maps');
const googleIndexingRoutes = require('./routes/google/indexing');
const credentialsRoutes = require('./routes/credentials');
// const stripeRoutes = require('./routes/stripe'); // Temporarily disabled - missing API key
const emailRoutes = require('./routes/email');
const vnpayRoutes = require('./routes/vnpay');
const agentsRoutes = require('./routes/agents');
const seoRoutes = require('./routes/seo');
const investmentRoutes = require('./routes/investment');
const projectInterestRoutes = require('./routes/project-interest');
const aiAssistantRoutes = require('./routes/ai-assistant');
const aiReviewRoutes = require('./routes/ai-review');
const webVitalsRoutes = require('./routes/analytics/web-vitals');

app.use('/api/drive', googleDriveRoutes);
app.use('/api/google/analytics', googleAnalyticsRoutes);
app.use('/api/google/calendar', googleCalendarRoutes);
app.use('/api/google/gmail', googleGmailRoutes);
app.use('/api/google/maps', googleMapsRoutes);
app.use('/api/google/indexing', googleIndexingRoutes);
app.use('/api/credentials', credentialsRoutes);
// app.use('/api/stripe', stripeRoutes); // Temporarily disabled - missing API key
app.use('/api/email', emailRoutes);
app.use('/api/vnpay', vnpayRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/investment', investmentRoutes);
app.use('/api/project', projectInterestRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);
app.use('/api/ai-review', aiReviewRoutes);
app.use('/api/analytics', webVitalsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📁 Google Drive API available at http://localhost:${PORT}/api/drive`);
  console.log(`📊 Google Analytics API available at http://localhost:${PORT}/api/google/analytics`);
  console.log(`📅 Google Calendar API available at http://localhost:${PORT}/api/google/calendar`);
  console.log(`📧 Gmail API available at http://localhost:${PORT}/api/google/gmail`);
  console.log(`🗺️  Google Maps API available at http://localhost:${PORT}/api/google/maps`);
  console.log(`🔍 Google Indexing API available at http://localhost:${PORT}/api/google/indexing`);
  console.log(`🤖 AI Agents API available at http://localhost:${PORT}/api/agents`);
  console.log(`🎯 AI SEO API available at http://localhost:${PORT}/api/seo`);
});

module.exports = app;