#!/usr/bin/env bun
/**
 * Emergency cleanup script for test processes
 * Can be run manually or automatically when tests get stuck
 */

import { emergencyCleanup, resourceController } from '../tests/ResourceController';

async function main() {
  const command = process.argv[2] || 'cleanup';

  switch (command) {
    case 'cleanup':
      console.log('🧹 Starting emergency cleanup...');
      await emergencyCleanup();
      break;

    case 'status': {
      console.log('📊 Getting resource status...');
      const stats = await resourceController.getResourceStats();
      console.log('Resource Statistics:');
      console.log(`  Total processes: ${stats.totalProcesses}`);
      console.log(`  Bun processes: ${stats.bunProcesses}`);
      console.log(`  Vitest processes: ${stats.vitestProcesses}`);
      console.log(`  CPU usage: ${stats.totalCpuPercent}%`);
      console.log(`  Memory usage: ${stats.totalMemoryMB}MB`);
      console.log(`  System load: ${stats.systemLoad}`);
      break;
    }

    case 'monitor':
      console.log('👀 Starting resource monitoring...');
      resourceController.startMonitoring(2000);
      console.log('Press Ctrl+C to stop monitoring');

      // Keep the process alive
      process.on('SIGINT', () => {
        console.log('\n🛑 Stopping monitoring...');
        resourceController.stopMonitoring();
        process.exit(0);
      });

      // Prevent the script from exiting
      setInterval(() => {}, 1000);
      break;

    case 'limits': {
      console.log('⚙️  Current resource limits:');
      const limits = resourceController.getLimits();
      console.log(`  Max concurrent processes: ${limits.maxConcurrentProcesses}`);
      console.log(`  Max CPU percent: ${limits.maxCpuPercent}%`);
      console.log(`  Max memory: ${limits.maxMemoryMB}MB`);
      console.log(`  Process timeout: ${limits.processTimeout}ms`);
      break;
    }

    default:
      console.log('Usage: bun run cleanup:processes [command]');
      console.log('Commands:');
      console.log('  cleanup  - Emergency cleanup of all test processes (default)');
      console.log('  status   - Show current resource usage');
      console.log('  monitor  - Start continuous resource monitoring');
      console.log('  limits   - Show current resource limits');
      process.exit(1);
  }
}

main().catch((_error) => {
  process.exit(1);
});
