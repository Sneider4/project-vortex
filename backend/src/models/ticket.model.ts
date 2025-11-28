export interface CreateTicketDTO {
    id_contrato: number;
    titulo: string;
    descripcion: string;
    tipo?: string | null;
    prioridad?: string | null;
}

export interface TicketRow {
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

export interface AnalisisRow {
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
