#!/usr/bin/env bun

/**
 * Test script to demonstrate enhanced ProviderRegistry functionality
 */

import { ProviderRegistry } from './packages/backend/src/providers/ProviderRegistry';

async function demonstrateEnhancedRegistry() {
  console.log('🚀 Testing Enhanced ProviderRegistry Functionality\n');

  const registry = ProviderRegistry.getInstance();

  // 1. Show initial provider status
  console.log('1. Initial Provider Status:');
  const initialInfo = registry.getAllProviderInfo();
  initialInfo.forEach((provider) => {
    console.log(
      `   ${provider.displayName}: ${provider.status} (configured: ${provider.configured})`
    );
  });

  // 2. Configure some providers
  console.log('\n2. Configuring Providers:');
  registry.setProviderConfig('mock', { apiKey: 'mock-key' });
  registry.setProviderConfig('openrouter', { apiKey: 'test-key' }); // Will fail
  console.log('   ✓ Configured mock and openrouter providers');

  // 3. Test provider health
  console.log('\n3. Testing Provider Health:');

  console.log('   Testing mock provider...');
  const mockResult = await registry.testProvider('mock');
  console.log(`   Mock provider test: ${mockResult ? '✅ PASSED' : '❌ FAILED'}`);

  console.log('   Testing openrouter provider...');
  const openrouterResult = await registry.testProvider('openrouter');
  console.log(`   OpenRouter provider test: ${openrouterResult ? '✅ PASSED' : '❌ FAILED'}`);

  // 4. Show updated status with health check results
  console.log('\n4. Updated Provider Status:');
  const updatedInfo = registry.getAllProviderInfo();
  updatedInfo.forEach((provider) => {
    const status = provider.status;
    const lastTested = provider.lastTested
      ? new Date(provider.lastTested).toLocaleTimeString()
      : 'Never';
    const errorMsg = provider.errorMessage ? ` (${provider.errorMessage})` : '';
    console.log(`   ${provider.displayName}: ${status} - Last tested: ${lastTested}${errorMsg}`);
  });

  // 5. Show provider statistics
  console.log('\n5. Provider Statistics:');
  const stats = registry.getProviderStatistics();
  console.log(`   Total: ${stats.total}`);
  console.log(`   Configured: ${stats.configured}`);
  console.log(`   Active: ${stats.active}`);
  console.log(`   Error: ${stats.error}`);
  console.log(`   Inactive: ${stats.inactive}`);

  // 6. Show providers needing attention
  console.log('\n6. Providers Needing Attention:');
  const needingAttention = registry.getProvidersNeedingAttention();
  if (needingAttention.length > 0) {
    needingAttention.forEach((provider) => {
      console.log(`   ⚠️  ${provider}`);
    });
  } else {
    console.log('   ✅ All providers are healthy');
  }

  // 7. Test error recovery
  console.log('\n7. Testing Error Recovery:');
  const openrouterStatus = registry.getProviderStatus('openrouter');
  if (openrouterStatus.error?.recoverable) {
    console.log('   Attempting recovery for openrouter...');
    const recoveryResult = await registry.attemptRecovery('openrouter', openrouterStatus.error);
    console.log(`   Recovery result: ${recoveryResult ? '✅ SUCCESS' : '❌ FAILED'}`);
  } else {
    console.log('   No recoverable errors found');
  }

  // 8. Test bulk operations
  console.log('\n8. Testing All Providers:');
  const allResults = await registry.testAllProviders();
  allResults.forEach((result, provider) => {
    console.log(`   ${provider}: ${result ? '✅ PASSED' : '❌ FAILED'}`);
  });

  // 9. Show health status summary
  console.log('\n9. Health Status Summary:');
  const healthStatuses = registry.getProvidersHealthStatus();
  healthStatuses.forEach((status) => {
    const responseTime = status.responseTime ? `${status.responseTime}ms` : 'N/A';
    console.log(
      `   ${status.name}: ${status.healthy ? '✅ Healthy' : '❌ Unhealthy'} (${responseTime})`
    );
  });

  console.log('\n🎉 Enhanced ProviderRegistry demonstration complete!');
}

// Run the demonstration
demonstrateEnhancedRegistry().catch(console.error);
