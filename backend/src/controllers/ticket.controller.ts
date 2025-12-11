// src/controllers/ticket.controller.ts
import { Request, Response } from 'express';
import { createTicketWithAnalysis, listTicketsWithAnalysis, obtenerDetalleTicket} from '../services/ticket.service';

export async function getDetalleTicketHandler(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ message: 'id de ticket inválido' });
        }

        const data = await obtenerDetalleTicket(id);

        if (!data) {
            return res.status(404).json({ message: 'Ticket no encontrado' });
        }

        return res.json(data);
    } catch (error) {
        console.error('Error obteniendo detalle del ticket:', error);
        return res.status(500).json({
            message: 'Error interno al obtener detalle del ticket'
        });
    }
}

export async function crearTicketHandler(req: Request, res: Response) {
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

export async function listadoTicketsHandler(_req: Request, res: Response) {
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
