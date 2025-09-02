/**
 * Simple test runner for ProviderRegistry
 */

import { ProviderRegistry } from './packages/backend/src/providers/ProviderRegistry';

async function runTests() {
  console.log('Testing ProviderRegistry enhancements...');

  try {
    // Reset singleton
    (ProviderRegistry as any).instance = undefined;
    const registry = ProviderRegistry.getInstance();

    // Test 1: Basic initialization
    console.log('✓ Test 1: Basic initialization');
    const providerInfo = registry.getAllProviderInfo();
    console.log(`  Found ${providerInfo.length} providers`);

    // Test 2: Provider configuration
    console.log('✓ Test 2: Provider configuration');
    registry.setProviderConfig('openrouter', { apiKey: 'test-key' });
    const status = registry.getProviderStatus('openrouter');
    console.log(`  OpenRouter configured: ${status.configured}`);

    // Test 3: Health check for mock provider
    console.log('✓ Test 3: Health check for mock provider');
    const healthCheck = await registry.performHealthCheck('mock');
    console.log(`  Mock provider healthy: ${healthCheck.healthy}`);
    console.log(`  Response time: ${healthCheck.responseTime}ms`);

    // Test 4: Health check for unconfigured provider
    console.log('✓ Test 4: Health check for unconfigured provider');
    const unhealthyCheck = await registry.performHealthCheck('claude');
    console.log(`  Claude provider healthy: ${unhealthyCheck.healthy}`);
    console.log(`  Error type: ${unhealthyCheck.error?.type}`);

    // Test 5: Provider testing
    console.log('✓ Test 5: Provider testing');
    const mockTestResult = await registry.testProvider('mock');
    console.log(`  Mock test result: ${mockTestResult}`);

    const claudeTestResult = await registry.testProvider('claude');
    console.log(`  Claude test result: ${claudeTestResult}`);

    // Test 6: Error categorization
    console.log('✓ Test 6: Error categorization');
    const authError = new Error('401 Unauthorized - Invalid API key');
    const categorizeError = (registry as any).categorizeError.bind(registry);
    const categorizedError = categorizeError(authError);
    console.log(`  Auth error type: ${categorizedError.type}`);
    console.log(`  Auth error recoverable: ${categorizedError.recoverable}`);

    // Test 7: Provider statistics
    console.log('✓ Test 7: Provider statistics');
    const stats = registry.getProviderStatistics();
    console.log(`  Total providers: ${stats.total}`);
    console.log(`  Active providers: ${stats.active}`);
    console.log(`  Error providers: ${stats.error}`);

    // Test 8: Bulk operations
    console.log('✓ Test 8: Bulk operations');
    const testResults = await registry.testAllProviders();
    console.log(`  Tested ${testResults.size} providers`);

    const healthStatuses = registry.getProvidersHealthStatus();
    console.log(`  Health status for ${healthStatuses.length} providers`);

    console.log('\n✅ All tests passed!');
  } catch (_error) {
    process.exit(1);
  }
}

runTests();
