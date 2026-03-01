/**
 * TEST-1: Runtime integration tests with mocked Playwright.
 *
 * These tests exercise runRuntimeAnalysis logic without requiring a real
 * browser. Playwright is mocked via vi.mock so the runtime engine's
 * orchestration, error recovery, and custom-check paths are tested.
 */
import { describe, expect, it, vi } from "vitest";

// ── Mock types ──────────────────────────────────────────────────────────────

interface MockPage {
  goto: ReturnType<typeof vi.fn>;
  waitForLoadState: ReturnType<typeof vi.fn>;
  title: ReturnType<typeof vi.fn>;
  $: ReturnType<typeof vi.fn>;
  evaluate: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

interface MockContext {
  newPage: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

interface MockBrowser {
  newContext: ReturnType<typeof vi.fn>;
  isConnected: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

function createMockPage(overrides: Partial<MockPage> = {}): MockPage {
  return {
    goto: vi.fn().mockResolvedValue(undefined),
    waitForLoadState: vi.fn().mockResolvedValue(undefined),
    title: vi.fn().mockResolvedValue("Test Page"),
    $: vi.fn().mockResolvedValue({ textContent: "mock" }),
    evaluate: vi.fn().mockResolvedValue([]),
    close: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createFullMock(pageOverrides: Partial<MockPage> = {}): {
  page: MockPage;
  context: MockContext;
  browser: MockBrowser;
  launchCount: { value: number };
} {
  const page = createMockPage(pageOverrides);
  const context: MockContext = {
    newPage: vi.fn().mockResolvedValue(page),
    close: vi.fn().mockResolvedValue(undefined),
  };
  const browser: MockBrowser = {
    newContext: vi.fn().mockResolvedValue(context),
    isConnected: vi.fn().mockReturnValue(true),
    close: vi.fn().mockResolvedValue(undefined),
  };
  const launchCount = { value: 0 };

  vi.doMock("playwright", () => ({
    chromium: {
      launch: vi.fn().mockImplementation(() => {
        launchCount.value++;
        return Promise.resolve(browser);
      }),
    },
  }));

  return { page, context, browser, launchCount };
}

// ── Mock axe-runner (axe-core is also not available) ────────────────────────

vi.mock("../../src/analyzer/runtime/axe-runner.js", () => ({
  runAxe: vi.fn().mockResolvedValue([]),
}));

async function loadEngine() {
  return import("../../src/analyzer/runtime/engine.js");
}

describe("runRuntimeAnalysis — mocked Playwright", () => {
  it("analyzes a single page and returns a result", async () => {
    const { page } = createFullMock();
    const { runRuntimeAnalysis } = await loadEngine();

    const result = await runRuntimeAnalysis("http://localhost:3000", [{ path: "/", name: "Home" }]);

    expect(result.pages).toHaveLength(1);
    expect(result.pages[0]?.path).toBe("/");
    expect(result.pages[0]?.url).toBe("http://localhost:3000/");
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(page.goto).toHaveBeenCalledWith(
      "http://localhost:3000/",
      expect.objectContaining({ waitUntil: "domcontentloaded" }),
    );
  });

  it("rejects baseUrl without http:// or https://", async () => {
    createFullMock();
    const { runRuntimeAnalysis } = await loadEngine();
    await expect(runRuntimeAnalysis("ftp://localhost:3000", [{ path: "/" }])).rejects.toThrow(
      /baseUrl must start with http/,
    );
  });

  it("rejects page paths with directory traversal", async () => {
    createFullMock();
    const { runRuntimeAnalysis } = await loadEngine();
    await expect(
      runRuntimeAnalysis("http://localhost:3000", [{ path: "/../etc/passwd" }]),
    ).rejects.toThrow(/traversal/);
  });
});
