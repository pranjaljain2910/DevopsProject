/**
 * Seed Script
 * 
 * Populates the database with sample data for demonstration:
 *  - 4 users (2 admins, 2 responders)
 *  - 2 teams (Platform, Application)
 *  - 3 alert rules (CPU, Memory, Server Down)
 *  - 2 escalation policies
 *  - 2 sample triggered alerts
 * 
 * Run: npm run seed  (or node seed.js)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Team = require('./models/Team');
const Rule = require('./models/Rule');
const EscalationPolicy = require('./models/EscalationPolicy');
const Alert = require('./models/Alert');
const Log = require('./models/Log');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Rule.deleteMany({}),
      EscalationPolicy.deleteMany({}),
      Alert.deleteMany({}),
      Log.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Users ────────────────────────────────────────────
    const users = await User.insertMany([
      { name: 'Alice Chen', email: 'alice@devops.io', role: 'admin' },
      { name: 'Bob Martinez', email: 'bob@devops.io', role: 'responder' },
      { name: 'Carol Singh', email: 'carol@devops.io', role: 'responder' },
      { name: 'Dave O\'Brien', email: 'dave@devops.io', role: 'admin' },
    ]);
    console.log(`👤 Created ${users.length} users`);

    // ── Teams ────────────────────────────────────────────
    const teams = await Team.insertMany([
      { name: 'Platform Engineering', members: [users[0]._id, users[1]._id] },
      { name: 'Application Support', members: [users[2]._id, users[3]._id] },
    ]);
    console.log(`👥 Created ${teams.length} teams`);

    // ── Rules ────────────────────────────────────────────
    const rules = await Rule.insertMany([
      { condition: 'CPU > 80%', severity: 'critical', teamId: teams[0]._id },
      { condition: 'Memory > 90%', severity: 'high', teamId: teams[0]._id },
      { condition: 'Server Down', severity: 'critical', teamId: teams[1]._id },
      { condition: 'Disk Usage > 85%', severity: 'medium', teamId: teams[1]._id },
      { condition: 'Response Time > 2s', severity: 'low', teamId: teams[0]._id },
    ]);
    console.log(`📏 Created ${rules.length} rules`);

    // ── Escalation Policies ──────────────────────────────
    const policies = await EscalationPolicy.insertMany([
      {
        name: 'Critical Infrastructure',
        steps: [
          { type: 'team', targetId: teams[0]._id, delay: 30 },
          { type: 'user', targetId: users[0]._id, delay: 60 },
          { type: 'user', targetId: users[3]._id, delay: 90 },
        ],
      },
      {
        name: 'Application Issues',
        steps: [
          { type: 'team', targetId: teams[1]._id, delay: 45 },
          { type: 'user', targetId: users[2]._id, delay: 60 },
        ],
      },
    ]);
    console.log(`📈 Created ${policies.length} escalation policies`);

    // ── Sample Alerts ────────────────────────────────────
    const alerts = await Alert.insertMany([
      {
        title: 'High CPU on prod-web-01',
        description: 'CPU utilization has exceeded 80% for 5 minutes on production web server 01.',
        severity: 'critical',
        status: 'triggered',
        assignedTo: teams[0]._id,
        assignedType: 'team',
        ruleId: rules[0]._id,
        escalationPolicyId: policies[0]._id,
        currentEscalationStep: 0,
      },
      {
        title: 'Memory leak in auth-service',
        description: 'Memory usage on auth-service pod is growing steadily and has reached 92%.',
        severity: 'high',
        status: 'acknowledged',
        assignedTo: users[1]._id,
        assignedType: 'user',
        ruleId: rules[1]._id,
      },
    ]);

    // Create some log entries for the sample alerts
    await Log.insertMany([
      { alertId: alerts[0]._id, message: 'Alert triggered: High CPU on prod-web-01' },
      { alertId: alerts[0]._id, message: 'Matched rule "CPU > 80%" → assigned to Platform Engineering' },
      { alertId: alerts[0]._id, message: 'Attached escalation policy "Critical Infrastructure"' },
      { alertId: alerts[1]._id, message: 'Alert triggered: Memory leak in auth-service' },
      { alertId: alerts[1]._id, message: 'Alert acknowledged by Bob Martinez' },
    ]);

    console.log(`🚨 Created ${alerts.length} sample alerts with logs`);
    console.log('\n✅ Seed complete!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
