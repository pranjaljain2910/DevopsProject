/**
 * Alert Engine — Core Business Logic
 * 
 * This module contains the heart of the escalation system:
 * 
 *  handleAlert(alert)   — Match rule → assign team → attach policy → start timer
 *  escalate(alertId)    — Move to next escalation step → notify → log
 *  acknowledge(alertId) — Stop escalation → update status
 *  resolve(alertId)     — Stop escalation → mark resolved
 *  restoreTimers()      — On server boot, restart timers for active alerts
 * 
 * Timers are stored in an in-memory Map keyed by alertId.
 * In production you'd use a job queue (Bull, Agenda), but setTimeout
 * works perfectly for demo/presentation purposes.
 */

const Alert = require('../models/Alert');
const Rule = require('../models/Rule');
const EscalationPolicy = require('../models/EscalationPolicy');
const Log = require('../models/Log');
const Team = require('../models/Team');

// ── In-memory timer registry ───────────────────────────────
// Maps alertId → setTimeout handle so we can cancel on ack/resolve
const activeTimers = new Map();

/**
 * addLog — helper to write an audit log entry for an alert
 */
async function addLog(alertId, message) {
  await Log.create({ alertId, message });
  console.log(`[LOG] Alert ${alertId.slice(0, 8)}… → ${message}`);
}

/**
 * handleAlert
 * 
 * Called when a new alert is created (POST /alerts).
 * Steps:
 *  1. Find a matching Rule by severity (first match wins)
 *  2. Assign the alert to the rule's target team
 *  3. Attach the first available escalation policy
 *  4. Start the escalation timer for step 0
 */
async function handleAlert(alert) {
  // 1. Determine assignment (manual vs automatic)
  if (alert.assignedTo && alert.assignedType) {
    await addLog(alert._id, `Manually assigned to ${alert.assignedType} (${alert.assignedTo})`);
  } else {
    // Attempt automatic assignment via matching rule
    const rule = await Rule.findOne({ severity: alert.severity });

    if (rule) {
      alert.ruleId = rule._id;
      alert.assignedTo = rule.teamId;
      alert.assignedType = 'team';
      await addLog(alert._id, `Matched rule "${rule.condition}" → assigned to team ${rule.teamId}`);
    } else {
      await addLog(alert._id, 'No matching rule found — alert is unassigned');
    }
  }

  // 2. Attach escalation policy (pick the first one; in a real system you'd
  //    associate policies with teams or severity levels)
  const policy = await EscalationPolicy.findOne();
  if (policy) {
    alert.escalationPolicyId = policy._id;
    alert.currentEscalationStep = 0;
    await addLog(alert._id, `Attached escalation policy "${policy.name}"`);
  }

  await alert.save();

  // 3. Start escalation timer
  if (policy && policy.steps.length > 0) {
    startEscalationTimer(alert._id, policy, 0);
  }
}

/**
 * startEscalationTimer
 * 
 * Schedules the next escalation step. After `delay` seconds, if the alert
 * hasn't been acknowledged, it escalates to the next step.
 */
function startEscalationTimer(alertId, policy, stepIndex) {
  if (stepIndex >= policy.steps.length) {
    // No more steps — log that we've exhausted the policy
    addLog(alertId, 'All escalation steps exhausted');
    return;
  }

  const step = policy.steps[stepIndex];
  const delayMs = (step.delay || 30) * 1000;

  console.log(
    `⏱️  Escalation timer set for alert ${alertId.slice(0, 8)}… step ${stepIndex} in ${step.delay}s`
  );

  const timer = setTimeout(async () => {
    activeTimers.delete(alertId);
    await escalate(alertId);
  }, delayMs);

  // Store so we can cancel on acknowledge/resolve
  activeTimers.set(alertId, timer);
}

/**
 * escalate
 * 
 * Moves the alert to the next escalation step.
 * Updates the assignee, logs the event, and starts the next timer.
 */
async function escalate(alertId) {
  const alert = await Alert.findById(alertId);
  if (!alert) return;

  // Don't escalate if already acknowledged or resolved
  if (alert.status === 'acknowledged' || alert.status === 'resolved') return;

  const policy = await EscalationPolicy.findById(alert.escalationPolicyId);
  if (!policy) return;

  const nextStep = alert.currentEscalationStep + 1;

  if (nextStep >= policy.steps.length) {
    // Exhausted all steps
    alert.status = 'escalated';
    await alert.save();
    await addLog(alertId, 'Final escalation step reached — no more responders');
    return;
  }

  const step = policy.steps[nextStep];

  // Update alert
  alert.status = 'escalated';
  alert.currentEscalationStep = nextStep;
  alert.assignedTo = step.targetId;
  alert.assignedType = step.type;
  await alert.save();

  await addLog(
    alertId,
    `Escalated to step ${nextStep}: ${step.type} ${step.targetId}`
  );

  // Schedule next step
  startEscalationTimer(alertId, policy, nextStep);
}

/**
 * acknowledge
 * 
 * Stops the escalation chain and marks the alert as acknowledged.
 */
async function acknowledge(alertId) {
  const alert = await Alert.findById(alertId);
  if (!alert) throw new Error('Alert not found');

  // Cancel any pending escalation timer
  if (activeTimers.has(alertId)) {
    clearTimeout(activeTimers.get(alertId));
    activeTimers.delete(alertId);
  }

  alert.status = 'acknowledged';
  await alert.save();

  await addLog(alertId, 'Alert acknowledged — escalation stopped');
  return alert;
}

/**
 * resolve
 * 
 * Stops escalation and marks the alert as resolved.
 */
async function resolve(alertId) {
  const alert = await Alert.findById(alertId);
  if (!alert) throw new Error('Alert not found');

  // Cancel any pending escalation timer
  if (activeTimers.has(alertId)) {
    clearTimeout(activeTimers.get(alertId));
    activeTimers.delete(alertId);
  }

  alert.status = 'resolved';
  await alert.save();

  await addLog(alertId, 'Alert resolved');
  return alert;
}

/**
 * restoreTimers
 * 
 * Called on server startup. Finds all alerts that are still 'triggered' or
 * 'escalated' and restarts their escalation timers from where they left off.
 * This handles the case where the server restarts mid-escalation.
 */
async function restoreTimers() {
  const activeAlerts = await Alert.find({
    status: { $in: ['triggered', 'escalated'] },
    escalationPolicyId: { $ne: null },
  });

  for (const alert of activeAlerts) {
    const policy = await EscalationPolicy.findById(alert.escalationPolicyId);
    if (policy) {
      console.log(`🔄 Restoring escalation timer for alert ${alert._id.slice(0, 8)}…`);
      startEscalationTimer(alert._id, policy, alert.currentEscalationStep);
    }
  }

  console.log(`✅ Restored timers for ${activeAlerts.length} active alert(s)`);
}

module.exports = { handleAlert, escalate, acknowledge, resolve, restoreTimers };
