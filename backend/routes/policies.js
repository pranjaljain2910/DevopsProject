/**
 * Escalation Policies Routes
 * 
 * POST /policies       — Create a new escalation policy
 * GET  /policies       — List all policies
 * GET  /policies/:id   — Get single policy
 * DELETE /policies/:id — Delete policy
 */

const express = require('express');
const router = express.Router();
const EscalationPolicy = require('../models/EscalationPolicy');

// Create policy
router.post('/', async (req, res) => {
  try {
    const { name, steps } = req.body;
    const policy = await EscalationPolicy.create({ name, steps });
    res.status(201).json(policy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List all policies
router.get('/', async (_req, res) => {
  try {
    const policies = await EscalationPolicy.find().sort({ createdAt: -1 });
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single policy
router.get('/:id', async (req, res) => {
  try {
    const policy = await EscalationPolicy.findById(req.params.id);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete policy
router.delete('/:id', async (req, res) => {
  try {
    const policy = await EscalationPolicy.findByIdAndDelete(req.params.id);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json({ message: 'Policy deleted', policy });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
