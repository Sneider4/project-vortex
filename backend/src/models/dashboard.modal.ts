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

export interface SentimientoResumenRow {
    sentimiento: string | null; // 'POSITIVO' | 'NEUTRO' | 'NEGATIVO' | null
    cantidad: number;
}

export interface DashboardResumen {
    top_clientes: TopClienteRow[];
    resumen_riesgo: RiesgoResumenRow[];
    total_tickets: number;
    total_clientes_con_tickets: number;
    churn_score_global: number;
    resumen_sentimiento: SentimientoResumenRow[];
}