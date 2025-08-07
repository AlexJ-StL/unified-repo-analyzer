# Type Resolution Guide

This document explains the type resolution strategy implemented in the Unified Repository Analyzer frontend to address common TypeScript errors related to undefined types and variables.

## Problem Statement

The frontend codebase was experiencing several TypeScript errors related to undefined types and variables:

- 'React' is not defined
- 'NodeJS' is not defined
- 'window', 'Element', 'HTMLElement', 'HTMLDivElement' are not defined
- 'IntersectionObserverInit', 'IntersectionObserverEntry', 'IntersectionObserver' are not defined
- 'PerformanceNavigationTiming' is not defined
- 'AddEventListenerOptions' is not defined
- 'Image' is not defined

## Solution Strategy

### 1. TypeScript Configuration

The `tsconfig.json` file was already configured with the necessary lib references:

```json
"lib": ["ES2020", "DOM", "DOM.Iterable"]
```

This provides access to DOM types and ES2020 features.

### 2. Node.js Type Definitions

We installed `@types/node` as a devDependency to provide Node.js type definitions:

```bash
npm install --save-dev @types/node
```

This provides types like `NodeJS.Timeout` and other Node.js globals.

### 3. React Imports

We ensured that all `.ts` files that use React types have proper React imports:

```typescript
import React, { useState, useEffect } from 'react';
```

### 4. DOM Type Imports

For better clarity and type safety, we added explicit imports for DOM types in files that use them:

```typescript
// DOM types
import type { IntersectionObserverInit, IntersectionObserverEntry, IntersectionObserver } from 'typescript/lib/lib.dom';
import type { WindowEventMap, AddEventListenerOptions } from 'typescript/lib/lib.dom';
```

### 5. Type Guards

We created type guards for global objects to ensure type safety when accessing global variables:

```typescript
// src/utils/typeGuards.ts
export function isElement(value: any): value is Element {
  return value instanceof Element;
}

export function isHTMLElement(value: any): value is HTMLElement {
  return value instanceof HTMLElement;
}

export function isIntersectionObserverAvailable(): boolean {
  return typeof IntersectionObserver !== 'undefined';
}

export function isPerformanceAvailable(): boolean {
  return typeof performance !== 'undefined';
}

export function isWindowAvailable(): boolean {
  return typeof window !== 'undefined';
}

export function isBrowser(): boolean {
  return isWindowAvailable() && isDocumentAvailable();
}
```

## Usage Guidelines

### When to Use Type Guards

Use type guards when you need to ensure type safety when accessing global objects:

```typescript
import { isBrowser, isIntersectionObserverAvailable } from '../utils/typeGuards';

if (isBrowser() && isIntersectionObserverAvailable()) {
  // Safe to use IntersectionObserver
  const observer = new IntersectionObserver(callback);
}
```

### When to Import DOM Types

Import DOM types when you need to use them in type annotations:

```typescript
import type { IntersectionObserverInit, IntersectionObserverEntry } from 'typescript/lib/lib.dom';

export function useIntersectionObserver(options: IntersectionObserverInit = {}): {
  ref: React.RefCallback<Element>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
} {
  // Implementation
}
```

### Best Practices

1. Always import React in `.ts` files that use React types
2. Use explicit imports for DOM types when they are used in type annotations
3. Use type guards when accessing global objects that might not be available
4. Install `@types/node` when using Node.js types in the frontend
5. Rely on the TypeScript lib configuration for standard DOM and ES2020 types

## Verification

To verify the fixes, run Biome:

```bash
npm run lint
```

All type-related errors should be resolved.