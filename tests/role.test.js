const request = require('supertest');
const app = require('../app');
const Role = require('../models/Role');

describe('Role Model', () => {
  it('should create a new role', async () => {
    const role = new Role({ name: 'admin', permissions: ['create', 'read', 'update', 'delete'] });
    await role.save();
    expect(role.name).toBe('admin');
  });

  it('should get all roles', async () => {
    const roles = await Role.find();
    expect(roles.length).toBeGreaterThan(0);
  });
});

describe('Authorization Middleware', () => {
  it('should authenticate a user', async () => {
    const response = await request(app).get('/api/authenticate');
    expect(response.status).toBe(200);
  });

  it('should authorize a user', async () => {
    const response = await request(app).get('/api/authorize');
    expect(response.status).toBe(200);
  });
});