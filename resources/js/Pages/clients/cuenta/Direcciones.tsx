import { type ReactNode, useMemo, useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { MapPin, Plus } from 'lucide-react'
import { toast } from 'sonner'
import ClientLayout from '@/Layouts/ClientLayout'
import { Button } from '@/Components/ui/Button'
import { AddressCard, type Direccion } from './parts/AddressCard'
import { AddressModal } from './parts/AddressModal'
import { FORM_VACIO, type CamposForm, type ZonaDepto } from './parts/AddressForm'

interface Zona {
    id: number
    nombre: string
    departamentos: ZonaDepto[]
}

interface Props {
    direcciones: Direccion[]
    zonas: Zona[]
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

    function abrirNueva() {
        setFormNueva(FORM_VACIO)
        setErrores({})
        setModalNueva(true)
    }

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

    function marcarPredeterminada(d: Direccion) {
        router.post(route('cuenta.direcciones.predeterminada', d.id), {}, {
            preserveState: true,
            onSuccess: () => toast.success('Dirección predeterminada actualizada'),
        })
    }

    return (
        <>
            <Head title="Mis direcciones" />

            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">
                    {direcciones.length} dirección{direcciones.length !== 1 ? 'es' : ''} guardada{direcciones.length !== 1 ? 's' : ''}
                </p>
                <Button size="sm" onClick={abrirNueva}>
                    <Plus /> Nueva dirección
                </Button>
            </div>

            {direcciones.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg py-16 text-center">
                    <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-700 mb-1">Sin direcciones guardadas</p>
                    <p className="text-xs text-slate-500">Agrega una dirección para agilizar tu próxima compra.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {direcciones.map(d => (
                        <AddressCard
                            key={d.id}
                            direccion={d}
                            onEditar={abrirEditar}
                            onEliminar={eliminar}
                            onMarcarPredeterminada={marcarPredeterminada}
                        />
                    ))}
                </div>
            )}

            <AddressModal
                open={modalNueva}
                onOpenChange={setModalNueva}
                titulo="Nueva dirección"
                form={formNueva}
                setForm={setFormNueva}
                errores={errores}
                onGuardar={guardarNueva}
                guardando={guardando}
                departamentosDisponibles={departamentosDisponibles}
            />

            <AddressModal
                open={!! editando}
                onOpenChange={(open) => { if (!open) setEditando(null) }}
                titulo="Editar dirección"
                form={formEditar}
                setForm={setFormEditar}
                errores={errores}
                onGuardar={guardarEdicion}
                guardando={guardando}
                departamentosDisponibles={departamentosDisponibles}
            />
        </>
    )
}

Direcciones.layout = (page: ReactNode) => (
    <ClientLayout tab="direcciones">{page}</ClientLayout>
)

export default Direcciones
