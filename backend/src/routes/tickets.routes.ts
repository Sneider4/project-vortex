// src/routes/tickets.routes.ts
import { Router } from 'express';
import { crearTicketHandler, listadoTicketsHandler } from '../controllers/ticket.controller';

const router = Router();

// Listar tickets
router.get('/listadoTicket', listadoTicketsHandler);

// Crear ticket + análisis
router.post('/listadoTicketAnalisis', crearTicketHandler);

export default router;
