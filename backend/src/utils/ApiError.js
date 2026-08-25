export class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'INTERNAL_SERVER_ERROR', details = []) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = Array.isArray(details) ? details : [details];
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
