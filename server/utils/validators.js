import mongoose from 'mongoose';

export const isValidEmail = (value) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const isPlainString = (value) => typeof value === 'string' && value.trim().length > 0;

export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

export const clean = (value, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export function validatePassword(value) {
  if (!isPlainString(value)) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters long';
  if (value.length > 128) return 'Password must be 128 characters or fewer';
  return null;
}

export function validateCredentials({ name, email, password }) {
  const errors = {};
  if (!isPlainString(name) || name.trim().length < 2) errors.name = 'Name must be at least 2 characters long';
  if (!isValidEmail(email)) errors.email = 'A valid email address is required';
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  return { valid: Object.keys(errors).length === 0, errors };
}
