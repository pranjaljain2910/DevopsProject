/**
 * EscalationPolicy Model
 * 
 * Defines a chain of escalation steps. Each step specifies
 * who to notify (user or team) and how long to wait before
 * escalating to the next step.
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const escalationStepSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['user', 'team'], required: true },
    targetId: { type: String, required: true },   // User ID or Team ID
    delay: { type: Number, required: true },        // Seconds to wait before escalating
  },
  { _id: false }
);

const escalationPolicySchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true, trim: true },
    steps: { type: [escalationStepSchema], required: true, validate: v => v.length > 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EscalationPolicy', escalationPolicySchema);
