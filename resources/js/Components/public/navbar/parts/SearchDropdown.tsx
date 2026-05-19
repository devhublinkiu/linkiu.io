import { useEffect, useRef, useState } from 'react'
import { SearchIcon, XIcon } from 'lucide-react'

// Datos ficticios — se reemplazarán con datos reales del admin
const PRODUCTOS_FICTICIOS = [
    { id: 1, nombre: 'Serum Vitamina C', precio: 29900 },
    { id: 2, nombre: 'Crema Hidratante SPF 50', precio: 45900 },
    { id: 3, nombre: 'Tónico Facial Rosas', precio: 22900 },
    { id: 4, nombre: 'Mascarilla Arcilla Verde', precio: 18900 },
    { id: 5, nombre: 'Aceite Jojoba Puro', precio: 35900 },
]

function formatearPrecio(precio: number) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(precio)
}

interface SearchDropdownProps {
    open: boolean
    onClose: () => void
    anchorRef: React.RefObject<HTMLButtonElement | null>
}

export default function SearchDropdown({ open, onClose, anchorRef }: SearchDropdownProps) {
    const [query, setQuery] = useState('')
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const resultados = query.trim() === ''
        ? PRODUCTOS_FICTICIOS
        : PRODUCTOS_FICTICIOS.filter(p =>
            p.nombre.toLowerCase().includes(query.toLowerCase())
        )

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50)
        } else {
            setQuery('')
        }
    }, [open])

    useEffect(() => {
        if (!open) return

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        const handleClickFuera = (e: MouseEvent) => {
            const target = e.target as Node
            const fueraDropdown = dropdownRef.current && !dropdownRef.current.contains(target)
            const fueraAnchor = anchorRef.current && !anchorRef.current.contains(target)
            if (fueraDropdown && fueraAnchor) onClose()
        }

        document.addEventListener('keydown', handleKey)
        document.addEventListener('mousedown', handleClickFuera)
        return () => {
            document.removeEventListener('keydown', handleKey)
            document.removeEventListener('mousedown', handleClickFuera)
        }
    }, [open, onClose, anchorRef])

    if (!open) return null

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-screen max-w-xs sm:w-80 bg-white border border-slate-200 rounded-lg shadow-md z-50 overflow-hidden"
        >
            {/* Input de búsqueda */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100">
                <SearchIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="text-slate-400 hover:text-slate-600 transition-colors duration-200 ease-in-out"
                        aria-label="Limpiar búsqueda"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Resultados */}
            <div className="max-h-64 overflow-y-auto">
                {resultados.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-slate-400 text-center">
                        Sin resultados para "{query}"
                    </p>
                ) : (
                    resultados.map(producto => (
                        <button
                            key={producto.id}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors duration-200 ease-in-out text-left"
                        >
                            <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">
                                    {producto.nombre}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {formatearPrecio(producto.precio)}
                                </p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}
