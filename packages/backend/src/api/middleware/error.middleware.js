/**
 * Error handling middleware
 */
/**
 * Custom API error class
 */
export class ApiError extends Error {
    status;
    errors;
    constructor(status, message, errors) {
        super(message);
        this.status = status;
        this.errors = errors;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
/**
 * Not found error handler
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export const notFound = (req, res, next) => {
    const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
    next(error);
};
/**
 * General error handler
 *
 * @param err - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export const errorHandler = (err, req, res, _next) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const error = {
        status: err instanceof ApiError ? err.status : 500,
        message: err.message || 'Internal Server Error',
    };
    // Add stack trace in development
    if (isDevelopment) {
        error.stack = err.stack;
    }
    // Add validation errors if available
    if (err instanceof ApiError && err.errors) {
        error.errors = err.errors;
    }
    // Log error
    console.error(`[ERROR] ${req.method} ${req.path}:`, error);
    // Send error response
    res.status(error.status).json(error);
};
//# sourceMappingURL=error.middleware.js.map