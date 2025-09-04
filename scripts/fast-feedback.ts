#!/usr/bin/env bun

/**
 * Fast Feedback Test Runner
 * Runs tests in optimized order for quick feedback
 */

import { execSync } from 'node:child_process';

const plan = {
  "batches": [],
  "totalEstimatedDuration": 0,
  "strategy": "sequential",
  "maxConcurrency": 1
};

async function runFastFeedback() {
  console.log('⚡ Running fast feedback tests...');
  
  const startTime = Date.now();
  let failedBatches = 0;
  
  try {
    if (plan.strategy === 'sequential') {
      // Run batches sequentially
      for (const batch of plan.batches) {
        console.log(`🧪 Running ${batch.id} (${batch.files.length} tests)...`);
        
        const testPaths = batch.files.map(f => f.relativePath).join(' ');
        
        try {
          execSync(`bun test ${testPaths} --maxConcurrency=1`, {
            stdio: 'inherit',
            timeout: batch.estimatedDuration + 10000, // Add 10s buffer
          });
          console.log(`✅ ${batch.id} completed`);
        } catch (error) {
          console.error(`❌ ${batch.id} failed`);
          failedBatches++;
          
          // Fast fail for critical failures
          if (batch.priority > 80) {
            console.log('🚨 High priority batch failed, stopping execution');
            break;
          }
        }
      }
    } else {
      // Run high-priority batch first for fast feedback
      const highPriorityBatch = plan.batches
        .filter(b => b.priority > 70)
        .sort((a, b) => b.priority - a.priority)[0];
      
      if (highPriorityBatch) {
        console.log(`🚀 Running high-priority batch first: ${highPriorityBatch.id}`);
        
        const testPaths = highPriorityBatch.files.map(f => f.relativePath).join(' ');
        
        try {
          execSync(`bun test ${testPaths} --maxConcurrency=1`, {
            stdio: 'inherit',
            timeout: highPriorityBatch.estimatedDuration + 10000,
          });
          console.log('✅ High-priority tests passed, continuing with remaining tests...');
        } catch (error) {
          console.error('❌ High-priority tests failed, check critical functionality');
          failedBatches++;
        }
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`\n📊 Fast feedback completed in ${(duration / 1000).toFixed(1)}s`);
    console.log(`Batches: ${plan.batches.length - failedBatches}/${plan.batches.length} passed`);
    
    if (failedBatches === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log(`⚠️ ${failedBatches} batch(es) failed`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Fast feedback execution failed:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  await runFastFeedback();
}
