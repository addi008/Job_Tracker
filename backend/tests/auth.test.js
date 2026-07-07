const request = require('supertest');
const app = require('../server');

describe('Auth Endpoints (Mock/Offline Mode)', () => {
  // Ensure we are running in disconnected/mock mode for tests
  beforeAll(() => {
    app.set('dbStatus', 'disconnected');
  });

  describe('POST /api/auth/signup', () => {
    it('should fail with validation errors for empty fields', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: '', password: '' });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should fail for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'invalid-email', password: 'password123' });
      
      expect(res.status).toBe(400);
    });

    it('should fail for password less than 6 chars', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: '123' });
      
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should fail with validation errors for missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should login successfully with mock credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should fail with invalid credentials for non-existent users when DB is disconnected', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'other@example.com', password: 'password123' });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Invalid credentials');
    });
  });
});
