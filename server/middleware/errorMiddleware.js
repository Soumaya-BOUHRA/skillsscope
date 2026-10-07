import multer from 'multer';
import { MAX_FILE_SIZE, ALLOWED_EXTENSIONS } from './uploadMiddleware.js';

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, _req, res, _next) {
  const explicitStatus = err.statusCode || err.status;
  let status = explicitStatus || 500;
  let message = err.message || 'Unexpected server error.';
  let errors;

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      status = 413;
      message = `File is too large. Maximum size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB.`;
    } else if (err.code === 'UNSUPPORTED_FILE_TYPE') {
      status = 415;
      message = err.message;
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      status = 400;
      message = `Unexpected file field. Use the "resume" field.`;
    } else {
      status = 400;
      message = `Upload error: ${err.message}`;
    }
  } else if (err.name === 'ValidationError') {
    status = 400;
    errors = Object.fromEntries(Object.entries(err.errors).map(([key, value]) => [key, value.message]));
    message = 'Some fields are invalid.';
  } else if (err.code === 11000) {
    status = 409;
    message = 'An account with this email already exists.';
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid identifier for "${err.path}".`;
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid authentication token.';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Your session has expired. Please log in again.';
  } else if (!explicitStatus && err.code === 'AI_SERVICE_ERROR') {
    status = 502;
  } else if (!explicitStatus && err.code === 'AI_INVALID_RESPONSE') {
    status = 502;
  } else if (!explicitStatus && err.code === 'EMPTY_DOCUMENT') {
    status = 422;
  } else if (!explicitStatus && err.code === 'OCR_FAILED') {
    status = 422;
  } else if (!explicitStatus && status >= 500) {
    message = 'The server could not complete this request. Please try again.';
  }

  if (status >= 500) console.error('[error]', err);

  res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(status >= 500 && process.env.NODE_ENV !== 'production' ? { detail: err.message } : {}),
  });
}

export const supportedExtensions = ALLOWED_EXTENSIONS;
export default errorHandler;
