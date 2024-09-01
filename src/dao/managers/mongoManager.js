import mongoose from 'mongoose';
import config from '../../config/config.js';

class MongoManager {
  constructor() {
    this._connect();
  }

  _connect() {
    mongoose
      .connect(config.mongo_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log('Database connection successful');
      })
      .catch((err) => {
        console.error('Database connection error:', err);
      });
  }

  get connection() {
    return mongoose.connection;
  }
}

const mongoManagerInstance = new MongoManager();
export default mongoManagerInstance;
