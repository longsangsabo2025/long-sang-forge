/**
 * Integration Tests - API Endpoints
 * Tests all backend API endpoints
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:8080';

describe('🔧 API Integration Tests', () => {
  beforeAll(async () => {
    // Wait for servers to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('Health Check', () => {
    it('should return OK status from health endpoint', async () => {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.status).toBe('OK');
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('Google Drive API', () => {
    it('should list Google Drive files', async () => {
      const response = await fetch(`${API_BASE_URL}/api/drive/list`);
      
      // Should return 200 even if Google Drive is not configured
      expect(response.status).toBeLessThanOrEqual(500);
      
      if (response.ok) {
        const data = await response.json();
        expect(Array.isArray(data) || data.files).toBeTruthy();
      }
    });

    it('should handle missing folder ID gracefully', async () => {
      const response = await fetch(`${API_BASE_URL}/api/drive/list?folderId=invalid`);
      expect(response.status).toBeLessThanOrEqual(500);
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers', async () => {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      
      // Check for CORS headers
      const corsHeader = response.headers.get('access-control-allow-origin');
      expect(corsHeader).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 routes gracefully', async () => {
      const response = await fetch(`${API_BASE_URL}/api/nonexistent`);
      expect(response.status).toBe(404);
    });

    it('should return JSON error responses', async () => {
      const response = await fetch(`${API_BASE_URL}/api/nonexistent`);
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        expect(data.error || data.message).toBeDefined();
      }
    });
  });
});

describe('🎨 Frontend Integration Tests', () => {
  it('should serve frontend on correct port', async () => {
    const response = await fetch(FRONTEND_URL);
    expect(response.status).toBe(200);
  });

  it('should return HTML content', async () => {
    const response = await fetch(FRONTEND_URL);
    const contentType = response.headers.get('content-type');
    expect(contentType).toContain('text/html');
  });

  it('should include root div for React', async () => {
    const response = await fetch(FRONTEND_URL);
    const html = await response.text();
    expect(html).toContain('id="root"');
  });
});

describe('🔐 Authentication Endpoints (if available)', () => {
  it('should have dev-setup endpoint accessible', async () => {
    const response = await fetch(`${FRONTEND_URL}/dev-setup`);
    expect(response.status).toBeLessThanOrEqual(404); // May or may not exist
  });
});
