// src/controllers/cliente.controller.ts
import { Request, Response } from 'express';
import { getClienteResumen, getClientePorNitConContratosActivos  } from '../services/cliente.service';

export async function getClienteResumenHandler(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ message: 'id de cliente inválido' });
        }

        const data = await getClienteResumen(id);

        if (!data) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        return res.json(data);
    } catch (error) {
        console.error('Error obteniendo resumen de cliente:', error);
        return res.status(500).json({
            message: 'Error interno al obtener el resumen del cliente'
        });
    }
}

export async function getClientePorNitHandler(req: Request, res: Response) {
    try {
        const nit = req.params.nit;

        if (!nit) {
            return res.status(400).json({ message: 'NIT es requerido' });
        }

        const data = await getClientePorNitConContratosActivos(nit);

        if (!data) {
            return res.status(404).json({ message: 'Cliente no encontrado para ese NIT' });
        }

        return res.json(data);
    } catch (error) {
        console.error('Error obteniendo cliente por NIT:', error);
        return res.status(500).json({
            message: 'Error interno al buscar cliente por NIT'
        });
    }
}
