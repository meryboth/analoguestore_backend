import MongoManager from '../managers/mongoManager.js';
import { userSchema } from '../../models/user.model.js';

class UserDAO {
  constructor() {
    this.model = MongoManager.connection.model('users', userSchema);
    console.log('UserDAO using MongoDB');
  }

  // Crear usuario
  async createUser(userData) {
    console.log('Creating user:', userData);
    const user = new this.model(userData);
    return await user.save();
  }

  // Obtener todos los usuarios
  async getAllUsers() {
    return await this.model.find({});
  }

  // Obtener usuario por ID
  async getUserById(userId) {
    return await this.model.findById(userId).populate('cart');
  }

  // Obtener usuario por email
  async getUserByEmail(email) {
    return await this.model.findOne({ email }).populate('cart');
  }

  // Actualizar usuario por ID
  async updateUserById(userId, updateData) {
    return await this.model.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
  }

  // Eliminar usuario por ID
  async deleteUserById(userId) {
    return await this.model.findByIdAndDelete(userId);
  }

  // Obtener usuario por token de restablecimiento
  async getUserByResetToken(token) {
    return await this.model.findOne({ 'resetToken.token': token });
  }
}

export default UserDAO;
