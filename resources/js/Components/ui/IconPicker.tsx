import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { ICONOS, getIcono } from '@/lib/iconos'

interface Props {
    value:    string
    onChange: (v: string) => void
}

export default function IconPicker({ value, onChange }: Props) {
    const [open,   setOpen]   = useState(false)
    const [buscar, setBuscar] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef     = useRef<HTMLInputElement>(null)

    const filtrados = buscar.trim()
        ? ICONOS.filter(i => i.key.includes(buscar.toLowerCase().trim()))
        : ICONOS

    // Click outside
    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setOpen(false)
                setBuscar('')
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    // Focus al abrir
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 50)
    }, [open])

    const SelectedIcon = getIcono(value)

    return (
        <div ref={containerRef} className="relative">

            {/* Trigger — solo icono */}
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 focus:outline-none"
            >
                <SelectedIcon className="size-4" />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 left-0 top-full mt-1 w-64 rounded-lg border border-slate-200 bg-white shadow-lg">

                    {/* Buscador */}
                    <div className="flex items-center gap-2 border-b border-slate-100 px-2.5 py-2">
                        <Search className="size-3.5 shrink-0 text-slate-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Buscar…"
                            value={buscar}
                            onChange={e => setBuscar(e.target.value)}
                            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        />
                        <ChevronDown className="size-3.5 shrink-0 text-slate-300" />
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-8 gap-0.5 p-2 max-h-48 overflow-y-auto">
                        {filtrados.length === 0 && (
                            <p className="col-span-8 py-3 text-center text-xs text-slate-400">Sin resultados</p>
                        )}
                        {filtrados.map(({ key, Icon }) => (
                            <button
                                key={key}
                                type="button"
                                title={key}
                                onClick={() => { onChange(key); setOpen(false); setBuscar('') }}
                                className={`flex items-center justify-center rounded-md p-1.5 transition-colors duration-200 hover:bg-slate-100 ${
                                    value === key ? 'bg-slate-100 ring-1 ring-slate-300' : ''
                                }`}
                            >
                                <Icon className="size-4 text-slate-700" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
