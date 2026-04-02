const { handleAlert } = require('../../services/alertEngine');
const Alert = require('../../models/Alert');
const Rule = require('../../models/Rule');
const Team = require('../../models/Team');

describe('ruleService', () => {
  let mockTeamHigh, mockTeamCrit;

  beforeEach(async () => {
    mockTeamHigh = await Team.create({ name: 'High Sev Team', members: [] });
    mockTeamCrit = await Team.create({ name: 'Critical Team', members: [] });

    await Rule.create({ condition: 'High CPU', severity: 'high', teamId: mockTeamHigh._id });
    await Rule.create({ condition: 'DB Down', severity: 'critical', teamId: mockTeamCrit._id });

    
  });

  it('should match correct rule based on severity', async () => {
    const alertHigh = await Alert.create({ title: 'High Memory', severity: 'high' });
    await handleAlert(alertHigh);
    const updatedHigh = await Alert.findById(alertHigh._id);
    expect(updatedHigh.assignedTo.toString()).toBe(mockTeamHigh._id.toString());

    const alertCrit = await Alert.create({ title: 'Network Outage', severity: 'critical' });
    await handleAlert(alertCrit);
    const updatedCrit = await Alert.findById(alertCrit._id);
    expect(updatedCrit.assignedTo.toString()).toBe(mockTeamCrit._id.toString());
  });

  it('should not assign if no rule matches', async () => {
    const alertLow = await Alert.create({ title: 'Low priority', severity: 'low' });
    await handleAlert(alertLow);
    
    const updatedLow = await Alert.findById(alertLow._id);
    expect(updatedLow.assignedTo).toBeNull();
  });
});
