import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { AnalisisIAResult } from "../models/ia.models";

dotenv.config();

/**
 * Interfaz del análisis que devolverá la IA (Gemini o fallback local)
 */


/**
 * Cliente de Gemini (Google AI)
 */
const geminiApiKey = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (!geminiApiKey) {
    console.warn(
        "⚠️ GEMINI_API_KEY no está definido en .env. Solo se podrá usar el fallback local."
    );
} else {
    genAI = new GoogleGenerativeAI(geminiApiKey);
}

/**
 * Función principal: analiza el texto usando Gemini.
 */
export async function analizarTextoTicketConIA(descripcion: string, contexto?: { cliente?: string; contrato?: string }): Promise<AnalisisIAResult> {
    if (!genAI) {
        throw new Error("Gemini no está configurado (GEMINI_API_KEY faltante).");
    }

    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const systemPrompt = `
    Eres un analista experto en soporte de software, experiencia de cliente, ciberseguridad y gestión de churn.

    Debes analizar el texto de un ticket y devolver SIEMPRE una respuesta en JSON válido.

    Instrucciones IMPORTANTES:
    - Responde ÚNICAMENTE con un JSON válido, sin texto adicional antes o después.
    - No incluyas comentarios, explicaciones ni texto fuera del JSON.
    - Respeta estrictamente los valores permitidos.

    Estructura del JSON:

    {
        "sentimiento": "POSITIVO|NEUTRO|NEGATIVO",
        "frustracion": "BAJA|MEDIA|ALTA",
        "score_churn": 0-100,
        "riesgo_churn": "BAJO|MEDIO|ALTO",
        "es_potencial_phishing": true/false,
        "tiene_datos_sensibles": true/false,
        "tipo_ticket": "CORRECTIVO|EVOLUTIVO|OTRO",
        "prioridad_ticket": "BAJA|MEDIA|ALTA|CRITICA",
        "recomendaciones": "texto corto en español dirigido al account manager, máximo 3 oraciones"
    }
    `.trim();

    const userContent = `
        Texto del ticket:
        """
        ${descripcion}
        """

        Contexto adicional (puede estar vacío):
        ${JSON.stringify(contexto || {}, null, 2)}

        Recuerda: responde SOLO con el JSON, sin texto ni explicaciones adicionales.
    `.trim();

    const prompt = `${systemPrompt}\n\n-------------------------\n\n${userContent}`;

    const result = await model.generateContent(prompt);
    const rawText = (await result.response.text()).trim();

    const cleaned = limpiarPosiblesCodeFences(rawText);

    let json: AnalisisIAResult;
    try {
        json = JSON.parse(cleaned);
    } catch (error) {
        console.error("❌ No se pudo parsear JSON desde Gemini. Contenido bruto:");
        console.error(rawText);
        throw new Error("La respuesta de Gemini no fue un JSON válido");
    }

    json.score_churn = Math.min(100, Math.max(0, Number(json.score_churn || 0)));

    return json;
}

/**
 * Fallback local basado en reglas simples de palabras clave.
 * Útil cuando Gemini falla (sin cuota, sin API key, etc.).
 */
export function analizarTextoTicketFallback(descripcion: string): AnalisisIAResult {
    const texto = descripcion.toLowerCase();

    const palabrasNegativas = [
        "molesto",
        "inaceptable",
        "decepcionado",
        "indignado",
        "frustrado",
        "urgente",
        "crítico",
        "critica",
        "caído",
        "caido",
        "no funciona",
        "no ha funcionado",
        "sigue igual",
        "perdiendo dinero",
        "llevo esperando",
        "muy demorado",
        "muy lento"
    ];

    const palabrasPositivas = [
        "gracias",
        "agradezco",
        "excelente",
        "muy buen",
        "funciona bien",
        "satisfecho",
        "satisfechos",
        "felicitaciones"
    ];

    let scorePositivo = 0;
    let scoreNegativo = 0;

    for (const p of palabrasPositivas) {
        if (texto.includes(p)) scorePositivo++;
    }
    for (const p of palabrasNegativas) {
        if (texto.includes(p)) scoreNegativo++;
    }

    let sentimiento: "POSITIVO" | "NEUTRO" | "NEGATIVO" = "NEUTRO";
    if (scoreNegativo > scorePositivo && scoreNegativo > 0) {
        sentimiento = "NEGATIVO";
    } else if (scorePositivo > scoreNegativo && scorePositivo > 0) {
        sentimiento = "POSITIVO";
    }

    let frustracion: "BAJA" | "MEDIA" | "ALTA" = "BAJA";
    if (sentimiento === "NEGATIVO" && texto.includes("inaceptable")) {
        frustracion = "ALTA";
    } else if (sentimiento === "NEGATIVO") {
        frustracion = "MEDIA";
    }

    const es_potencial_phishing =
        texto.includes("http://") ||
        texto.includes("https://") ||
        texto.includes("verificar cuenta") ||
        texto.includes("actualizar su cuenta") ||
        texto.includes("bloqueo de su cuenta");

    const tiene_datos_sensibles =
        texto.includes("usuario") ||
        texto.includes("contraseña") ||
        texto.includes("password") ||
        texto.includes("clave") ||
        texto.includes("número de tarjeta") ||
        texto.includes("tarjeta de crédito");

    // Score de churn simple
    let score_churn = 20;
    if (sentimiento === "NEGATIVO") score_churn += 40;
    if (frustracion === "MEDIA") score_churn += 20;
    if (frustracion === "ALTA") score_churn += 35;
    if (es_potencial_phishing) score_churn += 5;
    if (tiene_datos_sensibles) score_churn += 5;
    if (texto.includes("cancelar el contrato") || texto.includes("buscaremos otro proveedor")) {
        score_churn += 30;
    }
    if (score_churn > 100) score_churn = 100;

    let riesgo_churn: "BAJO" | "MEDIO" | "ALTO" = "BAJO";
    if (score_churn >= 70) riesgo_churn = "ALTO";
    else if (score_churn >= 40) riesgo_churn = "MEDIO";

    let prioridad_ticket: "BAJA" | "MEDIA" | "ALTA" | "CRITICA" = "MEDIA";
    if (
        texto.includes("caído") ||
        texto.includes("caido") ||
        texto.includes("no funciona") ||
        texto.includes("perdiendo dinero") ||
        texto.includes("no podemos operar")
    ) {
        prioridad_ticket = "CRITICA";
    } else if (texto.includes("urgente") || texto.includes("lo antes posible")) {
        prioridad_ticket = "ALTA";
    }

    let tipo_ticket: "CORRECTIVO" | "EVOLUTIVO" | "OTRO" = "CORRECTIVO";
    if (
        texto.includes("mejora") ||
        texto.includes("ajuste") ||
        texto.includes("nueva funcionalidad") ||
        texto.includes("nueva característica")
    ) {
        tipo_ticket = "EVOLUTIVO";
    }

    let recomendaciones = "Analizado con motor de reglas local (fallback). ";
    if (riesgo_churn === "ALTO") {
        recomendaciones +=
            "Contactar al cliente en las próximas 24 horas y priorizar la resolución del incidente.";
    } else if (riesgo_churn === "MEDIO") {
        recomendaciones +=
            "Hacer seguimiento al ticket y mantener informado al cliente del avance de la solución.";
    } else {
        recomendaciones +=
            "Mantener el nivel de servicio actual y reforzar la comunicación positiva con el cliente.";
    }

    if (es_potencial_phishing) {
        recomendaciones += " ⚠️ Posible caso de phishing, escalar al equipo de seguridad.";
    }
    if (tiene_datos_sensibles) {
        recomendaciones +=
            " ⚠️ El ticket incluye posibles credenciales o datos sensibles, solicitar al cliente que los elimine del mensaje.";
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

/**
 * Utilidad para limpiar ```json ... ``` si el modelo lo devuelve así.
 */
function limpiarPosiblesCodeFences(text: string): string {
    let cleaned = text.trim();

    if (cleaned.startsWith("```")) {
        // Eliminar la primera línea ```json o ``` 
        cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, "");
        // Eliminar el bloque final ```
        cleaned = cleaned.replace(/```$/, "").trim();
    }

    return cleaned;
}
