// src/routes/index.ts
import { Router } from 'express';
import ticketsRouter from './tickets.routes';
import dashboardRouter from './dashboard.routes';
import clientesRouter from './clientes.routes';

const router = Router();

// Ruta de salud
router.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        message: 'API Vortex Churn funcionando'
    });
});

// Rutas de tickets
router.use('/tickets', ticketsRouter);

// Dashboard
router.use('/dashboard', dashboardRouter);
router.use('/clientes', clientesRouter);

export default router;
