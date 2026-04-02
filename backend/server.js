/**
 * Express Server Entry Point
 * 
 * Connects to MongoDB, mounts all route modules, and starts the HTTP server.
 * The alert engine's escalation timers are restored on startup for any
 * alerts that are still in "triggered" or "escalated" status.
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Route imports
const usersRoutes = require('./routes/users');
const teamsRoutes = require('./routes/teams');
const rulesRoutes = require('./routes/rules');
const alertsRoutes = require('./routes/alerts');
const policiesRoutes = require('./routes/policies');

// Alert engine — restores escalation timers on boot
const { restoreTimers } = require('./services/alertEngine');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger (dev convenience)
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────
app.use('/users', usersRoutes);
app.use('/teams', teamsRoutes);
app.use('/rules', rulesRoutes);
app.use('/alerts', alertsRoutes);
app.use('/policies', policiesRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── MongoDB Connection & Server Start ──────────────────────
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB');

      // Restore escalation timers for any active alerts
      await restoreTimers();

      app.listen(PORT, () => {
        console.log(`🚀 Backend server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      process.exit(1);
    });
}

module.exports = app;
