// src/services/ticket.service.ts
import { pool } from '../db/pool';
import { AnalisisIAResult, analizarTextoTicketConIA } from './ia.service';

interface CreateTicketDTO {
    id_contrato: number;
    titulo: string;
    descripcion: string;
    tipo?: string | null;
    prioridad?: string | null;
}

interface TicketRow {
    id_ticket: number;
    id_contrato: number;
    titulo: string;
    descripcion: string;
    tipo: string | null;
    prioridad: string | null;
    estado: string;
    fecha_creacion: Date;
    fecha_cierre: Date | null;
}

interface AnalisisRow {
    id_analisis: number;
    id_ticket: number;
    sentimiento: string | null;
    frustracion: string | null;
    score_churn: number | null;
    riesgo_churn: string | null;
    es_potencial_phishing: boolean;
    tiene_datos_sensibles: boolean;
    recomendaciones: string | null;
    fecha_analisis: Date;
}

export interface TicketWithAnalysis {
    ticket: TicketRow;
    analisis: AnalisisRow | null;
}

export async function createTicketWithAnalysis(
    data: CreateTicketDTO
): Promise<{ ticket: TicketRow; analisis: AnalisisRow }> {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1️⃣ Insertar ticket
        const insertTicketQuery = `
            INSERT INTO tickets (
                id_contrato, titulo, descripcion
            ) VALUES ($1, $2, $3)
            RETURNING *
        `;

        const ticketResult = await client.query<TicketRow>(insertTicketQuery, [
            data.id_contrato,
            data.titulo,
            data.descripcion
        ]);

        const ticket = ticketResult.rows[0];

        let analisisIA: AnalisisIAResult;

        try {
            analisisIA = await analizarTextoTicketConIA(ticket.descripcion, {
                // puedes poner contexto si quieres
            });
        } catch (error) {
            console.error('❌ Error llamando a OpenAI, usando fallback local:', error);
            analisisIA = analizarTextoTicketFallback(ticket.descripcion);
        }

        // 3️⃣ Insertar análisis en BD
        const insertAnalisisQuery = `
            INSERT INTO analisis_ticket (
                id_ticket,
                sentimiento,
                frustracion,
                score_churn,
                riesgo_churn,
                es_potencial_phishing,
                tiene_datos_sensibles,
                recomendaciones
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *
        `;

        const analisisResult = await client.query<AnalisisRow>(
            insertAnalisisQuery,
            [
                ticket.id_ticket,
                analisisIA.sentimiento,
                analisisIA.frustracion,
                analisisIA.score_churn,
                analisisIA.riesgo_churn,
                analisisIA.es_potencial_phishing,
                analisisIA.tiene_datos_sensibles,
                analisisIA.recomendaciones
            ]
        );

        const analisisRow = analisisResult.rows[0];

        // 4) Actualizar tipo y prioridad en la tabla tickets según IA
        const updateTicketMetaQuery = `
            UPDATE tickets
            SET tipo = $1,
                prioridad = $2
            WHERE id_ticket = $3
            RETURNING *
        `;
        const updatedTicketResult = await client.query<TicketRow>(updateTicketMetaQuery, [
            analisisIA.tipo_ticket,
            analisisIA.prioridad_ticket,
            ticket.id_ticket
        ]);

        const updatedTicket = updatedTicketResult.rows[0];
        await client.query('COMMIT');

        return {
            ticket: updatedTicket,
            analisis: analisisRow
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error en createTicketWithAnalysis:', error);
        throw error;
    } finally {
        client.release();
    }
}

export async function listTicketsWithAnalysis(): Promise<TicketWithAnalysis[]> {
    const query = `
        SELECT 
            t.id_ticket,
            t.id_contrato,
            t.titulo,
            t.descripcion,
            t.tipo,
            t.prioridad,
            t.estado,
            t.fecha_creacion,
            t.fecha_cierre,

            a.id_analisis,
            a.sentimiento,
            a.frustracion,
            a.score_churn,
            a.riesgo_churn,
            a.es_potencial_phishing,
            a.tiene_datos_sensibles,
            a.recomendaciones,
            a.fecha_analisis
        FROM tickets t
        LEFT JOIN analisis_ticket a ON a.id_ticket = t.id_ticket
        ORDER BY t.fecha_creacion DESC
    `;

    const result = await pool.query(query);

    const items: TicketWithAnalysis[] = result.rows.map((row: any) => {
        const ticket: TicketRow = {
            id_ticket: row.id_ticket,
            id_contrato: row.id_contrato,
            titulo: row.titulo,
            descripcion: row.descripcion,
            tipo: row.tipo,
            prioridad: row.prioridad,
            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_cierre: row.fecha_cierre
        };

        let analisis: AnalisisRow | null = null;

        if (row.id_analisis) {
            analisis = {
                id_analisis: row.id_analisis,
                id_ticket: row.id_ticket,
                sentimiento: row.sentimiento,
                frustracion: row.frustracion,
                score_churn: row.score_churn,
                riesgo_churn: row.riesgo_churn,
                es_potencial_phishing: row.es_potencial_phishing,
                tiene_datos_sensibles: row.tiene_datos_sensibles,
                recomendaciones: row.recomendaciones,
                fecha_analisis: row.fecha_analisis
            };
        }

        return { ticket, analisis };
    });

    return items;
}

function analizarTextoTicketFallback(descripcion: string): AnalisisIAResult {
    const texto = descripcion.toLowerCase();

    const palabrasNegativas = [
        'molesto',
        'inaceptable',
        'decepcionado',
        'indignado',
        'frustrado',
        'urgente',
        'crítico',
        'critica',
        'caído',
        'caido',
        'no funciona',
        'no ha funcionado',
        'sigue igual',
        'perdiendo dinero',
        'llevo esperando'
    ];

    const palabrasPositivas = [
        'gracias',
        'agradezco',
        'excelente',
        'muy buen',
        'funciona bien',
        'satisfecho',
        'satisfechos'
    ];

    let scorePositivo = 0;
    let scoreNegativo = 0;

    for (const p of palabrasPositivas) {
        if (texto.includes(p)) scorePositivo++;
    }
    for (const p of palabrasNegativas) {
        if (texto.includes(p)) scoreNegativo++;
    }

    let sentimiento: 'POSITIVO' | 'NEUTRO' | 'NEGATIVO' = 'NEUTRO';
    if (scoreNegativo > scorePositivo && scoreNegativo > 0) {
        sentimiento = 'NEGATIVO';
    } else if (scorePositivo > scoreNegativo && scorePositivo > 0) {
        sentimiento = 'POSITIVO';
    }

    let frustracion: 'BAJA' | 'MEDIA' | 'ALTA' = 'BAJA';
    if (sentimiento === 'NEGATIVO' && texto.includes('inaceptable')) {
        frustracion = 'ALTA';
    } else if (sentimiento === 'NEGATIVO') {
        frustracion = 'MEDIA';
    }

    const es_potencial_phishing =
        texto.includes('http://') ||
        texto.includes('https://') ||
        texto.includes('verificar cuenta') ||
        texto.includes('bloqueo de su cuenta');

    const tiene_datos_sensibles =
        texto.includes('usuario') ||
        texto.includes('contraseña') ||
        texto.includes('password') ||
        texto.includes('clave');

    let score_churn = 20;
    if (sentimiento === 'NEGATIVO') score_churn += 40;
    if (frustracion === 'MEDIA') score_churn += 20;
    if (frustracion === 'ALTA') score_churn += 35;
    if (es_potencial_phishing) score_churn += 5;
    if (tiene_datos_sensibles) score_churn += 5;
    if (score_churn > 100) score_churn = 100;

    let riesgo_churn: 'BAJO' | 'MEDIO' | 'ALTO' = 'BAJO';
    if (score_churn >= 70) riesgo_churn = 'ALTO';
    else if (score_churn >= 40) riesgo_churn = 'MEDIO';

    let prioridad_ticket: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA' = 'MEDIA';
    if (
        texto.includes('caído') ||
        texto.includes('caido') ||
        texto.includes('no funciona') ||
        texto.includes('perdiendo dinero')
    ) {
        prioridad_ticket = 'CRITICA';
    } else if (texto.includes('urgente')) {
        prioridad_ticket = 'ALTA';
    }

    let tipo_ticket: 'CORRECTIVO' | 'EVOLUTIVO' | 'OTRO' = 'CORRECTIVO';
    if (texto.includes('mejora') || texto.includes('ajuste') || texto.includes('nueva funcionalidad')) {
        tipo_ticket = 'EVOLUTIVO';
    }

    let recomendaciones = 'Analizado con motor de reglas local (fallback). ';
    if (riesgo_churn === 'ALTO') {
        recomendaciones +=
            'Contactar al cliente en las próximas 24 horas y priorizar la resolución del incidente.';
    } else if (riesgo_churn === 'MEDIO') {
        recomendaciones +=
            'Hacer seguimiento al ticket y mantener informado al cliente del avance.';
    } else {
        recomendaciones +=
            'Mantener nivel de servicio actual y reforzar la comunicación positiva con el cliente.';
    }

    if (es_potencial_phishing) {
        recomendaciones += ' ⚠️ Posible caso de phishing, escalar a seguridad.';
    }
    if (tiene_datos_sensibles) {
        recomendaciones +=
            ' ⚠️ El ticket incluye posibles credenciales o datos sensibles, pedir al cliente que los elimine.';
    }

    return {
        sentimiento,
        frustracion,
        score_churn,
        riesgo_churn,
        es_potencial_phishing,
        tiene_datos_sensibles,
        tipo_ticket,
        prioridad_ticket,
        recomendaciones
    };
}
