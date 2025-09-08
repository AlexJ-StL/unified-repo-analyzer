import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Test different path formats
const testPaths = [
  './tests/simple-test.test.ts',
  'tests/simple-test.test.ts',
  '/tests/simple-test.test.ts',
  'C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/tests/simple-test.test.ts',
];

testPaths.forEach((path) => {
  try {
    console.log(`Testing path: ${path}`);
    const resolved = resolve(path);
    console.log(`Resolved: ${resolved}`);
    const url = pathToFileURL(resolved);
    console.log(`URL: ${url.href}`);
    console.log('---');
  } catch (_error) {
    console.log('---');
  }
});
