// src/routes/clientes.routes.ts
import { Router } from 'express';
import { getClientePorNitHandler, getClienteResumenHandler } from '../controllers/cliente.controller';

const router = Router();

// /api/clientes/:id/resumen
router.get('/:id/resumen', getClienteResumenHandler);

router.get('/por-nit/:nit', getClientePorNitHandler);

export default router;
