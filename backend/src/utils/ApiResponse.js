export class ApiResponse {
  constructor(success, message, data = {}, error = null) {
    this.success = success;
    this.message = message;
    this.data = data;
    if (error) {
      this.error = error;
    }
  }

  static success(res, message = 'Request successful', data = {}, statusCode = 200) {
    const response = new ApiResponse(true, message, data);
    return res.status(statusCode).json(response);
  }

  static error(res, message = 'Something went wrong', errorCode = 'INTERNAL_SERVER_ERROR', details = [], statusCode = 500) {
    const response = new ApiResponse(false, message, {}, {
      code: errorCode,
      details: Array.isArray(details) ? details : [details]
    });
    return res.status(statusCode).json(response);
  }
}

export default ApiResponse;
