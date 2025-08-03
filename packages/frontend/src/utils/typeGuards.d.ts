/**
 * Type guards for global objects in the Unified Repository Analyzer frontend
 */
/**
 * Check if a value is a DOM element
 */
export declare function isElement(value: any): value is Element;
/**
 * Check if a value is an HTMLElement
 */
export declare function isHTMLElement(value: any): value is HTMLElement;
/**
 * Check if a value is an HTMLDivElement
 */
export declare function isHTMLDivElement(value: any): value is HTMLDivElement;
/**
 * Check if the IntersectionObserver API is available
 */
export declare function isIntersectionObserverAvailable(): boolean;
/**
 * Check if the Performance API is available
 */
export declare function isPerformanceAvailable(): boolean;
/**
 * Check if the window object is available
 */
export declare function isWindowAvailable(): boolean;
/**
 * Check if we're running in a browser environment
 */
export declare function isBrowser(): boolean;
/**
 * Check if the document object is available
 */
export declare function isDocumentAvailable(): boolean;
