import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { validateCredentials, isValidEmail, isPlainString } from '../utils/validators.js';

export async function register(req, res) {
  const { name, email, password } = req.body ?? {};

  const { valid, errors } = validateCredentials({ name, email, password });
  if (!valid) {
    return res.status(400).json({ success: false, message: 'Please fix the highlighted fields.', errors });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const user = await User.create({ name: name.trim(), email: normalizedEmail, password });

  return res.status(201).json({
    success: true,
    data: { user: user.toPublicJSON(), token: signToken(user._id) },
  });
}

export async function login(req, res) {
  const { email, password } = req.body ?? {};

  if (!isValidEmail(email) || !isPlainString(password)) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  return res.json({
    success: true,
    data: { user: user.toPublicJSON(), token: signToken(user._id) },
  });
}

export async function getMe(req, res) {
  return res.json({ success: true, data: { user: req.user.toPublicJSON() } });
}
