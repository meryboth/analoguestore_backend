// routes/session.router.js

import express from 'express';
import passport from 'passport';
import {
  loginUser,
  logoutUser,
  githubLogin,
} from '../services/session.service.js';
import config from '../config/config.js';

const router = express.Router();

// Ruta de login de usuario
router.post(
  '/login',
  passport.authenticate('login', { session: false }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(400).json({ error: 'Login failed' });
      }
      const token = loginUser(req.user);

      // Guardar token en una cookie segura y persistente
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: false, // Cambia a true en producción con HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
      });

      return res.json({ token, user: req.user });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

// Ruta de logout de usuario
router.get('/logout', (req, res) => {
  try {
    logoutUser(res);
    return res.json({ message: 'Logout successful' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Ruta para autenticarse con Github
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  async (req, res) => {}
);

// Callback de autenticación de Github
router.get(
  '/githubcallback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      console.log('Authenticated User after GitHub callback:', req.user);
      const token = githubLogin(req.user);
      console.log('Generated Token:', token);
      res.redirect(`${config.front_url}/github-callback?token=${token}`);
    } catch (error) {
      console.error('Error in GitHub callback:', error);
      return res.status(500).json({ error: error.message });
    }
  }
);

export default router;
