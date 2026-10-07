import jwt from 'jsonwebtoken';

const getSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET is missing or too short (minimum 16 characters).');
  }
  return secret;
};

export function signToken(userId, expiresIn = process.env.JWT_EXPIRES_IN || '7d') {
  return jwt.sign({ sub: String(userId) }, getSecret(), { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

export default { signToken, verifyToken };
