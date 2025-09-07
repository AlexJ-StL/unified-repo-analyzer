import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

// Test different path formats
const testPaths = [
  './tests/simple-test.test.ts',
  'tests/simple-test.test.ts',
  '/tests/simple-test.test.ts',
  'C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/tests/simple-test.test.ts'
];

testPaths.forEach(path => {
  try {
    console.log(`Testing path: ${path}`);
    const resolved = resolve(path);
    console.log(`Resolved: ${resolved}`);
    const url = pathToFileURL(resolved);
    console.log(`URL: ${url.href}`);
    console.log('---');
  } catch (error) {
    console.error(`Error with path ${path}:`, error.message);
    console.log('---');
  }
});