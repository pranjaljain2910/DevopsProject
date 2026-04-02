/**
 * User Model
 * 
 * Represents an on-call responder or admin in the system.
 * Users are assigned to teams and can be targets of escalation steps.
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    role: {
      type: String,
      enum: ['admin', 'responder', 'observer'],
      default: 'responder',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
