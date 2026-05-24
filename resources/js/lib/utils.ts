import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatea un número como precio colombiano: 89.900 (sin decimales, punto como separador de miles)
export function formatearPrecio(n: number): string {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.round(n))
}

/**
 * Genera un slug URL-friendly a partir de un nombre.
 *  - minúsculas
 *  - elimina diacríticos (Acción → accion)
 *  - solo letras, números y guiones
 *  - espacios → guiones
 *
 * Usado en categorías y productos para autocompletar el campo `slug`
 * al escribir el nombre. El backend valida la regla final con regex.
 */
export function generarSlug(nombre: string): string {
    return nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')   // marcas de combinación Unicode (tildes, virgulilla, etc.) tras NFD
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
}

/**
 * Calcula el rango de páginas a mostrar en la paginación canonical del admin.
 * Si hay <= 7 páginas, muestra todas. Si hay más, muestra:
 *   [1, ..., current-1, current, current+1, ..., last]
 *
 * Reutilizable en cualquier Index del admin que use el componente Pagination.
 */
export function rangoPaginacion(current: number, last: number): (number | 'ellipsis')[] {
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)

    const set = new Set<number>([1, last, current, current - 1, current + 1])
    const ordenados = Array.from(set).filter(n => n >= 1 && n <= last).sort((a, b) => a - b)

    const resultado: (number | 'ellipsis')[] = []
    for (let i = 0; i < ordenados.length; i++) {
        resultado.push(ordenados[i])
        if (i < ordenados.length - 1 && ordenados[i + 1] - ordenados[i] > 1) {
            resultado.push('ellipsis')
        }
    }
    return resultado
}