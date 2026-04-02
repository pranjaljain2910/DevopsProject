/**
 * Rule Model
 * 
 * Alert routing rules. When an alert is triggered, the engine scans rules
 * for a matching condition and severity, then routes the alert to the
 * associated team.
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ruleSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    condition: { type: String, required: true, trim: true },   // e.g. "CPU > 80"
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    teamId: { type: String, ref: 'Team', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rule', ruleSchema);
