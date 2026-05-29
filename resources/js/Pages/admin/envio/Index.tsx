import { type ReactNode, useEffect, useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { Truck, MapPin, PencilIcon, Trash2Icon, PlusIcon, Settings } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/AlertDialog'
import { cn } from '@/lib/utils'
import ZonaDialog, { type ZonaEnvio } from './parts/ZonaDialog'
import ModalConfiguracionEnvio from './parts/ModalConfiguracionEnvio'

interface Props {
    zonas: ZonaEnvio[]
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function TipoCostoBadge({ zona }: { zona: ZonaEnvio }) {
    if (zona.tipo_costo === 'gratis') {
        return <span className="text-sm font-semibold text-emerald-600">Gratis</span>
    }
    if (zona.tipo_costo === 'gratis_desde' && zona.umbral_gratis) {
        return (
            <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{formatPrecio(zona.costo ?? 0)}</p>
                <p className="text-xs text-emerald-600">Gratis desde {formatPrecio(zona.umbral_gratis)}</p>
            </div>
        )
    }
    return <span className="text-sm font-semibold text-slate-900">{formatPrecio(zona.costo ?? 0)}</span>
}

export default function EnvioIndex({ zonas }: Props) {
    const { props } = usePage<{ auth: { permissions: string[] }; flash?: { status?: string } }>()
    const puede = (p: string) => props.auth.permissions.includes('*') || props.auth.permissions.includes(p)
    const puedeEditar = puede('envio.editar')

    const [dialogOpen,   setDialogOpen]   = useState(false)
    const [configOpen,   setConfigOpen]   = useState(false)
    const [zonaEditar,   setZonaEditar]   = useState<ZonaEnvio | null>(null)
    const [zonaEliminar, setZonaEliminar] = useState<ZonaEnvio | null>(null)

    // Flash unificado: backend envía 'Zona creada/actualizada/eliminada.' Una
    // sola fuente de verdad. Reemplaza los toast.success hardcoded del frontend.
    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    function confirmarEliminarZona() {
        if (!zonaEliminar) return
        // Guard preventivo — backend también valida con can:envio.editar
        if (!puedeEditar) return

        router.delete(route('admin.envio.zonas.destroy', zonaEliminar.id), {
            preserveScroll: true,
            // toast.success viene del flash unificado. Solo cerramos el dialog.
            onSuccess: () => setZonaEliminar(null),
            onError:   (errors) => toast.error((errors.zona as string | undefined) ?? 'Error al eliminar'),
        })
    }

    function abrirNuevaZona() {
        setZonaEditar(null)
        setDialogOpen(true)
    }

    function abrirEditarZona(zona: ZonaEnvio) {
        setZonaEditar(zona)
        setDialogOpen(true)
    }

    const totalCiudades = (zona: ZonaEnvio) =>
        zona.departamentos.reduce((acc, d) => acc + d.ciudades.length, 0)

    return (
        <>
            <Head title="Métodos de envío" />

            <TooltipProvider>
                <div className="space-y-6">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                                <Truck className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-slate-900">Métodos de envío</h1>
                                <p className="text-xs text-slate-500">Define zonas con los departamentos y ciudades donde despachás.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Button variant="outline" size="sm" onClick={() => setConfigOpen(true)} disabled={!puedeEditar}>
                                            <Settings /> Configuración
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Button size="sm" onClick={abrirNuevaZona} disabled={!puedeEditar}>
                                            <PlusIcon /> Nueva zona
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                            </Tooltip>
                        </div>
                    </div>

                    {/* Zonas */}
                    {zonas.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-200 py-16 text-center">
                            <MapPin className="mx-auto mb-2 size-6 text-slate-400" />
                            <p className="text-sm text-slate-500">Aún no hay zonas creadas.</p>
                            <p className="text-xs text-slate-500 mt-1">Crea una zona para definir dónde y cuánto cobras por envío.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {zonas.map(zona => (
                                <div
                                    key={zona.id}
                                    className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-900">{zona.nombre}</p>
                                            <span className={cn(
                                                'text-xs font-medium rounded-full px-2 py-0.5',
                                                zona.activo
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-slate-100 text-slate-500'
                                            )}>
                                                {zona.activo ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {zona.departamentos.slice(0, 4).map(d => (
                                                <span
                                                    key={d.id}
                                                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                                                >
                                                    {d.nombre} ({d.ciudades.length})
                                                </span>
                                            ))}
                                            {zona.departamentos.length > 4 && (
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                                    +{zona.departamentos.length - 4} dptos más
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {zona.departamentos.length} {zona.departamentos.length === 1 ? 'departamento' : 'departamentos'} · {totalCiudades(zona)} {totalCiudades(zona) === 1 ? 'ciudad' : 'ciudades'}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <TipoCostoBadge zona={zona} />
                                    </div>
                                    {puedeEditar && (
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button variant="ghost" size="icon-sm" onClick={() => abrirEditarZona(zona)}>
                                                <PencilIcon />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => setZonaEliminar(zona)}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2Icon />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </TooltipProvider>

            {/* Dialog zonas */}
            <ZonaDialog
                open={dialogOpen}
                zona={zonaEditar}
                onClose={() => { setDialogOpen(false); setZonaEditar(null) }}
            />

            {/* Modal Mipaquete config */}
            <ModalConfiguracionEnvio
                open={configOpen}
                onClose={() => setConfigOpen(false)}
            />

            {/* AlertDialog confirmación de eliminación */}
            <AlertDialog open={!!zonaEliminar} onOpenChange={v => !v && setZonaEliminar(null)}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar zona?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminará la zona <strong>"{zonaEliminar?.nombre}"</strong> con todos sus departamentos y ciudades.
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={confirmarEliminarZona}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

EnvioIndex.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'Envío' },
    ]}>{page}</AdminLayout>
)
