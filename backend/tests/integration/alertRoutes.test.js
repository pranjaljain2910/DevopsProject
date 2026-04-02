const request = require('supertest');
const app = require('../../server');
const Alert = require('../../models/Alert');
const Team = require('../../models/Team');
const Rule = require('../../models/Rule');

describe('Alert routes integration', () => {
  let mockTeam, mockRule, createdAlertId;

  beforeEach(async () => {
    mockTeam = await Team.create({ name: 'Response Team', members: [] });
    mockRule = await Rule.create({ condition: 'High CPU', severity: 'critical', teamId: mockTeam._id });
    
    // Need a dummy alert
    const alert = await Alert.create({ title: 'Pre-existing Alert', severity: 'medium', status: 'triggered' });
    createdAlertId = alert._id;
  });

  describe('POST /alerts', () => {
    it('should create a new alert and run the alert engine', async () => {
      const response = await request(app)
        .post('/alerts')
        .send({
          title: 'Integration Test Alert',
          description: 'Testing the POST endpoint',
          severity: 'critical'
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Integration Test Alert');
      expect(response.body.severity).toBe('critical');

      // Due to the rule matching, it should have been assigned to the mock team
      expect(response.body.assignedTo).toBe(mockTeam._id.toString());
      
      const inDb = await Alert.findById(response.body._id);
      expect(inDb).not.toBeNull();
    });
  });

  describe('GET /alerts', () => {
    it('should return a list of alerts', async () => {
      const response = await request(app).get('/alerts');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('PATCH /alerts/:id/acknowledge', () => {
    it('should acknowledge an alert', async () => {
      const response = await request(app).patch(`/alerts/${createdAlertId}/acknowledge`);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('acknowledged');

      const inDb = await Alert.findById(createdAlertId);
      expect(inDb.status).toBe('acknowledged');
    });
  });
});
