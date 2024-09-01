import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const JWT_SECRET = config.jwt_secret;

export const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  return token;
};
