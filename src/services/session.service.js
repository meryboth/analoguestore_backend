// services/session.service.js
import jwt from 'jsonwebtoken';
import configObject from '../config/config.js';

const JWT_SECRET = configObject.jwt_secret;

export const loginUser = (user) => {
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: '1h',
  });
  return token;
};

export const logoutUser = (res) => {
  res.clearCookie('jwt');
};

export const githubLogin = (user) => {
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: '1h',
  });
  return token;
};
