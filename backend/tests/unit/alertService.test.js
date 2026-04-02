const { handleAlert } = require('../../services/alertEngine');
const Alert = require('../../models/Alert');
const Rule = require('../../models/Rule');
const EscalationPolicy = require('../../models/EscalationPolicy');
const Team = require('../../models/Team');

describe('alertService', () => {
  let mockTeam, mockRule, mockPolicy;

  beforeEach(async () => {
    // Setup initial data needed for alert engine to process
    mockTeam = await Team.create({ name: 'Backend Team', members: [] });
    mockRule = await Rule.create({ condition: 'High CPU', severity: 'critical', teamId: mockTeam._id });
    mockPolicy = await EscalationPolicy.create({
      name: 'Default Policy',
      steps: [{ delay: 1, targetId: mockTeam._id, type: 'team' }]
    });

    
  });

  it('should assign alert to correct team based on rule', async () => {
    const alert = new Alert({ title: 'Test Alert', severity: 'critical' });
    await alert.save();

    await handleAlert(alert);

    // Fetch the updated alert
    const updatedAlert = await Alert.findById(alert._id);

    expect(updatedAlert.assignedType).toBe('team');
    expect(updatedAlert.assignedTo.toString()).toBe(mockTeam._id.toString());
    expect(updatedAlert.ruleId.toString()).toBe(mockRule._id.toString());
  });

  it('should attach an escalation policy if available', async () => {
    const alert = new Alert({ title: 'Policy Test Alert', severity: 'critical' });
    await alert.save();

    await handleAlert(alert);

    const updatedAlert = await Alert.findById(alert._id);

    expect(updatedAlert.escalationPolicyId.toString()).toBe(mockPolicy._id.toString());
    expect(updatedAlert.currentEscalationStep).toBe(0);
  });
});
