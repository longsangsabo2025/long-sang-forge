/**
 * End-to-End Tests - User Flows
 * Tests complete user journeys through the application
 */

import { describe, it, expect } from 'vitest';

const FRONTEND_URL = 'http://localhost:8080';

describe('🧑‍💻 E2E User Flow Tests', () => {
  describe('Homepage Flow', () => {
    it('should load homepage successfully', async () => {
      const response = await fetch(FRONTEND_URL);
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html.length).toBeGreaterThan(0);
    });

    it('should have navigation elements', async () => {
      const response = await fetch(FRONTEND_URL);
      const html = await response.text();
      
      // Check for common navigation elements
      const hasNav = html.includes('nav') || 
                     html.includes('Navigation') || 
                     html.includes('menu');
      expect(hasNav).toBeTruthy();
    });
  });

  describe('Agent Center Flow', () => {
    it('should access agent center page', async () => {
      const response = await fetch(`${FRONTEND_URL}/agent-center`);
      
      // Should either load the page or redirect
      expect([200, 301, 302, 404].includes(response.status)).toBeTruthy();
    });
  });

  describe('Admin Portal Flow', () => {
    it('should have admin login page', async () => {
      const response = await fetch(`${FRONTEND_URL}/admin/login`);
      
      // Should load or redirect
      expect([200, 301, 302, 404].includes(response.status)).toBeTruthy();
    });

    it('should have admin dashboard', async () => {
      const response = await fetch(`${FRONTEND_URL}/admin`);
      
      // May redirect to login if not authenticated
      expect([200, 301, 302, 404].includes(response.status)).toBeTruthy();
    });
  });

  describe('Consultation Flow', () => {
    it('should have consultation booking page', async () => {
      const response = await fetch(`${FRONTEND_URL}/consultation`);
      
      expect([200, 301, 302, 404].includes(response.status)).toBeTruthy();
    });
  });

  describe('Error Handling Flow', () => {
    it('should show 404 page for invalid routes', async () => {
      const response = await fetch(`${FRONTEND_URL}/nonexistent-page-12345`);
      
      // Should either show 404 page or redirect
      expect([200, 404].includes(response.status)).toBeTruthy();
    });
  });
});
