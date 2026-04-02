/**
 * Team Model
 * 
 * A team groups Users together. Alerts can be routed to a team,
 * and escalation steps can target entire teams.
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const teamSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true, trim: true, unique: true },
    members: [{ type: String, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
