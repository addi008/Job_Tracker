const request = require('supertest');
const app = require('../server');

describe('Job Applications Endpoints (Mock/Offline Mode)', () => {
  let token;

  beforeAll(async () => {
    // Force offline mode
    app.set('dbStatus', 'disconnected');

    // Get a mock token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    token = res.body.token;
  });

  describe('GET /api/applications', () => {
    it('should fail if no authorization token is provided', async () => {
      const res = await request(app).get('/api/applications');
      expect(res.status).toBe(401);
    });

    it('should succeed with valid authorization token', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('company');
      expect(res.body[0]).toHaveProperty('role');
    });

    it('should support status filter query', async () => {
      const res = await request(app)
        .get('/api/applications?status=Interview')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      res.body.forEach(app => {
        expect(app.status).toBe('Interview');
      });
    });

    it('should support search query', async () => {
      const res = await request(app)
        .get('/api/applications?search=google')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      res.body.forEach(app => {
        expect(
          app.company.toLowerCase().includes('google') || 
          app.role.toLowerCase().includes('google')
        ).toBe(true);
      });
    });
  });

  describe('GET /api/applications/stats/summary', () => {
    it('should retrieve status aggregates correctly', async () => {
      const res = await request(app)
        .get('/api/applications/stats/summary')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('Applied');
      expect(res.body).toHaveProperty('Interview');
      expect(res.body).toHaveProperty('Offer');
      expect(res.body).toHaveProperty('Rejected');
    });
  });

  describe('POST /api/applications', () => {
    it('should fail with validation errors for missing company/role', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .send({ company: '', role: '' });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should successfully create a new application', async () => {
      const newApp = {
        company: 'Microsoft',
        role: 'Full Stack Engineer',
        status: 'Applied',
        appliedDate: '2026-07-06',
        salary: 150000,
        currency: 'USD',
        location: 'Remote',
        jobType: 'Full-time'
      };

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .send(newApp);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.company).toBe('Microsoft');
      expect(res.body.salary).toBe(150000);
      expect(res.body.history.length).toBe(1);
      expect(res.body.history[0].status).toBe('Applied');
    });
  });

  describe('PUT /api/applications/:id', () => {
    it('should successfully update application and log history', async () => {
      const updatedFields = {
        status: 'Interview',
        salary: 155000
      };

      const res = await request(app)
        .put('/api/applications/mock_app_2')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedFields);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('Interview');
      expect(res.body.salary).toBe(155000);
      // History should have the initial 'Applied' plus new 'Interview'
      expect(res.body.history.length).toBe(2);
      expect(res.body.history[1].status).toBe('Interview');
    });
  });

  describe('DELETE /api/applications/:id', () => {
    it('should delete specified application', async () => {
      const res = await request(app)
        .delete('/api/applications/mock_app_1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
  });
});
