// /database.js
import mongoose from 'mongoose';
import config from './config/config.js';

mongoose
  .connect(config.mongo_url)
  .then(() => console.log('Conexion exitosa'))
  .catch((error) => console.log('Error en la conexion', error));
