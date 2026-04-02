/**
 * Log Model
 * 
 * Immutable audit log for every significant event that happens
 * to an alert: creation, assignment, escalation, acknowledgement, resolution.
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const logSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  alertId: { type: String, ref: 'Alert', required: true, index: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Log', logSchema);
