/**
 * Rules Routes
 * 
 * POST /rules       — Create a new alert rule
 * GET  /rules       — List all rules (populated team)
 * PUT  /rules/:id   — Update a rule
 * DELETE /rules/:id — Delete a rule
 */

const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');

// Create rule
router.post('/', async (req, res) => {
  try {
    const { condition, severity, teamId } = req.body;
    const rule = await Rule.create({ condition, severity, teamId });
    res.status(201).json(rule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List all rules
router.get('/', async (_req, res) => {
  try {
    const rules = await Rule.find().populate('teamId').sort({ createdAt: -1 });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update rule
router.put('/:id', async (req, res) => {
  try {
    const rule = await Rule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    res.json(rule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete rule
router.delete('/:id', async (req, res) => {
  try {
    const rule = await Rule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    res.json({ message: 'Rule deleted', rule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
