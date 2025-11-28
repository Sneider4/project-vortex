// src/routes/tickets.routes.ts
import { Router } from 'express';
import { createTicketHandler, listTicketsHandler } from '../controllers/ticket.controller';

const router = Router();

// Listar tickets
router.get('/listadoTicket', listTicketsHandler);

// Crear ticket + análisis
router.post('/listadoTicketAnalisis', createTicketHandler);

export default router;
