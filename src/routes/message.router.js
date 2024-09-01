import express from 'express';
import { MessageModel } from '../models/message.model.js';

const router = express.Router();

// Obtener todos los mensajes
router.get('/', async (req, res) => {
  try {
    const messages = await MessageModel.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error al obtener los mensajes:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Enviar un mensaje
router.post('/', async (req, res) => {
  try {
    const newMessage = new MessageModel(req.body);
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
    res.status(500).send('Error interno del servidor');
  }
});

export default router;
