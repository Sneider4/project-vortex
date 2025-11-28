// src/controllers/dashboard.controller.ts
import { Request, Response } from 'express';
import { getDashboardResumen } from '../services/dashboard.service';

export async function getDashboardResumenHandler(_req: Request, res: Response) {
    try {
        const data = await getDashboardResumen();
        return res.json(data);
    } catch (error) {
        console.error('Error obteniendo resumen de dashboard:', error);
        return res.status(500).json({
            message: 'Error interno al obtener el dashboard'
        });
    }
}
