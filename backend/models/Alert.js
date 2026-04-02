/**
 * Alert Model
 * 
 * Central entity. Created when an incident is triggered.
 * Tracks severity, current status, which user/team is assigned,
 * and escalation progress.
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const alertSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    status: {
      type: String,
      enum: ['triggered', 'acknowledged', 'escalated', 'resolved'],
      default: 'triggered',
    },
    // Who is currently responsible — could be a User ID or Team ID
    assignedTo: { type: String, default: null },
    assignedType: { type: String, enum: ['user', 'team', null], default: null },
    // Escalation tracking
    escalationPolicyId: { type: String, ref: 'EscalationPolicy', default: null },
    currentEscalationStep: { type: Number, default: 0 },
    // Matched rule
    ruleId: { type: String, ref: 'Rule', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
