// src/routes/tickets.routes.ts
import { Router } from 'express';
import { crearTicketHandler, getDetalleTicketHandler, listadoTicketsHandler } from '../controllers/ticket.controller';

const router = Router();

// Listar tickets
router.get('/listadoTicket', listadoTicketsHandler);

router.post('/listadoTicketAnalisis', crearTicketHandler);
router.get('/:id/detalleTicket', getDetalleTicketHandler);

export default router;
