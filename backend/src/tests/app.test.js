// tests/app.test.js
const request = require('supertest');
const app = require('../app');

describe('Test di funzionamento app Express', () => {
  test('GET /api/v1/health - endpoint di health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.message).toBe('Server funzionante');
  });
});