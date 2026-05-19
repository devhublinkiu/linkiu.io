import { useEffect, useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { ChevronDownIcon, ChevronRightIcon, Loader2Icon, XIcon } from 'lucide-react'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/Components/ui/InputGroup'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/Components/ui/Dialog'
import { cn } from '@/lib/utils'

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface Ciudad {
    id: number
    nombre: string
}

interface DepartamentoSeleccionado {
    id: number
    nombre: string
    ciudades: Ciudad[]
}

export interface ZonaEnvio {
    id: number
    nombre: string
    departamentos: DepartamentoSeleccionado[]
    tipo_costo: 'gratis' | 'costo_fijo' | 'gratis_desde'
    costo: number | null
    umbral_gratis: number | null
    activo: boolean
    orden: number
}

interface DptoApi {
    id: number
    name: string
}

interface CiudadApi {
    id: number
    name: string
    departmentId: number
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtInput(v: string): string {
    if (!v) return ''
    const n = parseInt(v, 10)
    return isNaN(n) ? '' : new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function stripFmt(v: string): string {
    return v.replace(/\./g, '').replace(/\D/g, '')
}

// ── Fila de departamento ──────────────────────────────────────────────────────

interface DptoRowProps {
    dpto: DptoApi
    ciudades: Ciudad[]        // ya filtradas y ordenadas para este dpto
    cargando: boolean         // carga global pendiente
    seleccionado: DepartamentoSeleccionado | undefined
    onToggleDpto: (dpto: DptoApi) => void
    onToggloCiudad: (dptoId: number, ciudad: Ciudad) => void
}

function DptoRow({ dpto, ciudades, cargando, seleccionado, onToggleDpto, onToggloCiudad }: DptoRowProps) {
    const [expandido, setExpandido] = useState(false)
    const [busqueda,  setBusqueda]  = useState('')

    const filtradas = busqueda
        ? ciudades.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()))
        : ciudades

    const todasSeleccionadas = seleccionado && ciudades.length > 0 &&
        ciudades.every(c => seleccionado.ciudades.some(sc => sc.id === c.id))

    function toggleTodas() {
        if (!seleccionado) {
            onToggleDpto(dpto)
        } else if (todasSeleccionadas) {
            onToggleDpto(dpto)
        } else {
            ciudades.forEach(c => {
                if (!seleccionado.ciudades.some(sc => sc.id === c.id)) {
                    onToggloCiudad(dpto.id, c)
                }
            })
        }
    }

    return (
        <div className="border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors duration-200 ease-in-out">
                <input
                    type="checkbox"
                    checked={!!seleccionado}
                    onChange={() => onToggleDpto(dpto)}
                    className="h-3.5 w-3.5 rounded border-slate-300 accent-slate-900 shrink-0"
                />
                <button
                    onClick={() => setExpandido(v => !v)}
                    className="flex flex-1 items-center gap-1.5 text-left min-w-0"
                >
                    {expandido
                        ? <ChevronDownIcon className="size-3.5 text-slate-400 shrink-0" />
                        : <ChevronRightIcon className="size-3.5 text-slate-400 shrink-0" />
                    }
                    <span className="text-sm text-slate-700 truncate">{dpto.name}</span>
                    {seleccionado && (
                        <span className="ml-auto shrink-0 text-[10px] text-slate-400">
                            {seleccionado.ciudades.length} ciudades
                        </span>
                    )}
                </button>
            </div>

            {expandido && (
                <div className="ml-8 border-l border-slate-100 pb-2">
                    {cargando ? (
                        <div className="flex items-center gap-2 px-3 py-3">
                            <Loader2Icon className="size-3.5 animate-spin text-slate-400" />
                            <span className="text-xs text-slate-400">Cargando ciudades…</span>
                        </div>
                    ) : (
                        <>
                            <div className="px-3 pt-2 pb-1">
                                <Input
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                    placeholder="Buscar ciudad..."
                                    className="text-xs h-7"
                                />
                            </div>
                            {ciudades.length > 0 && !busqueda && (
                                <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-slate-50 transition-colors duration-200 ease-in-out">
                                    <input
                                        type="checkbox"
                                        checked={!!todasSeleccionadas}
                                        onChange={toggleTodas}
                                        className="h-3.5 w-3.5 rounded border-slate-300 accent-slate-900"
                                    />
                                    <span className="text-xs font-semibold text-slate-600">Todas las ciudades</span>
                                </label>
                            )}
                            <div className="max-h-36 overflow-y-auto">
                                {filtradas.map(ciudad => {
                                    const marcada = !!seleccionado?.ciudades.some(sc => sc.id === ciudad.id)
                                    return (
                                        <label
                                            key={ciudad.id}
                                            className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-slate-50 transition-colors duration-200 ease-in-out"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={marcada}
                                                onChange={() => {
                                                    if (!seleccionado) onToggleDpto(dpto)
                                                    onToggloCiudad(dpto.id, ciudad)
                                                }}
                                                className="h-3.5 w-3.5 rounded border-slate-300 accent-slate-900"
                                            />
                                            <span className="text-xs text-slate-600">{ciudad.nombre}</span>
                                        </label>
                                    )
                                })}
                                {filtradas.length === 0 && (
                                    <p className="px-3 py-3 text-xs text-slate-400">Sin resultados</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

// ── Componente principal ──────────────────────────────────────────────────────

interface Props {
    open: boolean
    zona: ZonaEnvio | null
    onClose: () => void
}

export default function ZonaDialog({ open, zona, onClose }: Props) {
    const [nombre,        setNombre]        = useState('')
    const [seleccionados, setSeleccionados] = useState<DepartamentoSeleccionado[]>([])
    const [tipoCosto,     setTipoCosto]     = useState<'gratis' | 'costo_fijo' | 'gratis_desde'>('costo_fijo')
    const [costo,         setCosto]         = useState('')
    const [umbral,        setUmbral]        = useState('')
    const [busquedaDpto,  setBusquedaDpto]  = useState('')
    const [guardando,     setGuardando]     = useState(false)

    const [dptos,   setDptos]   = useState<DptoApi[]>([])
    const [ciudades, setCiudades] = useState<CiudadApi[]>([])
    const [cargando, setCargando] = useState(false)

    // Carga departamentos y ciudades una sola vez
    useEffect(() => {
        if (!open) return
        if (dptos.length > 0) return   // ya cargado

        setCargando(true)
        Promise.all([
            fetch('https://api-colombia.com/api/v1/Department').then(r => r.json()),
            fetch('https://api-colombia.com/api/v1/City').then(r => r.json()),
        ])
            .then(([dptoData, cityData]: [DptoApi[], CiudadApi[]]) => {
                setDptos((dptoData as DptoApi[]).sort((a, b) => a.name.localeCompare(b.name)))
                setCiudades(cityData as CiudadApi[])
            })
            .catch(() => toast.error('No se pudo cargar los datos de Colombia'))
            .finally(() => setCargando(false))
    }, [open, dptos.length])

    // Resetea formulario al abrir / cambiar zona
    useEffect(() => {
        if (!open) return
        if (zona) {
            setNombre(zona.nombre)
            setSeleccionados(zona.departamentos)
            setTipoCosto(zona.tipo_costo)
            setCosto(zona.costo != null ? String(zona.costo) : '')
            setUmbral(zona.umbral_gratis != null ? String(zona.umbral_gratis) : '')
        } else {
            setNombre('')
            setSeleccionados([])
            setTipoCosto('costo_fijo')
            setCosto('')
            setUmbral('')
        }
        setBusquedaDpto('')
    }, [open, zona])

    // Mapa dptoId → Ciudad[] (ordenadas), computado una sola vez cuando ciudades carga
    const ciudadesPorDpto = useMemo(() => {
        const map: Record<number, Ciudad[]> = {}
        ciudades.forEach(c => {
            if (!map[c.departmentId]) map[c.departmentId] = []
            map[c.departmentId].push({ id: c.id, nombre: c.name })
        })
        Object.values(map).forEach(arr => arr.sort((a, b) => a.nombre.localeCompare(b.nombre)))
        return map
    }, [ciudades])

    function toggleDpto(dpto: DptoApi) {
        setSeleccionados(prev => {
            const existe = prev.some(d => d.id === dpto.id)
            if (existe) return prev.filter(d => d.id !== dpto.id)
            const ciudadesDelDpto = ciudadesPorDpto[dpto.id] ?? []
            return [...prev, { id: dpto.id, nombre: dpto.name, ciudades: ciudadesDelDpto }]
        })
    }

    function toggleCiudad(dptoId: number, ciudad: Ciudad) {
        setSeleccionados(prev =>
            prev
                .map(d => {
                    if (d.id !== dptoId) return d
                    const existe = d.ciudades.some(c => c.id === ciudad.id)
                    const nuevas = existe
                        ? d.ciudades.filter(c => c.id !== ciudad.id)
                        : [...d.ciudades, ciudad]
                    return nuevas.length === 0 ? null : { ...d, ciudades: nuevas }
                })
                .filter((d): d is DepartamentoSeleccionado => d !== null)
        )
    }

    function guardar() {
        const payload = {
            nombre,
            departamentos: seleccionados,
            tipo_costo:    tipoCosto,
            costo:         tipoCosto !== 'gratis' && costo !== '' ? parseInt(costo) : null,
            umbral_gratis: tipoCosto === 'gratis_desde' && umbral !== '' ? parseInt(umbral) : null,
        }

        setGuardando(true)
        const routeName = zona ? 'admin.envio.zonas.update' : 'admin.envio.zonas.store'
        const routeArgs = zona ? zona.id : undefined

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.post(route(routeName, routeArgs), payload as any, {
            preserveScroll: true,
            onSuccess: () => { toast.success(zona ? 'Zona actualizada' : 'Zona creada'); onClose() },
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    const dptosFiltrados = dptos.filter(d =>
        d.name.toLowerCase().includes(busquedaDpto.toLowerCase())
    )

    const totalCiudades = seleccionados.reduce((acc, d) => acc + d.ciudades.length, 0)
    const canGuardar = nombre.trim() !== '' && seleccionados.length > 0 && totalCiudades > 0

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{zona ? 'Editar zona' : 'Nueva zona de envío'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-1">

                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">Nombre de la zona</label>
                        <Input
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            placeholder="Ej. Costa Atlántica"
                            className="text-sm"
                        />
                    </div>

                    {/* Departamentos y ciudades */}
                    <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between">
                            <label className="text-xs font-medium text-slate-700">Departamentos y ciudades</label>
                            {seleccionados.length > 0 && (
                                <span className="text-[10px] text-slate-400">
                                    {seleccionados.length} dptos · {totalCiudades} ciudades
                                </span>
                            )}
                        </div>

                        {/* Chips seleccionados */}
                        {seleccionados.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {seleccionados.map(d => (
                                    <span
                                        key={d.id}
                                        className="flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs text-white"
                                    >
                                        {d.nombre} ({d.ciudades.length})
                                        <button
                                            onClick={() => setSeleccionados(prev => prev.filter(s => s.id !== d.id))}
                                            className="text-slate-400 hover:text-white transition-colors duration-200 ease-in-out"
                                        >
                                            <XIcon className="size-2.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <Input
                            value={busquedaDpto}
                            onChange={e => setBusquedaDpto(e.target.value)}
                            placeholder="Buscar departamento..."
                            className="text-sm"
                        />

                        <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200">
                            {cargando ? (
                                <div className="flex items-center justify-center gap-2 py-8">
                                    <Loader2Icon className="size-4 animate-spin text-slate-400" />
                                    <span className="text-xs text-slate-400">Cargando…</span>
                                </div>
                            ) : dptosFiltrados.length === 0 ? (
                                <p className="py-6 text-center text-xs text-slate-400">Sin resultados</p>
                            ) : (
                                dptosFiltrados.map(d => (
                                    <DptoRow
                                        key={d.id}
                                        dpto={d}
                                        ciudades={ciudadesPorDpto[d.id] ?? []}
                                        cargando={cargando}
                                        seleccionado={seleccionados.find(s => s.id === d.id)}
                                        onToggleDpto={toggleDpto}
                                        onToggloCiudad={toggleCiudad}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Tipo de costo */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-700">Costo de envío</label>
                        <div className="grid grid-cols-3 gap-2">
                            {([
                                { clave: 'gratis',       label: 'Gratis',       desc: 'Sin costo' },
                                { clave: 'costo_fijo',   label: 'Costo fijo',   desc: 'Un precio único' },
                                { clave: 'gratis_desde', label: 'Gratis desde', desc: 'Gratis a partir de' },
                            ] as const).map(op => (
                                <button
                                    key={op.clave}
                                    onClick={() => setTipoCosto(op.clave)}
                                    className={cn(
                                        'flex flex-col items-start rounded-lg border p-3 text-left transition-colors duration-200 ease-in-out',
                                        tipoCosto === op.clave
                                            ? 'border-slate-900 bg-slate-50'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                    )}
                                >
                                    <span className={cn('text-xs font-semibold', tipoCosto === op.clave ? 'text-slate-900' : 'text-slate-700')}>
                                        {op.label}
                                    </span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">{op.desc}</span>
                                </button>
                            ))}
                        </div>

                        {(tipoCosto === 'costo_fijo' || tipoCosto === 'gratis_desde') && (
                            <div className={cn('grid gap-3', tipoCosto === 'gratis_desde' ? 'grid-cols-2' : 'grid-cols-1')}>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500">
                                        {tipoCosto === 'gratis_desde' ? 'Costo base' : 'Costo'}
                                    </label>
                                    <InputGroup>
                                        <InputGroupAddon>$</InputGroupAddon>
                                        <InputGroupInput
                                            type="text"
                                            inputMode="numeric"
                                            value={fmtInput(costo)}
                                            onChange={e => setCosto(stripFmt(e.target.value))}
                                            placeholder="9.900"
                                            className="text-sm"
                                        />
                                    </InputGroup>
                                </div>
                                {tipoCosto === 'gratis_desde' && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500">Gratis a partir de</label>
                                        <InputGroup>
                                            <InputGroupAddon>$</InputGroupAddon>
                                            <InputGroupInput
                                                type="text"
                                                inputMode="numeric"
                                                value={fmtInput(umbral)}
                                                onChange={e => setUmbral(stripFmt(e.target.value))}
                                                placeholder="89.900"
                                                className="text-sm"
                                            />
                                        </InputGroup>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={guardando}>Cancelar</Button>
                    <Button onClick={guardar} disabled={guardando || !canGuardar}>
                        {guardando ? 'Guardando…' : zona ? 'Guardar cambios' : 'Crear zona'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
