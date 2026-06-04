import { type ReactNode, useEffect } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { AlertOctagon } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import FormResetFunelinks from './parts/FormResetFunelinks'
import AuditLog from './parts/AuditLog'

export interface ProductoOpt {
    id:     number
    nombre: string
}

export interface AuditOrden {
    id:                  number
    codigos:             string[]
    motivo:              string
    total_eliminado_cop: number
    usuario:             string | null
    eliminado_at:        string
}

export interface AuditFunelinks {
    id:               number
    rango_desde:      string
    rango_hasta:      string
    producto:         string | null
    borrado_sesiones: boolean
    borrado_visitas:  boolean
    borrado_fomo:     boolean
    conteo_sesiones:  number
    conteo_visitas:   number
    conteo_fomo:      number
    motivo:           string
    usuario:          string | null
    ejecutado_at:     string
}

interface Props {
    productos: ProductoOpt[]
    audit: {
        ordenes:   AuditOrden[]
        funelinks: AuditFunelinks[]
    }
}

function ResetCampana() {
    const page = usePage<Props & { flash?: { status?: string } }>().props
    const { productos, audit, flash } = page

    useEffect(() => {
        if (flash?.status) toast.success(flash.status)
    }, [flash?.status])

    return (
        <>
            <Head title="Reset campaña" />

            <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                    <AlertOctagon className="w-4 h-4 text-red-600" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold text-slate-900">Reset de campaña</h1>
                    <p className="text-xs text-slate-500">
                        Borra datos de Funelinks por rango. Acciones permanentes. Toda operación queda registrada abajo.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl space-y-8">
                <FormResetFunelinks productos={productos} />
                <AuditLog ordenes={audit.ordenes} funelinks={audit.funelinks} />
            </div>
        </>
    )
}

ResetCampana.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'Reset campaña' },
    ]}>{page}</AdminLayout>
)

export default ResetCampana
