const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');

describe('User routes integration', () => {
  let createdUserId;

  describe('POST /users', () => {
    it('should create a user', async () => {
      const response = await request(app)
        .post('/users')
        .send({ name: 'Alice', email: 'alice@test.com', role: 'admin' });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Alice');
      expect(response.body.email).toBe('alice@test.com');
      createdUserId = response.body._id;
    });
  });

  describe('GET /users', () => {
    it('should list all users', async () => {
      const response = await request(app).get('/users');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
