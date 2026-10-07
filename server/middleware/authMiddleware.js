import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Authentication required: missing Bearer token.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid authentication token.';
    return res.status(401).json({ success: false, message });
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    return res.status(401).json({ success: false, message: 'This account no longer exists.' });
  }

  req.user = user;
  return next();
}

export default protect;
