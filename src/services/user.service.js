import DAOFactory from '../dao/daoFactory.js';
import { generateToken } from '../controllers/auth-manager.js';
import config from '../config/config.js';
import generateResetToken from '../utils/tokenReset.js';
import EmailService from './email.services.js';
const emailManager = new EmailService();
import bcrypt from 'bcrypt';

const userDAO = DAOFactory.getDAO('users', config.data_source);

export const registerUser = async (userData) => {
  console.log('Registering user:', userData);
  const user = await userDAO.createUser(userData);
  const token = generateToken(user);
  return { user, token };
};

export const getUserProfile = async (userId) => {
  console.log('Fetching user profile for ID:', userId);
  const user = await userDAO.getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// Nueva función para obtener solo la información necesaria del usuario
export const getCurrentUser = async (email) => {
  console.log('Fetching current user for email:', email);
  const user = await userDAO.getUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }
  // Devuelve solo la información necesaria
  const { first_name, last_name, email: userEmail, role } = user;
  console.log('Current user data:', { first_name, last_name, userEmail, role });
  return { first_name, last_name, userEmail, role };
};

// Función para solicitar la restauración de contraseña
export const requestPasswordReset = async (email) => {
  const user = await userDAO.getUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  const token = generateResetToken();
  const expire = new Date();
  expire.setHours(expire.getHours() + 1); // Token válido por 1 hora

  user.resetToken = { token, expire };
  await user.save();

  // Enviar el correo electrónico con el enlace para restablecer la contraseña
  await emailManager.sendEmailToResetPassword(
    user.email,
    user.first_name,
    `${config.front_url}/validate-code?token=${token}`
  );
};

// Función para resetear la contraseña
export const resetPassword = async (token, newPassword) => {
  const user = await userDAO.getUserByResetToken(token);
  if (!user) {
    throw new Error('Invalid or expired token');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = null; // Eliminar el token después de usarlo
  await user.save();
};

// Función para cambiar el rol del usuario
export const toggleUserRole = async (userId) => {
  const user = await userDAO.getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.role = user.role === 'user' ? 'premium' : 'user';
  await user.save();

  return user;
};

export const getAllUsers = async () => {
  return await userDAO.getAllUsers();
};

export const createUser = async (userData) => {
  return await userDAO.createUser(userData);
};

export const updateUserById = async (userId, updateData) => {
  return await userDAO.updateUserById(userId, updateData);
};

export const deleteUserById = async (userId) => {
  return await userDAO.deleteUserById(userId);
};
