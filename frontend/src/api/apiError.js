
export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
export const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Check your connection.';
export const AUTH_ERROR_MESSAGE = 'Your session has expired. Please log in again.';

export const normalizeApiError = (error) => {
  if (!error.response) {
    return {
      message: NETWORK_ERROR_MESSAGE,
      code: 'NETWORK_ERROR',
      status: 0,
      details: [],
      isNetworkError: true,
      isAuthError: false,
      isValidationError: false,
    };
  }

  const { status, data } = error.response;

  const message =
    (data && typeof data.message === 'string' && data.message) ||
    GENERIC_ERROR_MESSAGE;

  const code =
    (data && data.error && typeof data.error.code === 'string' && data.error.code) ||
    'UNKNOWN_ERROR';

  const details =
    (data && data.error && Array.isArray(data.error.details) && data.error.details) || [];

  return {
    message,
    code,
    status,
    details,
    isNetworkError: false,
    isAuthError: status === 401,
    isValidationError: status === 422,
  };
};

export default normalizeApiError;
