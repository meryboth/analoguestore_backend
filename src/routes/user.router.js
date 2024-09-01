import express from 'express';
import passport from 'passport';
import { authenticateJWT, isAdmin } from '../middlewares/auth.js';
import {
  registerUser,
  getUserProfile,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  toggleUserRole,
  getAllUsers,
  updateUserById,
  deleteUserById,
  createUser,
} from '../services/user.service.js';
import { userGenerator } from '../utils/userGenerator.js';
import CustomError from '../services/errors/customError.js';
import { ERROR_TYPES } from '../services/errors/enum.js';
import {
  generateUserError,
  generateAuthenticationError,
} from '../services/errors/info.js';

const router = express.Router();

// Faker para generar usuarios mock
router.get('/mock', (req, res) => {
  const users = [];
  for (let i = 0; i < 100; i++) {
    users.push(userGenerator());
  }
  res.send(users);
});

// Ruta de registro de usuario
router.post('/register', (req, res, next) => {
  passport.authenticate(
    'register',
    { session: false },
    async (err, user, info) => {
      if (err) {
        return next(
          CustomError.createError({
            name: 'Authentication Error',
            cause: generateAuthenticationError(),
            message: err.message,
            type: 'AUTHENTICATION_ERROR',
          })
        );
      }
      if (!user) {
        return res.status(400).json({ error: info.message });
      }
      try {
        const { token } = await registerUser(user);
        res.cookie('jwt', token, { httpOnly: true, secure: false });
        return res.json({ token, user });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }
  )(req, res, next);
});

// Ruta de perfil de usuario
router.get('/profile', authenticateJWT, async (req, res, next) => {
  try {
    const user = await getUserProfile(req.user.id);
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener la información actual del usuario
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      res.json(req.user); // Devuelve los datos del usuario autenticado
    } catch (error) {
      console.error('Error fetching current user:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// Ruta para obtener la información básica del usuario autenticado
router.get('/api/user-info', authenticateJWT, async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.email);
    res.json({
      first_name: user.first_name,
      last_name: user.last_name,
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return next(
      CustomError.createError({
        name: 'Database Error',
        cause: 'Error fetching user info',
        message: error.message,
        type: 'DATABASE_ERROR',
      })
    );
  }
});

// Ruta para solicitar restauración de contraseña
router.post('/resetpassword', async (req, res, next) => {
  const { email } = req.body;
  try {
    await requestPasswordReset(email);
    res
      .status(200)
      .json({ message: 'Correo de recuperación enviado con éxito.' });
  } catch (error) {
    next(error);
  }
});

router.post('/newpassword', async (req, res, next) => {
  const { token, password } = req.body;
  try {
    await resetPassword(token, password);
    res.status(200).json({ message: 'Contraseña restablecida con éxito.' });
  } catch (error) {
    next(error);
  }
});

router.post('/validatecode', async (req, res) => {
  const { code } = req.body;
  try {
    const user = await userDAO.getUserByResetToken(code);
    if (!user || user.resetToken.expire < new Date()) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }
    res.status(200).json({ message: 'Código válido' });
  } catch (error) {
    res.status(500).json({ error: 'Error en la validación del código' });
  }
});

/* Cambia el rol de user a premium y de premium a user */
router.patch('/premium/:pid', authenticateJWT, async (req, res, next) => {
  const { pid } = req.params;
  try {
    const updatedUser = await toggleUserRole(pid);
    res.json({ status: 'success', user: updatedUser });
  } catch (error) {
    next(error);
  }
});

// Obtener todos los usuarios (Solo admins)
router.get('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo usuario (Solo admins)
router.post('/', authenticateJWT, isAdmin, async (req, res, next) => {
  try {
    passport.authenticate(
      'register',
      { session: false },
      async (err, user, info) => {
        if (err) {
          return next(
            CustomError.createError({
              name: 'Authentication Error',
              cause: generateAuthenticationError(),
              message: err.message,
              type: 'AUTHENTICATION_ERROR',
            })
          );
        }
        if (!user) {
          return res.status(400).json({ error: info.message });
        }
        try {
          const { token } = await registerUser(user);
          return res.status(201).json({ token, user });
        } catch (error) {
          return res.status(500).json({ error: error.message });
        }
      }
    )(req, res, next);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un usuario por ID (Solo admins)
router.put('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const updatedUser = await updateUserById(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un usuario por ID (Solo admins)
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    await deleteUserById(req.params.id);
    res.status(204).send(); // No content
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
