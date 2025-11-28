// src/routes/dashboard.routes.ts
import { Router } from 'express';
import { getDashboardResumenHandler } from '../controllers/dashboard.controller';

const router = Router();

router.get('/resumen', getDashboardResumenHandler);

export default router;
