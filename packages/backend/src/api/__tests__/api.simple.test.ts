/**
 * Simple API integration tests without complex mocking
 */

import request from 'supertest';
import { describe, expect, it } from 'vitest';

// Import the app directly - we'll test basic functionality without mocking
import { app } from '../../index';

describe('API Simple Integration Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('API Routes', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown-route').expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
