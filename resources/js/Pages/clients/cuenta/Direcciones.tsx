import { type ReactNode, useMemo, useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { Plus, MapPin, Star, Pencil, Trash2, XIcon, CheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import ClientLayout from '@/Layouts/ClientLayout'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Button } from '@/Components/ui/Button'
import { cn } from '@/lib/utils'

interface Direccion {
    id: number
    etiqueta: string | null
    departamento: string
    ciudad: string
    direccion: string
    apartamento: string | null
    predeterminada: boolean
}

interface ZonaDepto {
    id: number
    nombre: string
    ciudades: { id: number; nombre: string }[]
}

interface Zona {
    id: number
    nombre: string
    departamentos: ZonaDepto[]
}

interface Props {
    direcciones: Direccion[]
    zonas: Zona[]
}

const FORM_VACIO = { etiqueta: '', departamento: '', ciudad: '', direccion: '', apartamento: '' }
type CamposForm = typeof FORM_VACIO

const SELECT_BASE = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:border-slate-400 transition-colors duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed'

function DireccionModal({
    titulo, form, setForm, errores, onGuardar, onCerrar, guardando, departamentosDisponibles,
}: {
    titulo: string
    form: CamposForm
    setForm: (f: CamposForm) => void
    errores: Record<string, string>
    onGuardar: () => void
    onCerrar: () => void
    guardando: boolean
    departamentosDisponibles: ZonaDepto[]
}) {
    const ciudadesDisponibles = departamentosDisponibles.find(d => d.nombre === form.departamento)?.ciudades ?? []

    function handleDepartamento(v: string) {
        setForm({ ...form, departamento: v, ciudad: '' })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCerrar}>
            <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-900">{titulo}</span>
                    <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600 transition-colors duration-200">
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-5 py-4 flex flex-col gap-3">
                    {/* Etiqueta */}
                    <div className="space-y-1">
                        <Label>Nombre de la dirección <span className="text-slate-400 font-normal">(opcional)</span></Label>
                        <Input
                            value={form.etiqueta}
                            onChange={e => setForm({ ...form, etiqueta: e.target.value })}
                            placeholder="Ej. Mi casa, Oficina…"
                        />
                    </div>

                    {/* Departamento + Ciudad */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>Departamento</Label>
                            <select
                                value={form.departamento}
                                onChange={e => handleDepartamento(e.target.value)}
                                className={cn(SELECT_BASE, errores.departamento && 'border-red-300')}
                            >
                                <option value="">Selecciona</option>
                                {departamentosDisponibles.map(d => (
                                    <option key={d.id} value={d.nombre}>{d.nombre}</option>
                                ))}
                            </select>
                            {errores.departamento && <p className="text-xs text-red-500">{errores.departamento}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label>Ciudad</Label>
                            <select
                                value={form.ciudad}
                                onChange={e => setForm({ ...form, ciudad: e.target.value })}
                                disabled={!form.departamento}
                                className={cn(SELECT_BASE, errores.ciudad && 'border-red-300')}
                            >
                                <option value="">{form.departamento ? 'Selecciona' : '—'}</option>
                                {ciudadesDisponibles.map(c => (
                                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                                ))}
                            </select>
                            {errores.ciudad && <p className="text-xs text-red-500">{errores.ciudad}</p>}
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="space-y-1">
                        <Label>Dirección</Label>
                        <Input
                            value={form.direccion}
                            onChange={e => setForm({ ...form, direccion: e.target.value })}
                            placeholder="Calle 100 #15-20"
                            className={errores.direccion ? 'border-red-300' : ''}
                        />
                        {errores.direccion && <p className="text-xs text-red-500">{errores.direccion}</p>}
                    </div>

                    {/* Apartamento */}
                    <div className="space-y-1">
                        <Label>Apto / Casa / Interior <span className="text-slate-400 font-normal">(opcional)</span></Label>
                        <Input
                            value={form.apartamento}
                            onChange={e => setForm({ ...form, apartamento: e.target.value })}
                            placeholder="Apto 301"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
                    <button onClick={onCerrar} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-200">
                        Cancelar
                    </button>
                    <Button onClick={onGuardar} disabled={guardando}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

function Direcciones() {
    const { direcciones, zonas } = usePage<Props>().props

    const departamentosDisponibles = useMemo(() => {
        const map = new Map<number, ZonaDepto>()
        zonas.forEach(zona => {
            zona.departamentos.forEach(d => {
                if (!map.has(d.id)) map.set(d.id, { id: d.id, nombre: d.nombre, ciudades: [] })
                const existing = map.get(d.id)!
                d.ciudades.forEach(c => {
                    if (!existing.ciudades.some(ec => ec.id === c.id)) existing.ciudades.push(c)
                })
            })
        })
        return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
    }, [zonas])

    const [modalNueva,  setModalNueva]  = useState(false)
    const [editando,    setEditando]    = useState<Direccion | null>(null)
    const [formNueva,   setFormNueva]   = useState<CamposForm>(FORM_VACIO)
    const [formEditar,  setFormEditar]  = useState<CamposForm>(FORM_VACIO)
    const [errores,     setErrores]     = useState<Record<string, string>>({})
    const [guardando,   setGuardando]   = useState(false)

    function abrirEditar(d: Direccion) {
        setFormEditar({
            etiqueta:     d.etiqueta    ?? '',
            departamento: d.departamento,
            ciudad:       d.ciudad,
            direccion:    d.direccion,
            apartamento:  d.apartamento ?? '',
        })
        setEditando(d)
        setErrores({})
    }

    function guardarNueva() {
        setErrores({})
        setGuardando(true)
        router.post(route('cuenta.direcciones.store'), formNueva, {
            preserveState: true,
            onSuccess: () => { setModalNueva(false); setFormNueva(FORM_VACIO); toast.success('Dirección agregada') },
            onError: e => setErrores(e),
            onFinish: () => setGuardando(false),
        })
    }

    function guardarEdicion() {
        if (!editando) return
        setErrores({})
        setGuardando(true)
        router.post(route('cuenta.direcciones.update', editando.id), formEditar, {
            preserveState: true,
            onSuccess: () => { setEditando(null); toast.success('Dirección actualizada') },
            onError: e => setErrores(e),
            onFinish: () => setGuardando(false),
        })
    }

    function eliminar(d: Direccion) {
        router.delete(route('cuenta.direcciones.destroy', d.id), {
            preserveState: true,
            onSuccess: () => toast.success('Dirección eliminada'),
        })
    }

    function setPredeterminada(d: Direccion) {
        router.post(route('cuenta.direcciones.predeterminada', d.id), {}, { preserveState: true })
    }

    return (
        <>
            <Head title="Mis direcciones" />

            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">{direcciones.length} dirección{direcciones.length !== 1 ? 'es' : ''} guardada{direcciones.length !== 1 ? 's' : ''}</p>
                <button
                    onClick={() => { setFormNueva(FORM_VACIO); setErrores({}); setModalNueva(true) }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200"
                >
                    <Plus className="w-3.5 h-3.5" /> Nueva dirección
                </button>
            </div>

            {direcciones.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">
                    <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-700 mb-1">Sin direcciones guardadas</p>
                    <p className="text-xs text-slate-400">Agrega una dirección para agilizar tu próxima compra.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {direcciones.map(d => (
                        <div key={d.id} className={`bg-white border rounded-xl p-5 ${d.predeterminada ? 'border-slate-900' : 'border-slate-200'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {d.etiqueta || d.ciudad}
                                        </p>
                                        {d.predeterminada && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-700">
                                                <Star className="w-2.5 h-2.5" /> Predeterminada
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">{d.direccion}{d.apartamento ? `, ${d.apartamento}` : ''}</p>
                                    <p className="text-xs text-slate-400">{d.ciudad}, {d.departamento}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {!d.predeterminada && (
                                        <button
                                            onClick={() => setPredeterminada(d)}
                                            title="Marcar como predeterminada"
                                            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors duration-200"
                                        >
                                            <CheckIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => abrirEditar(d)}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors duration-200"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => eliminar(d)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors duration-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalNueva && (
                <DireccionModal
                    titulo="Nueva dirección"
                    form={formNueva}
                    setForm={setFormNueva}
                    errores={errores}
                    onGuardar={guardarNueva}
                    onCerrar={() => setModalNueva(false)}
                    guardando={guardando}
                    departamentosDisponibles={departamentosDisponibles}
                />
            )}

            {editando && (
                <DireccionModal
                    titulo="Editar dirección"
                    form={formEditar}
                    setForm={setFormEditar}
                    errores={errores}
                    onGuardar={guardarEdicion}
                    onCerrar={() => setEditando(null)}
                    guardando={guardando}
                    departamentosDisponibles={departamentosDisponibles}
                />
            )}
        </>
    )
}

Direcciones.layout = (page: ReactNode) => (
    <ClientLayout tab="direcciones">{page}</ClientLayout>
)

export default Direcciones
