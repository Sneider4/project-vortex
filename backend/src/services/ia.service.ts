// src/services/ia.service.ts
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// src/services/ia.service.ts
export interface AnalisisIAResult {
    sentimiento: 'POSITIVO' | 'NEUTRO' | 'NEGATIVO';
    frustracion: 'BAJA' | 'MEDIA' | 'ALTA';
    score_churn: number;
    riesgo_churn: 'BAJO' | 'MEDIO' | 'ALTO';
    es_potencial_phishing: boolean;
    tiene_datos_sensibles: boolean;
    tipo_ticket: 'CORRECTIVO' | 'EVOLUTIVO' | 'OTRO';
    prioridad_ticket: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    recomendaciones: string;
}

export async function analizarTextoTicketConIA(
    descripcion: string,
    contexto?: { cliente?: string; contrato?: string }
): Promise<AnalisisIAResult> {
    const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

    const systemPrompt = `
        Eres un analista experto en soporte de software, experiencia de cliente, ciberseguridad y gestión de churn.
        Debes analizar el texto de un ticket y devolver SIEMPRE una respuesta en JSON válido.

        Instrucciones:
        - Escribe la salida ÚNICAMENTE como un JSON válido, sin texto adicional.
        - No incluyas comentarios ni explicaciones fuera del JSON.
        - Respeta estrictamente los valores permitidos abajo.

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
    `.trim();

    const completion = await openai.chat.completions.create({
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
        ],
        temperature: 0.2
    });

    const content = completion.choices[0]?.message?.content?.trim() || '';

    let json: AnalisisIAResult;
    try {
        json = JSON.parse(content);
    } catch (error) {
        console.error('❌ No se pudo parsear JSON desde OpenAI. Contenido:');
        console.error(content);
        throw new Error('La respuesta de OpenAI no fue un JSON válido');
    }

    json.score_churn = Math.min(100, Math.max(0, Number(json.score_churn || 0)));

    return json;
}
