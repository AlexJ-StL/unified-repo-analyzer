# Vitest + Bun + Windows Compatibility Fix

## Problem

When running Vitest with Bun on Windows, you may encounter the following error:

```
TypeError: File URL path must be an absolute path
 ❯ directRequest node_modules/vite-node/dist/client.mjs:280:22
```

## Root Cause

The issue occurs in `node_modules/vite-node/dist/client.mjs` at line 280, where `pathToFileURL(modulePath).href` is called with a `modulePath` that is not an absolute path on Windows when using Bun.

Specifically, the problematic code is:

```javascript
const modulePath = cleanUrl(moduleId);
// disambiguate the `<UNIT>:/` on windows: see nodejs/node#31710
const href = pathToFileURL(modulePath).href;
```

The `modulePath` variable may contain a relative path, which causes `pathToFileURL()` to throw the "File URL path must be an absolute path" error on Windows.

## Solution

The fix involves patching the vite-node client to ensure that `modulePath` is always converted to an absolute path before being passed to `pathToFileURL()`.

### Automated Fix

Run the following script to automatically apply the patch:

```bash
bun scripts/fix-vitest-bun-windows.js
```

### Manual Fix

1. Open `node_modules/vite-node/dist/client.mjs`
2. Find the import line: `import { createRequire } from 'node:module';`
3. Add the following import on the next line:
   ```javascript
   import { resolve, dirname, isAbsolute } from "node:path";
   ```
4. Find the lines around line 277-280:
   ```javascript
   const modulePath = cleanUrl(moduleId);
   // disambiguate the `<UNIT>:/` on windows: see nodejs/node#31710
   const href = pathToFileURL(modulePath).href;
   ```
5. Replace with:
   ```javascript
   const modulePath = cleanUrl(moduleId);
   // Ensure absolute path for Windows+Bun compatibility
   const absoluteModulePath = isAbsolute(modulePath)
     ? modulePath
     : resolve(modulePath);
   // disambiguate the `<UNIT>:/` on windows: see nodejs/node#31710
   const href = pathToFileURL(absoluteModulePath).href;
   ```

## Testing

After applying the fix, you can test it by running:

```bash
bun vitest run tests/simple-test.test.ts
```

## Why This Works

The fix ensures that `pathToFileURL()` always receives an absolute path, which is required on Windows. The `isAbsolute()` function checks if the path is already absolute, and if not, `resolve()` converts it to an absolute path.

## Compatibility

This fix is specifically designed for:

- Windows operating system
- Bun runtime
- Vitest testing framework
- vite-node module version 3.2.4

The patch is safe and only affects Windows systems, as the issue does not occur on other platforms.

## Limitations

- The patch will be overwritten when vite-node is reinstalled or updated
- The fix needs to be reapplied after `bun install` or `npm install`
- This is a workaround for a compatibility issue that should ideally be fixed upstream
