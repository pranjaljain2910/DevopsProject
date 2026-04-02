const request = require('supertest');
const app = require('../../server');
const Team = require('../../models/Team');

describe('Team routes integration', () => {
  describe('POST /teams', () => {
    it('should create a team', async () => {
      const response = await request(app)
        .post('/teams')
        .send({ name: 'Platform Operations', members: [] });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Platform Operations');
    });
  });

  describe('GET /teams', () => {
    it('should list all teams', async () => {
      const response = await request(app).get('/teams');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
