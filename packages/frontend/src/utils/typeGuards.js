/**
 * Type guards for global objects in the Unified Repository Analyzer frontend
 */
/**
 * Check if a value is a DOM element
 */
export function isElement(value) {
    return value instanceof Element;
}
/**
 * Check if a value is an HTMLElement
 */
export function isHTMLElement(value) {
    return value instanceof HTMLElement;
}
/**
 * Check if a value is an HTMLDivElement
 */
export function isHTMLDivElement(value) {
    return value instanceof HTMLDivElement;
}
/**
 * Check if the IntersectionObserver API is available
 */
export function isIntersectionObserverAvailable() {
    return typeof IntersectionObserver !== 'undefined';
}
/**
 * Check if the Performance API is available
 */
export function isPerformanceAvailable() {
    return typeof performance !== 'undefined';
}
/**
 * Check if the window object is available
 */
export function isWindowAvailable() {
    return typeof window !== 'undefined';
}
/**
 * Check if we're running in a browser environment
 */
export function isBrowser() {
    return isWindowAvailable() && isDocumentAvailable();
}
/**
 * Check if the document object is available
 */
export function isDocumentAvailable() {
    return typeof document !== 'undefined';
}
//# sourceMappingURL=typeGuards.js.map