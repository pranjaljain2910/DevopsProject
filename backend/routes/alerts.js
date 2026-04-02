/**
 * Alerts Routes
 * 
 * POST  /alerts                 — Trigger a new alert (runs the alert engine)
 * GET   /alerts                 — List all alerts (with optional filters)
 * GET   /alerts/:id             — Get single alert
 * GET   /alerts/:id/logs        — Get logs for an alert
 * PATCH /alerts/:id/acknowledge — Acknowledge an alert (stops escalation)
 * PATCH /alerts/:id/resolve     — Resolve an alert
 */

const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const Log = require('../models/Log');
const { handleAlert, acknowledge, resolve } = require('../services/alertEngine');

// Trigger a new alert
router.post('/', async (req, res) => {
  try {
    const { title, description, severity, assignedTo, assignedType } = req.body;

    // Create the alert document
    const alert = new Alert({ title, description, severity, assignedTo, assignedType });
    await alert.save();

    // Run the alert engine: match rule → assign → escalate
    await handleAlert(alert);

    // Return the updated alert
    const updated = await Alert.findById(alert._id);
    res.status(201).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List alerts with optional filters
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.status) filter.status = req.query.status;

    const alerts = await Alert.find(filter).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single alert
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get logs for an alert
router.get('/:id/logs', async (req, res) => {
  try {
    const logs = await Log.find({ alertId: req.params.id }).sort({ timestamp: 1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Acknowledge alert
router.patch('/:id/acknowledge', async (req, res) => {
  try {
    const alert = await acknowledge(req.params.id);
    res.json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Resolve alert
router.patch('/:id/resolve', async (req, res) => {
  try {
    const alert = await resolve(req.params.id);
    res.json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
