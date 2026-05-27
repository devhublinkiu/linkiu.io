import { createContext, useContext, useEffect, useState } from 'react'

export type CartItemOpcion = {
    cantidad:    number
    precio:      number
    label:       string
    badge:       string | null
    ahorroMonto: number | null
}

export type CartItem = {
    id:          string
    productoId?: number
    nombre:      string
    imagen:      string
    label:       string
    cantidad:    number
    precio:      number
    grupo?:      string
    opciones?:   CartItemOpcion[]
}

type CartContextType = {
    items: CartItem[]
    addItem: (item: Omit<CartItem, 'id'>) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, cantidad: number) => void
    replaceItem: (id: string, item: Omit<CartItem, 'id'>) => void
    clearCart: () => void
    count: number
    total: number
}

const CartContext = createContext<CartContextType>({
    items: [],
    addItem: () => {},
    removeItem: () => {},
    updateQuantity: () => {},
    replaceItem: () => {},
    clearCart: () => {},
    count: 0,
    total: 0,
})

/**
 * Convierte a número aceptando string numérico ("47600.00") — el backend
 * serializa decimales de MySQL como string en JSON. Retorna null si no
 * es parseable.
 */
function aNumero(v: unknown): number | null {
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim() !== '') {
        const n = Number(v)
        return Number.isFinite(n) ? n : null
    }
    return null
}

/**
 * Verifica que un item de localStorage tenga el shape esperado de CartItem.
 * Protege contra basura: items truncados, schemas viejos, JSON manipulado.
 *
 * Acepta precio como number o string numérico (Laravel devuelve decimales
 * como string en JSON).
 */
function esItemValido(x: unknown): x is CartItem {
    if (!x || typeof x !== 'object') return false
    const i = x as Record<string, unknown>
    const precio = aNumero(i.precio)
    return typeof i.id       === 'string'
        && typeof i.nombre   === 'string' && i.nombre.length > 0
        && precio !== null && precio >= 0
        && typeof i.cantidad === 'number' && Number.isInteger(i.cantidad) && i.cantidad > 0
        && typeof i.imagen   === 'string'
        && typeof i.label    === 'string'
}

/**
 * Normaliza un item ya validado: precio y precios de opciones quedan como
 * number aunque vinieran como string en localStorage. Garantiza que el
 * state interno siempre sea number puro.
 */
function normalizarItem(item: CartItem): CartItem {
    return {
        ...item,
        precio: aNumero(item.precio) ?? 0,
        opciones: Array.isArray(item.opciones)
            ? item.opciones.map(o => ({
                ...o,
                precio:      aNumero(o.precio)      ?? 0,
                ahorroMonto: aNumero(o.ahorroMonto),
            }))
            : item.opciones,
    }
}

/**
 * Carga el carrito desde localStorage filtrando items con shape inválido.
 * Si TODO está malformado, devuelve array vacío y limpia localStorage para
 * no acumular basura indefinidamente entre cargas.
 */
function cargarCarrito(): CartItem[] {
    if (typeof window === 'undefined') return []
    try {
        const guardado = localStorage.getItem('carrito')
        if (!guardado) return []

        const parsed = JSON.parse(guardado)
        if (!Array.isArray(parsed)) {
            localStorage.removeItem('carrito')
            return []
        }

        const validos = parsed.filter(esItemValido).map(normalizarItem)

        // Si filtramos algo o normalizamos precios string→number, re-persistir
        // el carrito limpio para no acumular basura entre cargas.
        if (validos.length !== parsed.length || JSON.stringify(validos) !== JSON.stringify(parsed)) {
            localStorage.setItem('carrito', JSON.stringify(validos))
        }

        return validos
    } catch {
        // JSON corrupto — limpiar para evitar errores en cada visita.
        localStorage.removeItem('carrito')
        return []
    }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    // En SSR localStorage no existe — arrancamos vacío y rehidratamos en client.
    // Sin el flag `hidratado`, el primer useEffect post-mount escribiría
    // `[]` a localStorage ANTES de leer lo guardado, borrando el carrito.
    const [items, setItems]         = useState<CartItem[]>([])
    const [hidratado, setHidratado] = useState(false)

    useEffect(() => {
        setItems(cargarCarrito())
        setHidratado(true)
    }, [])

    useEffect(() => {
        if (!hidratado) return
        localStorage.setItem('carrito', JSON.stringify(items))
    }, [items, hidratado])

    function addItem(item: Omit<CartItem, 'id'>) {
        setItems(prev => {
            const next = [{ ...item, id: String(Date.now()) }, ...prev]
            localStorage.setItem('carrito', JSON.stringify(next))
            return next
        })
    }

    function removeItem(id: string) {
        setItems(prev => prev.filter(i => i.id !== id))
    }

    function updateQuantity(id: string, cantidad: number) {
        if (cantidad < 1) return removeItem(id)
        setItems(prev => prev.map(i => i.id === id ? { ...i, cantidad } : i))
    }

    function replaceItem(id: string, item: Omit<CartItem, 'id'>) {
        setItems(prev => {
            const next = prev.map(i => i.id === id ? { ...item, id } : i)
            localStorage.setItem('carrito', JSON.stringify(next))
            return next
        })
    }

    function clearCart() {
        setItems([])
    }

    const count = items.reduce((acc, i) => acc + i.cantidad, 0)
    const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, replaceItem, clearCart, count, total }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    return useContext(CartContext)
}
