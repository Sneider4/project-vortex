// src/services/dashboard.service.ts
import { pool } from '../db/pool';

export interface TopClienteRow {
    id_cliente: number;
    nombre_cliente: string;
    total_tickets: number;
    promedio_score_churn: number;
    riesgo_predominante: string | null;
}

export interface RiesgoResumenRow {
    riesgo_churn: string | null;
    cantidad: number;
}

export interface DashboardResumen {
    top_clientes: TopClienteRow[];
    resumen_riesgo: RiesgoResumenRow[];
    total_tickets: number;
    total_clientes_con_tickets: number;
}

export async function getDashboardResumen(): Promise<DashboardResumen> {
    // 1️⃣ Top clientes por score promedio de churn (últimos 30 días)
    const topClientesQuery = `
        SELECT
            c.id_cliente,
            c.nombre AS nombre_cliente,
            COUNT(t.id_ticket) AS total_tickets,
            AVG(a.score_churn) AS promedio_score_churn,
            MODE() WITHIN GROUP (ORDER BY a.riesgo_churn) AS riesgo_predominante
            FROM clientes c
            JOIN contratos ct ON ct.id_cliente = c.id_cliente
            JOIN tickets t ON t.id_contrato = ct.id_contrato
            JOIN analisis_ticket a ON a.id_ticket = t.id_ticket
            WHERE t.fecha_creacion >= NOW() - INTERVAL '30 days'
            GROUP BY c.id_cliente, c.nombre
            HAVING COUNT(t.id_ticket) > 0
            ORDER BY promedio_score_churn DESC
            LIMIT 5;
    `;

    const topClientesResult = await pool.query(topClientesQuery);

    const top_clientes: TopClienteRow[] = topClientesResult.rows.map((row: any) => ({
        id_cliente: row.id_cliente,
        nombre_cliente: row.nombre_cliente,
        total_tickets: Number(row.total_tickets),
        promedio_score_churn: Number(row.promedio_score_churn ?? 0),
        riesgo_predominante: row.riesgo_predominante
    }));

    // 2️⃣ Resumen por riesgo de churn (todos los tickets analizados)
    const resumenRiesgoQuery = `
        SELECT
            a.riesgo_churn,
            COUNT(*) AS cantidad
            FROM analisis_ticket a
            GROUP BY a.riesgo_churn;
    `;

    const resumenRiesgoResult = await pool.query(resumenRiesgoQuery);

    const resumen_riesgo: RiesgoResumenRow[] = resumenRiesgoResult.rows.map((row: any) => ({
        riesgo_churn: row.riesgo_churn,
        cantidad: Number(row.cantidad)
    }));

    // 3️⃣ Totales globales
    const totalTicketsQuery = `
        SELECT COUNT(*) AS total_tickets FROM tickets;
    `;
    const totalTicketsResult = await pool.query(totalTicketsQuery);
    const total_tickets = Number(totalTicketsResult.rows[0].total_tickets || 0);

    const totalClientesConTicketsQuery = `
        SELECT COUNT(DISTINCT c.id_cliente) AS total_clientes
            FROM clientes c
        JOIN contratos ct ON ct.id_cliente = c.id_cliente
        JOIN tickets t ON t.id_contrato = ct.id_contrato;
    `;
    const totalClientesResult = await pool.query(totalClientesConTicketsQuery);
    const total_clientes_con_tickets = Number(totalClientesResult.rows[0].total_clientes || 0);

    return {
        top_clientes,
        resumen_riesgo,
        total_tickets,
        total_clientes_con_tickets
    };
}
