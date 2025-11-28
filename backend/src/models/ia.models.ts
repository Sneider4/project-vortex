export interface AnalisisIAResult {
    sentimiento: "POSITIVO" | "NEUTRO" | "NEGATIVO";
    frustracion: "BAJA" | "MEDIA" | "ALTA";
    score_churn: number;
    riesgo_churn: "BAJO" | "MEDIO" | "ALTO";
    es_potencial_phishing: boolean;
    tiene_datos_sensibles: boolean;
    tipo_ticket: "CORRECTIVO" | "EVOLUTIVO" | "OTRO";
    prioridad_ticket: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
    recomendaciones: string;
}