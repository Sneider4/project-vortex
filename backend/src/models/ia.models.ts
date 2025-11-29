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

// src/config/ia-hints.config.ts
export const reglasPalabras = {
    palabrasNegativas: [
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
    ],
    palabrasPositivas: [
        'gracias',
        'agradezco',
        'excelente',
        'muy buen',
        'funciona bien',
        'satisfecho',
        'satisfechos'
    ],
    disparadoresPhishing: [
        'http://',
        'https://',
        'verificar cuenta',
        'bloqueo de su cuenta',
        'actualizar su cuenta'
    ],
    disparadoresDatosSensibles: [
        'usuario',
        'contraseña',
        'password',
        'clave',
        'número de tarjeta',
        'tarjeta de crédito'
    ],
    disparadoresCriticidad: [
        'caído',
        'caido',
        'no funciona',
        'no podemos operar',
        'perdiendo dinero'
    ],
    disparadoresEvolutivo: [
        'mejora',
        'ajuste',
        'nueva funcionalidad',
        'nueva característica'
    ]
} as const;
