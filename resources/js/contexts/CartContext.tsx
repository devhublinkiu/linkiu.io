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
 * Verifica que un item de localStorage tenga el shape esperado de CartItem.
 * Protege contra basura: items truncados, schemas viejos, JSON manipulado.
 */
function esItemValido(x: unknown): x is CartItem {
    if (!x || typeof x !== 'object') return false
    const i = x as Record<string, unknown>
    return typeof i.id       === 'string'
        && typeof i.nombre   === 'string' && i.nombre.length > 0
        && typeof i.precio   === 'number' && Number.isFinite(i.precio) && i.precio >= 0
        && typeof i.cantidad === 'number' && Number.isInteger(i.cantidad) && i.cantidad > 0
        && typeof i.imagen   === 'string'
        && typeof i.label    === 'string'
}

/**
 * Carga el carrito desde localStorage filtrando items con shape inválido.
 * Si TODO está malformado, devuelve array vacío y limpia localStorage para
 * no acumular basura indefinidamente entre cargas.
 */
function cargarCarrito(): CartItem[] {
    try {
        const guardado = localStorage.getItem('carrito')
        if (!guardado) return []

        const parsed = JSON.parse(guardado)
        if (!Array.isArray(parsed)) {
            localStorage.removeItem('carrito')
            return []
        }

        const validos = parsed.filter(esItemValido)

        // Si filtramos algo, re-persistir el carrito limpio para no acumular
        // basura entre cargas y mantener localStorage liviano.
        if (validos.length !== parsed.length) {
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
    const [items, setItems] = useState<CartItem[]>(cargarCarrito)

    useEffect(() => {
        localStorage.setItem('carrito', JSON.stringify(items))
    }, [items])

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
