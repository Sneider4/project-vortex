export interface CreateTicketRequest {
    id_contrato: number;
    titulo: string;
    descripcion: string;
    tipo?: string | null;
    prioridad?: string | null;
}

export interface Ticket {
    id_ticket: number;
    id_contrato: number;
    titulo: string;
    descripcion: string;
    tipo: string | null;
    prioridad: string | null;
    estado: string;
    fecha_creacion: string;
    fecha_cierre: string | null;
}

export interface AnalisisTicket {
    id_analisis: number;
    id_ticket: number;
    sentimiento: string | null;
    frustracion: string | null;
    score_churn: number | null;
    riesgo_churn: string | null;
    es_potencial_phishing: boolean | undefined;
    tiene_datos_sensibles: boolean;
    recomendaciones: string | null;
    fecha_analisis: string;
}

export interface CreateTicketResponse {
    ticket: Ticket;
    analisis: AnalisisTicket;
}

export type TicketWithAnalysis = CreateTicketResponse;

export interface TopCliente {
    id_cliente: number;
    nombre_cliente: string;
    total_tickets: number;
    promedio_score_churn: number;
    riesgo_predominante: string | null;
}

export interface RiesgoResumen {
    riesgo_churn: string | null;
    cantidad: number;
}

export interface SentimientoResumen {
    sentimiento: string | null;
    cantidad: number;
}

export interface DashboardResumen {
    top_clientes: TopCliente[];
    resumen_riesgo: RiesgoResumen[];
    total_tickets: number;
    total_clientes_con_tickets: number;
    churn_score_global: number;
    resumen_sentimiento: SentimientoResumen[]
}

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
        id_contrato: number;
        nombre_proyecto: string;
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

export interface Cliente {
    id_cliente: number;
    cantidad_contratos?: number;
    nombre: string;
    nit: string;
    sector: string | null;
    fecha_inicio_relacion: string;
    estado: string;
}

export interface Contrato {
    id_contrato: number;
    id_cliente: number;
    nombre_proyecto: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    valor_mensual: string;
    estado: string;
    nivel_servicio: string | null;
}


export interface TicketDetalle {
    id_ticket: number;
    id_contrato: number;
    titulo: string;
    descripcion: string;
    tipo: string;
    prioridad: string;
    estado: string;
    fecha_creacion: string;
    fecha_cierre: string | null;
    id_analisis: number;
    sentimiento: string;
    frustracion: string;
    es_potencial_phishing: boolean;
    tiene_datos_sensibles: boolean;
    recomendaciones: string;
    fecha_analisis: string;
    score_churn: string;      // viene como '85.00'
    riesgo_churn: string;
}
