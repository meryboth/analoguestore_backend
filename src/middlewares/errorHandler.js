import { ERROR_TYPES } from '../services/errors/enum.js';

const errorHandler = (error, req, res, next) => {
  console.error(`Error caught by middleware: ${error.cause}`);

  let statusCode;
  let response = {
    status: 'error',
    code: error.code,
    error: error.name,
    message: error.message,
    cause: error.cause,
  };

  switch (error.code) {
    case ERROR_TYPES.ROUTING_ERROR:
      statusCode = 404;
      response.message = 'Route not found';
      break;
    case ERROR_TYPES.INVALID_TYPES_ERROR:
      statusCode = 400;
      response.message = response.message || 'Invalid data type provided';
      break;
    case ERROR_TYPES.DATABASE_ERROR:
      statusCode = 500;
      response.message = response.message || 'Database error occurred';
      break;
    case ERROR_TYPES.GENERIC_ERROR:
      statusCode = 500;
      response.message = response.message || 'An unexpected error occurred';
      break;
    default:
      statusCode = 500;
      response.message = response.message || 'An unhandled error occurred';
      break;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
