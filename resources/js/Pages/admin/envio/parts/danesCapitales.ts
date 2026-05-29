// Mapeo nombre de departamento → código DANE de su capital (o ciudad
// principal en el caso de Cundinamarca). Usado para que el modal "Nueva
// zona" envíe los códigos a Mipaquete y reciba un rango sugerido por
// departamento. El nombre debe coincidir con el de api-colombia.com.

export const DANES_CAPITALES: Record<string, string> = {
    'Amazonas':            '91001000', // Leticia
    'Antioquia':           '05001000', // Medellín
    'Arauca':              '81001000', // Arauca
    'Atlántico':           '08001000', // Barranquilla
    'Bogotá D.C.':         '11001000', // Bogotá
    'Bolívar':             '13001000', // Cartagena
    'Boyacá':              '15001000', // Tunja
    'Caldas':              '17001000', // Manizales
    'Caquetá':             '18001000', // Florencia
    'Casanare':            '85001000', // Yopal
    'Cauca':               '19001000', // Popayán
    'Cesar':               '20001000', // Valledupar
    'Chocó':               '27001000', // Quibdó
    'Córdoba':             '23001000', // Montería
    'Cundinamarca':        '25754000', // Soacha (ciudad principal del depto fuera del DC)
    'Guainía':             '94001000', // Inírida
    'Guaviare':            '95001000', // San José del Guaviare
    'Huila':               '41001000', // Neiva
    'La Guajira':          '44001000', // Riohacha
    'Magdalena':           '47001000', // Santa Marta
    'Meta':                '50001000', // Villavicencio
    'Nariño':              '52001000', // Pasto
    'Norte de Santander':  '54001000', // Cúcuta
    'Putumayo':            '86001000', // Mocoa
    'Quindío':             '63001000', // Armenia
    'Risaralda':           '66001000', // Pereira
    'San Andrés y Providencia': '88001000', // San Andrés
    'Santander':           '68001000', // Bucaramanga
    'Sucre':               '70001000', // Sincelejo
    'Tolima':              '73001000', // Ibagué
    'Valle del Cauca':     '76001000', // Cali
    'Vaupés':              '97001000', // Mitú
    'Vichada':             '99001000', // Puerto Carreño
}

export function daneCapital(nombreDpto: string): string | undefined {
    return DANES_CAPITALES[nombreDpto]
}
