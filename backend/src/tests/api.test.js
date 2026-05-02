import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';

// Mock the project controller to avoid actual disk operations
vi.mock('../controllers/projectController.js', () => ({
  createProjectController: vi.fn((req, res) => res.status(201).json({ projectId: 'mock-id' })),
  getProjectTree: vi.fn((req, res) => res.status(200).json({ tree: [] })),
}));

describe('API Endpoints', () => {
  it('GET /ping should return pong', async () => {
    const response = await request(app).get('/ping');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('pong');
  });

  describe('Project Routes', () => {
    it('POST /api/v1/projects should return 201', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .send({ name: 'test-project' });
      
      expect(response.status).toBe(201);
      expect(response.body.projectId).toBe('mock-id');
    });

    it('GET /api/v1/projects/:projectId/tree should return 200', async () => {
      const response = await request(app).get('/api/v1/projects/test-id/tree');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tree');
    });
  });
});
