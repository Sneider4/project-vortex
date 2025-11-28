// src/controllers/ticket.controller.ts
import { Request, Response } from 'express';
import {
    createTicketWithAnalysis,
    listTicketsWithAnalysis
} from '../services/ticket.service';

export async function createTicketHandler(req: Request, res: Response) {
    try {
        const {
            id_contrato,
            titulo,
            descripcion
        } = req.body;

        if (!id_contrato || !titulo || !descripcion) {
            return res.status(400).json({
                message: 'id_contrato, titulo y descripcion son obligatorios'
            });
        }

        const result = await createTicketWithAnalysis({
            id_contrato,
            titulo,
            descripcion
        });

        return res.status(201).json(result);
    } catch (error) {
        console.error('Error creando ticket:', error);
        return res.status(500).json({
            message: 'Error interno al crear el ticket'
        });
    }
}

export async function listTicketsHandler(_req: Request, res: Response) {
    try {
        const items = await listTicketsWithAnalysis();
        return res.json({ items });
    } catch (error) {
        console.error('Error listando tickets:', error);
        return res.status(500).json({
            message: 'Error interno al listar los tickets'
        });
    }
}
