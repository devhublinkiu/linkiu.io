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

function cargarCarrito(): CartItem[] {
    try {
        const guardado = localStorage.getItem('carrito')
        return guardado ? JSON.parse(guardado) : []
    } catch {
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
