import { ERROR_TYPES } from './enum.js';

class CustomError extends Error {
  constructor({
    name = 'Error',
    cause = 'Unknown',
    message,
    code = ERROR_TYPES.GENERIC_ERROR,
  }) {
    super(message);
    this.name = name;
    this.cause = cause;
    this.code = code;
  }

  static createError({
    name = 'Error',
    cause = 'Unknown',
    message,
    type = 'GENERIC_ERROR',
  }) {
    const code = ERROR_TYPES[type];
    if (!code) {
      throw new Error(`Error type ${type} is not defined in EErrors`);
    }
    return new CustomError({ name, cause, message, code });
  }
}

export default CustomError;
