import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { AnalisisIAResult, reglasPalabras } from "../models/ia.models";

dotenv.config();

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

export async function analizarTextoTicketConIA(
    descripcion: string,
    contextoCliente?: { nombre_cliente: string; fecha_inicio_relacion: any, total_contratos_cliente?: number }
): Promise<AnalisisIAResult> {
    if (!genAI) {
        throw new Error("Gemini no está configurado (GEMINI_API_KEY faltante).");
    }

    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const systemPrompt = `
        Somos expertos en desarrollo de software a la medida.
        Eres un analista experto en soporte de software, experiencia de cliente, ciberseguridad y gestión de churn.

        Tu ÚNICA tarea es leer el texto de un ticket y devolver SOLO un JSON válido con este esquema:

        {
            "sentimiento": "POSITIVO" | "NEUTRO" | "NEGATIVO",
            "frustracion": "BAJA" | "MEDIA" | "ALTA",
            "score_churn": número entero entre 0 y 100,
            "riesgo_churn": "BAJO" | "MEDIO" | "ALTO",
            "es_potencial_phishing": true | false,
            "tiene_datos_sensibles": true | false,
            "tipo_ticket": "CORRECTIVO" | "EVOLUTIVO" | "OTRO",
            "prioridad_ticket": "BAJA" | "MEDIA" | "ALTA" | "CRITICA",
            "recomendaciones": "texto en español con sugerencias para el equipo de soporte que es acount manager para reducir churn y mejorar la experiencia del cliente sobre la base del análisis del ticket "
        }

        El sistema te proporciona unas LISTAS DE PALABRAS CLAVE como referencia (no son reglas absolutas):

        ${JSON.stringify(reglasPalabras, null, 2)}

        INSTRUCCIONES PARA USAR ESTAS LISTAS:
            - Úsalas como SEÑALES: si aparecen, pueden indicar sentimiento negativo, urgencia, phishing, datos sensibles, etc.
            - PERO la decisión final siempre debe basarse en el significado global del texto.  
        Por ejemplo, si aparece una palabra negativa dentro de un contexto positivo o irónico, no marques el ticket como totalmente negativo si no corresponde.
            - No marques "es_potencial_phishing" en true solo por ver "https://". Debe haber indicios claros de intento de fraude o captura de credenciales.
            - No marques "tiene_datos_sensibles" en true a menos que el texto realmente incluya credenciales, contraseñas o datos similares.
            - Si no hay suficiente evidencia, usa valores neutrales o conservadores (por ejemplo: "NEUTRO", "BAJA", "BAJO", score_churn alrededor de 20–30).

        REGLAS IMPORTANTES:
            - Responde SOLO con un JSON válido, sin texto antes ni después.
            - No incluyas comentarios ni bloques de código.
            - "score_churn" debe ser siempre un número entre 0 y 100 (sin comillas).
        `.trim();

    const userContent = `
        Analiza el siguiente ticket y devuelve SOLO el JSON con la estructura indicada.

        TEXTO DEL TICKET:
        """
            ${descripcion}
        """

        CONTEXTO ADICIONAL DEL CLIENTE:
        En la siguiente informacion viene el nombre de la empresa cliente, la fecha de inicio de la relacion comercial y el total de contratos activos que tiene con nosotros. 
        Basando en esta informacion, ajusta tu analisis si es necesario, y evita falsos positivos en la deteccion de riesgo de churn o frustracion.
        Asi mismo, si el cliente tiene una relacion larga y muchos contratos, considera esto para reducir el score de churn si el ticket no es muy grave.
        ${JSON.stringify(contextoCliente || {}, null, 2)}

        Recuerda:
            - Usa las listas de palabras clave como referencia, pero prioriza el sentido global del texto.
            - No expliques nada.
            - No añadas comentarios.
            - No uses bloques de código.
            - Devuelve únicamente el JSON final.
    `.trim();

    const prompt = `${systemPrompt}\n\n-------------------------\n\n${userContent}`;

    const result = await model.generateContent(prompt);
    const rawText = (await result.response.text())?.trim() ?? "";

    let json: AnalisisIAResult;

    try {
        const cleaned = extraerJsonDeRespuesta(rawText);
        json = JSON.parse(cleaned);
    } catch (error) {
        console.error("❌ No se pudo parsear JSON desde Gemini.");
        console.error("➡️ Error:", (error as Error).message);
        console.error("➡️ Respuesta cruda de Gemini:\n", rawText);
        throw new Error("La respuesta de Gemini no fue un JSON válido");
    }

    json.score_churn = Math.min(100, Math.max(0, Number(json.score_churn || 0)));

    return json;
}

function extraerJsonDeRespuesta(text: string): string {
    if (!text) {
        throw new Error("Respuesta vacía de Gemini");
    }

    let cleaned = text.trim();

    // 1. Eliminar posibles fences tipo ```json, ```JSON, ``` etc.
    cleaned = cleaned
        .replace(/```json/gi, "```")
        .replace(/```/g, "")
        .trim();

    // 2. Buscar el primer "{" y el último "}" para quedarnos solo con el objeto JSON
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
        throw new Error("No se encontró un objeto JSON válido entre llaves");
    }

    const soloJson = cleaned.substring(start, end + 1).trim();

    return soloJson;
}

