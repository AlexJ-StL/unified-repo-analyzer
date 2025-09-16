#!/usr/bin/env bun
declare global {
  interface ImportMeta {
    main: boolean;
  }
}
/**
 * Background Bun Process Monitor Service
 * Runs continuously to prevent runaway processes
 */

import { BunProcessManager } from './fix-runaway-bun.js';

async function startService() {
  console.log('🚀 Starting Bun Monitor Service...');

  const manager = new BunProcessManager();
  await manager.initialize();

  // Start monitoring
  await manager.startMonitoring();

  // Keep the service running
  console.log('✅ Bun Monitor Service is running');
  console.log('   Press Ctrl+C to stop');

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down Bun Monitor Service...');
    await manager.stopMonitoring();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down Bun Monitor Service...');
    await manager.stopMonitoring();
    process.exit(0);
  });

  // Keep alive
  setInterval(() => {
    // Just keep the process alive
  }, 60000);
}

if (import.meta.main) {
  startService().catch(console.error);
}
