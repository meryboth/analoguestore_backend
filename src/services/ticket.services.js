import { TicketModel } from '../models/ticket.model.js';

// Servicio para obtener todos los tickets
export const getAllTickets = async () => {
  return await TicketModel.find();
};

// Servicio para obtener un ticket por su código
export const getTicketByCode = async (code) => {
  const ticket = await TicketModel.findOne({ code });
  if (!ticket) {
    throw new Error('Ticket not found');
  }
  return ticket;
};
