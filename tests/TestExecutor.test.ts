/**
 * TestExecutor Tests
 * Verify the TestExecutor performance monitoring functionality
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestExecutor, testExecutor } from "./TestExecutor";
import { systemResourceMonitor } from "./SystemResourceMonitor";

describe("TestExecutor Performance Monitoring", () => {
  beforeEach(async () => {
    // Clean up any existing monitoring
    systemResourceMonitor.stopMonitoring();
  });

  afterEach(async () => {
    // Clean up after tests
    systemResourceMonitor.stopMonitoring();
  });

  it("should create TestExecutor instance", () => {
    const executor = TestExecutor.getInstance();
    expect(executor).toBeDefined();
    expect(executor).toBe(testExecutor); // Should be singleton
  });

  it("should collect system metrics", async () => {
    const metrics = await systemResourceMonitor.getCurrentMetrics();

    expect(metrics).toBeDefined();
    expect(metrics.cpu).toBeDefined();
    expect(metrics.memory).toBeDefined();
    expect(metrics.processes).toBeDefined();
    expect(metrics.disk).toBeDefined();

    expect(typeof metrics.cpu.usage).toBe("number");
    expect(typeof metrics.cpu.cores).toBe("number");
    expect(Array.isArray(metrics.cpu.loadAverage)).toBe(true);

    expect(typeof metrics.memory.total).toBe("number");
    expect(typeof metrics.memory.used).toBe("number");
    expect(typeof metrics.memory.usagePercent).toBe("number");

    expect(typeof metrics.processes.total).toBe("number");
    expect(typeof metrics.processes.bun).toBe("number");
  });

  it("should provide concurrency recommendations", async () => {
    const recommendation =
      await systemResourceMonitor.getConcurrencyRecommendation();

    expect(recommendation).toBeDefined();
    expect(typeof recommendation.recommended).toBe("number");
    expect(typeof recommendation.reason).toBe("string");
    expect(typeof recommendation.confidence).toBe("number");
    expect(Array.isArray(recommendation.adjustments)).toBe(true);

    expect(recommendation.recommended).toBeGreaterThan(0);
    expect(recommendation.recommended).toBeLessThanOrEqual(4);
    expect(recommendation.confidence).toBeGreaterThan(0);
    expect(recommendation.confidence).toBeLessThanOrEqual(1);
  });

  it("should detect system stress", async () => {
    const stressCheck = await systemResourceMonitor.isSystemUnderStress();

    expect(stressCheck).toBeDefined();
    expect(typeof stressCheck.stressed).toBe("boolean");
    expect(Array.isArray(stressCheck.reasons)).toBe(true);
    expect(["low", "medium", "high", "critical"]).toContain(
      stressCheck.severity
    );
  });

  it("should start and stop resource monitoring", () => {
    // Start monitoring
    systemResourceMonitor.startMonitoring(1000);

    // Should not throw when starting again
    expect(() => {
      systemResourceMonitor.startMonitoring(1000);
    }).not.toThrow();

    // Stop monitoring
    systemResourceMonitor.stopMonitoring();

    // Should not throw when stopping again
    expect(() => {
      systemResourceMonitor.stopMonitoring();
    }).not.toThrow();
  });

  it("should generate resource report", async () => {
    // Start monitoring to collect some data
    systemResourceMonitor.startMonitoring(100);

    // Wait for at least one sample and force initial collection
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Force metrics collection
    await systemResourceMonitor.getCurrentMetrics();

    const report = systemResourceMonitor.generateResourceReport();

    expect(typeof report).toBe("string");
    expect(report.length).toBeGreaterThan(0);
    // Should contain either the report or the no metrics message
    expect(report).toMatch(
      /System Resource Report|No resource metrics available/
    );

    systemResourceMonitor.stopMonitoring();
  });

  it("should handle resource controller functionality", async () => {
    // Test resource controller without actually running commands
    const resourceController = await import("./ResourceController");
    const controller = resourceController.resourceController;

    // Test that resource limits are enforced
    const canStart = await controller.canStartProcess();
    expect(typeof canStart).toBe("boolean");

    // Test resource limit updates
    const originalLimits = controller.getLimits();
    expect(originalLimits).toBeDefined();
    expect(typeof originalLimits.maxConcurrentProcesses).toBe("number");

    // Test updating limits
    controller.updateLimits({ maxConcurrentProcesses: 2 });
    const updatedLimits = controller.getLimits();
    expect(updatedLimits.maxConcurrentProcesses).toBe(2);

    // Reset to original
    controller.updateLimits(originalLimits);
  });

  it("should generate execution report", async () => {
    const mockResult = {
      success: true,
      duration: 5000,
      testCount: 10,
      passedCount: 8,
      failedCount: 1,
      skippedCount: 1,
      performance: {
        totalDuration: 5000,
        setupDuration: 500,
        executionDuration: 4000,
        teardownDuration: 500,
        averageTestDuration: 400,
        memoryPeak: 100,
        memoryAverage: 80,
        cpuUsage: 50,
      },
      resourceUsage: {
        initialStats: {
          totalProcesses: 10,
          bunProcesses: 1,
          vitestProcesses: 0,
          totalCpuPercent: 20,
          totalMemoryMB: 500,
          systemLoad: 1.0,
        },
        peakStats: {
          totalProcesses: 15,
          bunProcesses: 2,
          vitestProcesses: 1,
          totalCpuPercent: 60,
          totalMemoryMB: 800,
          systemLoad: 2.0,
        },
        finalStats: {
          totalProcesses: 10,
          bunProcesses: 1,
          vitestProcesses: 0,
          totalCpuPercent: 25,
          totalMemoryMB: 520,
          systemLoad: 1.1,
        },
        processCount: 1,
        maxProcessCount: 2,
        systemLoadAverage: 1.5,
        memoryLeaks: false,
      },
      errors: ["Sample error"],
      warnings: ["Sample warning"],
    };

    const report = testExecutor.generateExecutionReport(mockResult);

    expect(typeof report).toBe("string");
    expect(report.length).toBeGreaterThan(0);
    expect(report).toContain("Test Execution Report");
    expect(report).toContain("✅ PASSED");
    expect(report).toContain("Performance Metrics");
    expect(report).toContain("Resource Usage");
  });

  it("should validate TestExecutor methods exist", () => {
    // Test that all expected methods exist without calling them
    expect(typeof testExecutor.runSingleTest).toBe("function");
    expect(typeof testExecutor.runTestSuite).toBe("function");
    expect(typeof testExecutor.runWithAdaptiveConcurrency).toBe("function");
    expect(typeof testExecutor.generateExecutionReport).toBe("function");
  });

  it("should validate SystemResourceMonitor methods exist", () => {
    // Test that all expected methods exist
    expect(typeof systemResourceMonitor.startMonitoring).toBe("function");
    expect(typeof systemResourceMonitor.stopMonitoring).toBe("function");
    expect(typeof systemResourceMonitor.getCurrentMetrics).toBe("function");
    expect(typeof systemResourceMonitor.getConcurrencyRecommendation).toBe(
      "function"
    );
    expect(typeof systemResourceMonitor.isSystemUnderStress).toBe("function");
    expect(typeof systemResourceMonitor.generateResourceReport).toBe(
      "function"
    );
  });
});
