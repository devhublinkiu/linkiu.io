/**
 * Construye un link `wa.me/...` a partir de un teléfono escrito en
 * cualquiera de los formatos comunes en Colombia: con o sin código
 * país, con/sin '+', con espacios o guiones.
 *
 * Aplica la misma normalización que `WhatsappService::normalizarTelefono`
 * del backend para mantener simetría: un teléfono válido por el rule
 * `TelefonoMovilCO` produce un link funcional aquí.
 */
export function whatsappLink(telefono: string): string {
    const digits = telefono.replace(/\D/g, '')

    // Ya viene con código país (57 + 10 dígitos)
    if (digits.length === 12 && digits.startsWith('57')) {
        return `https://wa.me/${digits}`
    }

    // 10 dígitos asumimos móvil CO sin código país
    return `https://wa.me/57${digits}`
}
