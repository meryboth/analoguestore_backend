import express from 'express';
import { authenticateJWT, isAdmin } from '../middlewares/auth.js';
import { TicketModel } from '../models/ticket.model.js';
import { getAllTickets, getTicketByCode } from '../services/ticket.services.js';

const router = express.Router();

// Ruta para obtener un ticket por su código (público)
router.get('/code/:code', async (req, res, next) => {
  const { code } = req.params;
  try {
    const ticket = await getTicketByCode(code);
    res.json(ticket);
  } catch (error) {
    res.status(404).json({ status: 'error', message: error.message });
  }
});

// Ruta para obtener todos los tickets (solo admin)
router.get('/', authenticateJWT, isAdmin, async (req, res, next) => {
  try {
    const tickets = await TicketModel.find();
    res.json(tickets);
  } catch (error) {
    next(error);
  }
});
export default router;
