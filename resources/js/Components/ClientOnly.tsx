import { useEffect, useState, type ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

/**
 * Solo renderiza children en el cliente (post-hydration). En SSR y durante el
 * primer render del cliente devuelve `fallback`.
 *
 * Uso defensivo: envolver componentes que generan hydration mismatch (Date.now,
 * Math.random, valores que dependen del browser). No usar por costumbre — el
 * costo es perder SSR para ese subtree.
 */
export default function ClientOnly({ children, fallback = null }: Props) {
    const [hidratado, setHidratado] = useState(false)

    useEffect(() => {
        setHidratado(true)
    }, [])

    if (! hidratado) return <>{fallback}</>
    return <>{children}</>
}
