// src/services/cliente.service.ts
import { pool } from '../db/pool';

export interface ClienteResumen {
    cliente: {
        id_cliente: number;
        nombre: string;
        nit: string | null;
        sector: string | null;
        fecha_inicio_relacion: string | null;
        estado: string;
    };
    contratos: {
        id_contrato: number;
        nombre_proyecto: string;
        fecha_inicio: string | null;
        fecha_fin: string | null;
        estado: string;
        nivel_servicio: string | null;
    }[];
    resumen: {
        total_tickets: number;
        promedio_score_churn: number;
        riesgo_predominante: string | null;
        tickets_por_riesgo: { riesgo_churn: string | null; cantidad: number }[];
    };
    tickets_recientes: {
        id_ticket: number;
        titulo: string;
        descripcion: string;
        prioridad: string | null;
        estado: string;
        fecha_creacion: string;
        sentimiento: string | null;
        frustracion: string | null;
        score_churn: number | null;
        riesgo_churn: string | null;
        es_potencial_phishing: boolean;
        tiene_datos_sensibles: boolean;
    }[];
}

export async function getClienteResumen(
    idCliente: number
): Promise<ClienteResumen | null> {
    // 1️⃣ Datos básicos del cliente
    const clienteQuery = `
        SELECT
            id_cliente,
            nombre,
            nit,
            sector,
            fecha_inicio_relacion,
            estado
            FROM clientes
            WHERE id_cliente = $1
    `;
    const clienteResult = await pool.query(clienteQuery, [idCliente]);

    if (clienteResult.rowCount === 0) {
        return null;
    }

    const c = clienteResult.rows[0];

    const cliente = {
        id_cliente: c.id_cliente,
        nombre: c.nombre,
        nit: c.nit,
        sector: c.sector,
        fecha_inicio_relacion: c.fecha_inicio_relacion,
        estado: c.estado
    };

    // 2️⃣ Contratos del cliente
    const contratosQuery = `
        SELECT
            id_contrato,
            nombre_proyecto,
            fecha_inicio,
            fecha_fin,
            estado,
            nivel_servicio
            FROM contratos
            WHERE id_cliente = $1
            ORDER BY fecha_inicio DESC
    `;
    const contratosResult = await pool.query(contratosQuery, [idCliente]);

    const contratos = contratosResult.rows.map((row: any) => ({
        id_contrato: row.id_contrato,
        nombre_proyecto: row.nombre_proyecto,
        fecha_inicio: row.fecha_inicio,
        fecha_fin: row.fecha_fin,
        estado: row.estado,
        nivel_servicio: row.nivel_servicio
    }));

    // 3️⃣ Resumen agregado de tickets + churn
    const resumenQuery = `
        SELECT
            COUNT(t.id_ticket) AS total_tickets,
            AVG(a.score_churn) AS promedio_score_churn,
            MODE() WITHIN GROUP (ORDER BY a.riesgo_churn) AS riesgo_predominante
        FROM contratos ct
        JOIN tickets t ON t.id_contrato = ct.id_contrato
        JOIN analisis_ticket a ON a.id_ticket = t.id_ticket
        WHERE ct.id_cliente = $1
    `;
    const resumenResult = await pool.query(resumenQuery, [idCliente]);

    const r = resumenResult.rows[0] || {};
    const total_tickets = Number(r.total_tickets || 0);
    const promedio_score_churn = Number(r.promedio_score_churn || 0);
    const riesgo_predominante = r.riesgo_predominante || null;

    const ticketsPorRiesgoQuery = `
        SELECT
            a.riesgo_churn,
            COUNT(*) AS cantidad
        FROM contratos ct
        JOIN tickets t ON t.id_contrato = ct.id_contrato
        JOIN analisis_ticket a ON a.id_ticket = t.id_ticket
        WHERE ct.id_cliente = $1
        GROUP BY a.riesgo_churn
    `;
    const ticketsPorRiesgoResult = await pool.query(ticketsPorRiesgoQuery, [
        idCliente
    ]);

    const tickets_por_riesgo = ticketsPorRiesgoResult.rows.map((row: any) => ({
        riesgo_churn: row.riesgo_churn,
        cantidad: Number(row.cantidad)
    }));

    // 4️⃣ Últimos tickets con análisis
    const ticketsRecientesQuery = `
        SELECT
            t.id_ticket,
            t.titulo,
            t.descripcion,
            t.prioridad,
            t.estado,
            t.fecha_creacion,
            a.sentimiento,
            a.frustracion,
            a.score_churn,
            a.riesgo_churn,
            a.es_potencial_phishing,
            a.tiene_datos_sensibles
        FROM contratos ct
        JOIN tickets t ON t.id_contrato = ct.id_contrato
        LEFT JOIN analisis_ticket a ON a.id_ticket = t.id_ticket
        WHERE ct.id_cliente = $1
        ORDER BY t.fecha_creacion DESC
        LIMIT 20
    `;
    const ticketsRecientesResult = await pool.query(ticketsRecientesQuery, [
        idCliente
    ]);

    const tickets_recientes = ticketsRecientesResult.rows.map((row: any) => ({
        id_ticket: row.id_ticket,
        titulo: row.titulo,
        descripcion: row.descripcion,
        prioridad: row.prioridad,
        estado: row.estado,
        fecha_creacion: row.fecha_creacion,
        sentimiento: row.sentimiento,
        frustracion: row.frustracion,
        score_churn: row.score_churn,
        riesgo_churn: row.riesgo_churn,
        es_potencial_phishing: row.es_potencial_phishing,
        tiene_datos_sensibles: row.tiene_datos_sensibles
    }));

    return {
        cliente,
        contratos,
        resumen: {
            total_tickets,
            promedio_score_churn,
            riesgo_predominante,
            tickets_por_riesgo
        },
        tickets_recientes
    };
}

export interface ClienteConContratosActivos {
    cliente: {
        id_cliente: number;
        nombre: string;
        nit: string | null;
        sector: string | null;
        fecha_inicio_relacion: string | null;
        estado: string;
    };
    contratos_activos: {
        id_contrato: number;
        nombre_proyecto: string;
        fecha_inicio: string | null;
        fecha_fin: string | null;
        estado: string;
        nivel_servicio: string | null;
    }[];
}

export async function getClientePorNitConContratosActivos(
    nit: string
): Promise<ClienteConContratosActivos | null> {
    // 1. Buscar cliente por NIT
    const clienteQuery = `
    SELECT id_cliente, nombre, nit, sector, fecha_inicio_relacion, estado
    FROM clientes
    WHERE nit = $1
  `;
    const clienteResult = await pool.query(clienteQuery, [nit]);

    if (clienteResult.rowCount === 0) {
        return null;
    }

    const c = clienteResult.rows[0];

    const cliente = {
        id_cliente: c.id_cliente,
        nombre: c.nombre,
        nit: c.nit,
        sector: c.sector,
        fecha_inicio_relacion: c.fecha_inicio_relacion,
        estado: c.estado
    };

    // 2. Contratos activos
    const contratosQuery = `
        SELECT id_contrato, nombre_proyecto, fecha_inicio, fecha_fin, estado, nivel_servicio
        FROM contratos
        WHERE id_cliente = $1
        AND estado = 'VIGENTE'
        ORDER BY fecha_inicio DESC
    `;
    const contratosResult = await pool.query(contratosQuery, [cliente.id_cliente]);

    const contratos_activos = contratosResult.rows.map((row: any) => ({
        id_contrato: row.id_contrato,
        nombre_proyecto: row.nombre_proyecto,
        fecha_inicio: row.fecha_inicio,
        fecha_fin: row.fecha_fin,
        estado: row.estado,
        nivel_servicio: row.nivel_servicio
    }));

    return {
        cliente,
        contratos_activos
    };
}
