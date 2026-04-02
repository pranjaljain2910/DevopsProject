const { escalate, handleAlert } = require('../../services/alertEngine');
const Alert = require('../../models/Alert');
const EscalationPolicy = require('../../models/EscalationPolicy');
const User = require('../../models/User');

describe('escalationService', () => {
  let mockUser1, mockUser2, mockPolicy, testAlert;

  beforeEach(async () => {
    mockUser1 = await User.create({ name: 'User 1', email: 'u1@test.com', role: 'responder' });
    mockUser2 = await User.create({ name: 'User 2', email: 'u2@test.com', role: 'responder' });

    mockPolicy = await EscalationPolicy.create({
      name: 'Test Policy',
      steps: [
        { delay: 1, targetId: mockUser1._id, type: 'user' },
        { delay: 1, targetId: mockUser2._id, type: 'user' }
      ]
    });

    testAlert = await Alert.create({
      title: 'Escalation Alert',
      severity: 'high',
      escalationPolicyId: mockPolicy._id,
      currentEscalationStep: 0,
      status: 'triggered'
    });

    
  });

  it('should escalate to the next step', async () => {
    await escalate(testAlert._id);

    const updatedAlert = await Alert.findById(testAlert._id);
    expect(updatedAlert.status).toBe('escalated');
    expect(updatedAlert.currentEscalationStep).toBe(1);
    expect(updatedAlert.assignedType).toBe('user');
    expect(updatedAlert.assignedTo.toString()).toBe(mockUser2._id.toString());
  });

  it('should not escalate if already acknowledged', async () => {
    testAlert.status = 'acknowledged';
    await testAlert.save();

    await escalate(testAlert._id);

    const updatedAlert = await Alert.findById(testAlert._id);
    expect(updatedAlert.currentEscalationStep).toBe(0); // Should not move to 1
  });
});
