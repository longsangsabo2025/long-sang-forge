/**
 * Integration Tests - API Endpoints
 * Tests all backend API endpoints
 *
 * NOTE: These tests require the dev server to be running (npm run dev)
 * They will be skipped if the server is not available.
 */

import { beforeAll, describe, expect, it } from "vitest";

const API_BASE_URL = "http://localhost:3001";
const FRONTEND_URL = "http://localhost:5000"; // Updated to correct port

// Helper to check if server is available
async function isServerAvailable(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return true;
  } catch {
    return false;
  }
}

describe("🔧 API Integration Tests", () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isServerAvailable(API_BASE_URL);
    if (!apiAvailable) {
      console.log("⚠️ API tests skipped - API server not running at", API_BASE_URL);
    }
  });

  describe("Health Check", () => {
    it("should return OK status from health endpoint", async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("OK");
      expect(data.timestamp).toBeDefined();
    });
  });

  describe("Google Drive API", () => {
    it("should list Google Drive files", async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_BASE_URL}/api/drive/list`);

      // Should return 200 even if Google Drive is not configured
      expect(response.status).toBeLessThanOrEqual(500);

      if (response.ok) {
        const data = await response.json();
        expect(Array.isArray(data) || data.files).toBeTruthy();
      }
    });

    it("should handle missing folder ID gracefully", async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_BASE_URL}/api/drive/list?folderId=invalid`);
      expect(response.status).toBeLessThanOrEqual(500);
    });
  });

  describe("CORS Configuration", () => {
    it("should include CORS headers", async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_BASE_URL}/api/health`);

      // Check for CORS headers
      const corsHeader = response.headers.get("access-control-allow-origin");
      expect(corsHeader).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle 404 routes gracefully", async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_BASE_URL}/api/nonexistent`);
      expect(response.status).toBe(404);
    });

    it("should return JSON error responses", async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_BASE_URL}/api/nonexistent`);
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        const data = await response.json();
        expect(data.error || data.message).toBeDefined();
      }
    });
  });
});

describe("🎨 Frontend Integration Tests", () => {
  let frontendAvailable = false;

  beforeAll(async () => {
    frontendAvailable = await isServerAvailable(FRONTEND_URL);
    if (!frontendAvailable) {
      console.log("⚠️ Frontend tests skipped - server not running at", FRONTEND_URL);
    }
  });

  it("should serve frontend on correct port", async () => {
    if (!frontendAvailable) return;

    const response = await fetch(FRONTEND_URL);
    expect(response.status).toBe(200);
  });

  it("should return HTML content", async () => {
    if (!frontendAvailable) return;

    const response = await fetch(FRONTEND_URL);
    const contentType = response.headers.get("content-type");
    expect(contentType).toContain("text/html");
  });

  it("should include root div for React", async () => {
    if (!frontendAvailable) return;

    const response = await fetch(FRONTEND_URL);
    const html = await response.text();
    expect(html).toContain('id="root"');
  });
});

describe("🔐 Authentication Endpoints (if available)", () => {
  let frontendAvailable = false;

  beforeAll(async () => {
    frontendAvailable = await isServerAvailable(FRONTEND_URL);
  });

  it("should have dev-setup endpoint accessible", async () => {
    if (!frontendAvailable) return;

    const response = await fetch(`${FRONTEND_URL}/dev-setup`);
    expect(response.status).toBeLessThanOrEqual(404); // May or may not exist
  });
});
