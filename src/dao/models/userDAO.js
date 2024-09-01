import MongoManager from '../managers/mongoManager.js';
import FileSystemManager from '../managers/filesystemManager.js';
import { userSchema } from '../../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';

class UserDAO {
  constructor(dataSource) {
    if (dataSource === 'mongo') {
      this.model = MongoManager.connection.model('users', userSchema);
    } else if (dataSource === 'fileSystem') {
      this.fileSystem = FileSystemManager;
      this.filePath = 'users.json';
      this._ensureFileExists();
    }
    console.log(`UserDAO initialized with dataSource: ${dataSource}`);
  }

  _ensureFileExists() {
    const fullPath = this.fileSystem._getPath(this.filePath);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, JSON.stringify([]));
      console.log('Created file at:', fullPath);
    }
  }

  // Crear usuario
  async createUser(userData) {
    console.log('Creating user:', userData);
    if (this.model) {
      const user = new this.model(userData);
      return await user.save();
    } else if (this.fileSystem) {
      const users = (await this.fileSystem.readFile(this.filePath)) || [];
      const newUser = { _id: uuidv4(), ...userData };
      users.push(newUser);
      await this.fileSystem.writeFile(this.filePath, users);
      return newUser;
    }
  }

  // Obtener todos los usuarios
  async getAllUsers() {
    if (this.model) {
      return await this.model.find({});
    } else if (this.fileSystem) {
      return (await this.fileSystem.readFile(this.filePath)) || [];
    }
  }

  // Obtener usuario por ID
  async getUserById(userId) {
    if (this.model) {
      return await this.model.findById(userId).populate('cart');
    } else if (this.fileSystem) {
      const users = (await this.fileSystem.readFile(this.filePath)) || [];
      return users.find((user) => user._id === userId);
    }
  }

  // Obtener usuario por email
  async getUserByEmail(email) {
    if (this.model) {
      return await this.model.findOne({ email }).populate('cart');
    } else if (this.fileSystem) {
      const users = (await this.fileSystem.readFile(this.filePath)) || [];
      return users.find((user) => user.email === email);
    }
  }

  // Actualizar usuario por ID
  async updateUserById(userId, updateData) {
    if (this.model) {
      return await this.model.findByIdAndUpdate(userId, updateData, {
        new: true,
      });
    } else if (this.fileSystem) {
      const users = (await this.fileSystem.readFile(this.filePath)) || [];
      const userIndex = users.findIndex((user) => user._id === userId);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updateData };
        await this.fileSystem.writeFile(this.filePath, users);
        return users[userIndex];
      }
    }
  }

  // Eliminar usuario por ID
  async deleteUserById(userId) {
    if (this.model) {
      return await this.model.findByIdAndDelete(userId);
    } else if (this.fileSystem) {
      let users = (await this.fileSystem.readFile(this.filePath)) || [];
      users = users.filter((user) => user._id !== userId);
      await this.fileSystem.writeFile(this.filePath, users);
      return true;
    }
  }

  // Obtener usuario por token de restablecimiento
  async getUserByResetToken(token) {
    if (this.model) {
      return await this.model.findOne({ 'resetToken.token': token });
    } else if (this.fileSystem) {
      const users = (await this.fileSystem.readFile(this.filePath)) || [];
      return users.find((user) => user.resetToken.token === token);
    }
  }
}

export default UserDAO;
