import { describe, it, expect } from "vitest";

describe("TestExecutor Minimal Test", () => {
  it("should import TestExecutor", async () => {
    const { TestExecutor } = await import("./TestExecutor");
    const executor = TestExecutor.getInstance();
    expect(executor).toBeDefined();
  });

  it("should import SystemResourceMonitor", async () => {
    const { systemResourceMonitor } = await import("./SystemResourceMonitor");
    expect(systemResourceMonitor).toBeDefined();
    expect(typeof systemResourceMonitor.getCurrentMetrics).toBe("function");
  });

  it("should collect basic metrics", async () => {
    const { systemResourceMonitor } = await import("./SystemResourceMonitor");
    const metrics = await systemResourceMonitor.getCurrentMetrics();

    expect(metrics).toBeDefined();
    expect(metrics.cpu).toBeDefined();
    expect(metrics.memory).toBeDefined();
    expect(typeof metrics.cpu.cores).toBe("number");
    expect(typeof metrics.memory.total).toBe("number");
  });
});
