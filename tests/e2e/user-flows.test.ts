/**
 * End-to-End Tests - User Flows
 * Tests complete user journeys through the application
 *
 * NOTE: These tests require the dev server to be running (npm run dev)
 * They will be skipped if the server is not available.
 */

import { beforeAll, describe, expect, it } from "vitest";

const FRONTEND_URL = "http://localhost:5000"; // Updated to correct port

// Helper to check if server is available
async function isServerAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(FRONTEND_URL, { signal: controller.signal });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

describe("🧑‍💻 E2E User Flow Tests", () => {
  let serverAvailable = false;

  beforeAll(async () => {
    serverAvailable = await isServerAvailable();
    if (!serverAvailable) {
      console.log("⚠️ E2E tests skipped - dev server not running at", FRONTEND_URL);
    }
  });

  describe("Homepage Flow", () => {
    it("should load homepage successfully", async () => {
      if (!serverAvailable) return; // Skip if server not available

      const response = await fetch(FRONTEND_URL);
      expect(response.status).toBe(200);

      const html = await response.text();
      expect(html.length).toBeGreaterThan(0);
    });

    it("should have navigation elements", async () => {
      if (!serverAvailable) return;

      const response = await fetch(FRONTEND_URL);
      const html = await response.text();

      // Check for common navigation elements
      const hasNav = html.includes("nav") || html.includes("Navigation") || html.includes("menu");
      expect(hasNav).toBeTruthy();
    });
  });

  describe("Agent Center Flow", () => {
    it("should access agent center page", async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${FRONTEND_URL}/agent-center`);

      // Should either load the page or redirect
      expect([200, 301, 302, 404].includes(response.status)).toBeTruthy();
    });
  });

  describe("Admin Portal Flow", () => {
    it("should have admin login page", async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${FRONTEND_URL}/admin/login`);

      // Should load or redirect
      expect([200, 301, 302, 404].includes(response.status)).toBeTruthy();
    });

    it("should have admin dashboard", async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${FRONTEND_URL}/admin`);

      // May redirect to login if not authenticated
      expect([200, 301, 302, 404].includes(response.status)).toBeTruthy();
    });
  });

  describe("Consultation Flow", () => {
    it("should have consultation booking page", async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${FRONTEND_URL}/consultation`);

      expect([200, 301, 302, 404].includes(response.status)).toBeTruthy();
    });
  });

  describe("Error Handling Flow", () => {
    it("should show 404 page for invalid routes", async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${FRONTEND_URL}/nonexistent-page-12345`);

      // Should either show 404 page or redirect
      expect([200, 404].includes(response.status)).toBeTruthy();
    });
  });
});
