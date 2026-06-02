import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
    minHeight: string
    children:  ReactNode
}

/**
 * Renderiza un placeholder con altura estimada y monta children cuando el
 * bloque se acerca al viewport (rootMargin 300px). Pensado para diferir el
 * mount de bloques below-the-fold sin afectar layout — el placeholder reserva
 * el espacio y evita CLS.
 */
export default function LazyOnVisible({ minHeight, children }: Props) {
    const ref               = useRef<HTMLDivElement>(null)
    const [visible, setVis] = useState(false)

    useEffect(() => {
        if (visible)   return
        if (! ref.current) return

        const io = new IntersectionObserver(
            entries => {
                if (entries.some(e => e.isIntersecting)) {
                    setVis(true)
                    io.disconnect()
                }
            },
            { rootMargin: '300px' }
        )
        io.observe(ref.current)
        return () => io.disconnect()
    }, [visible])

    return (
        <div ref={ref} style={{ minHeight: visible ? undefined : minHeight }}>
            {visible && <Suspense fallback={null}>{children}</Suspense>}
        </div>
    )
}
