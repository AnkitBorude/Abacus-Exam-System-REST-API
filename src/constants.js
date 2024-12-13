import config from 'config';

export const DB_NAME = config.get('DB.name');
export const MIN_USERNAME_LENGTH = 8;
export const MAX_USERNAME_LENGTH = 16;

export const HTTP_STATUS_CODES = {
    BAD_REQUEST: {
        code: 400,
        message:
            'Bad Request - The server cannot process the request due to client error.',
    },
    UNAUTHORIZED: {
        code: 401,
        message:
            'Unauthorized - Authentication is required to access this resource.',
    },
    FORBIDDEN: {
        code: 403,
        message:
            'Forbidden - You do not have permission to access this resource.',
    },
    NOT_FOUND: {
        code: 404,
        message: 'Not Found - The requested resource could not be found.',
    },
    METHOD_NOT_ALLOWED: {
        code: 405,
        message:
            'Method Not Allowed - The HTTP method is not allowed for this resource.',
    },
    NOT_ACCEPTABLE: {
        code: 406,
        message:
            "Not Acceptable - The server cannot generate a response matching the 'Accept' header.",
    },
    REQUEST_TIMEOUT: {
        code: 408,
        message:
            'Request Timeout - The client did not send a request in the expected timeframe.',
    },
    CONFLICT: {
        code: 409,
        message:
            "Conflict - The request conflicts with the server's current state.",
    },
    GONE: {
        code: 410,
        message: 'Gone - The requested resource is no longer available.',
    },
    UNSUPPORTED_MEDIA_TYPE: {
        code: 415,
        message:
            'Unsupported Media Type - The request payload is in an unsupported format.',
    },
    UNPROCESSABLE_ENTITY: {
        code: 422,
        message:
            'Unprocessable Entity - The server understands the request but cannot process it.',
    },
    TOO_MANY_REQUESTS: {
        code: 429,
        message:
            'Too Many Requests - The client has sent too many requests in a given period.',
    },
};
