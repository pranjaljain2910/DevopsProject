/**
 * Teams Routes
 * 
 * POST /teams       — Create a new team
 * GET  /teams       — List all teams (populated members)
 * GET  /teams/:id   — Get single team
 * DELETE /teams/:id — Delete team
 */

const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// Create team
router.post('/', async (req, res) => {
  try {
    const { name, members } = req.body;
    const team = await Team.create({ name, members: members || [] });
    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List all teams with populated members
router.get('/', async (_req, res) => {
  try {
    const teams = await Team.find().populate('members').sort({ createdAt: -1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single team
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('members');
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete team
router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json({ message: 'Team deleted', team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
