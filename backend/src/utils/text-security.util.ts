import { PreprocesamientoTextoResult } from "../models/ticket.model";

export function procesarDatosSensibles(texto: string): {
    textoAnonimizado: string;
    tieneDatosSensibles: boolean;
} {
    let anon = texto;
    let flag = false;

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    if (emailRegex.test(anon)) {
        flag = true;
        anon = anon.replace(emailRegex, "[EMAIL_OCULTO]");
    }

    const numerosLargosRegex = /\b\d{8,}\b/g;
    if (numerosLargosRegex.test(anon)) {
        flag = true;
        anon = anon.replace(numerosLargosRegex, "[NUMERO_SENSIBLE]");
    }

    // Palabras asociadas a credenciales
    const palabrasClave = [
        "contraseña",
        "password",
        "clave",
        "pass",
        "usuario",
        "login",
        "credencial",
    ];

    const contienePalabraClave = palabrasClave.some((p) =>
        texto.toLowerCase().includes(p)
    );

    if (contienePalabraClave) {
        flag = true;
        // No podemos anonimizar solo con esa palabra, pero dejamos el flag
    }

    return {
        textoAnonimizado: anon,
        tieneDatosSensibles: flag,
    };
}

// Detección de indicios de phishing en el texto.

export function detectarPhishingSospechoso(texto: string): boolean {
    const t = texto.toLowerCase();

    const patrones = [
        "verifique su cuenta",
        "verificar su cuenta",
        "actualice sus datos",
        "actualizar sus datos",
        "su cuenta será bloqueada",
        "su cuenta sera bloqueada",
        "haga clic en el siguiente enlace",
        "click en el siguiente enlace",
        "urgente",
        "inmediatamente",
        "ha sido comprometida",
    ];

    const tieneUrl = /https?:\/\/[^\s]+/i.test(texto);

    const matchPatrones = patrones.some((p) => t.includes(p));

    return tieneUrl && matchPatrones;
}

/**
 * Función central: preprocesa el texto del ticket para fines de seguridad.
 */
export function preprocesarTextoTicket(
    descripcion: string
): PreprocesamientoTextoResult {
    const { textoAnonimizado, tieneDatosSensibles } =
        procesarDatosSensibles(descripcion);

    const esPhishingSospechoso = detectarPhishingSospechoso(descripcion);

    return {
        textoOriginal: descripcion,
        textoAnonimizado,
        tieneDatosSensibles,
        esPhishingSospechoso,
    };
}