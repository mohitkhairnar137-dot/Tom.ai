import { describe, it, expect, vi } from "vitest";
import worker from "../src/index.js";

describe("TOM AI backend", () => {
  const env = {
    AI: {
      run: vi.fn()
    },
    TOM_LIMIT: {
      limit: vi.fn()
    }
  };

  it("rejects GET requests", async () => {
    const request = new Request("https://example.com", {
      method: "GET"
    });

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(405);
  });

  it("rejects empty messages", async () => {
    env.TOM_LIMIT.limit.mockResolvedValue({ success: true });

    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ text: "" })
    });

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(400);
  });

  it("rejects oversized messages", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: "x".repeat(12001)
    });

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(413);
  });

  it("rejects requests when rate limit is exceeded", async () => {
    env.TOM_LIMIT.limit.mockResolvedValue({ success: false });

    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ text: "Hello Tom" })
    });

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(429);
  });
});
