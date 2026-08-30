/**
 * Converts an Axios error into a short, user-friendly message.
 * Backend errors already come as { message, fieldErrors } - we fall back to
 * friendly copy when the server is unreachable or returns something unexpected.
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error?.response) {
    return 'Unable to reach the server. Check that the GymPilot API is running and try again.';
  }

  const { status, data } = error.response;

  if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }
    if (data.fieldErrors) {
      const first = Object.values(data.fieldErrors)[0];
      if (typeof first === 'string' && first) return first;
    }
  }

  if (status === 401) return 'Invalid email or password.';
  if (status === 409) return 'An account with this email already exists.';
  if (status >= 500) return 'The server is having issues right now. Please try again later.';

  return fallback;
}
