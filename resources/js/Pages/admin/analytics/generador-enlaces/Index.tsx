import { type ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Link2 } from 'lucide-react'
import { FormularioUTM } from './parts/FormularioUTM'

interface Producto {
    id:     number
    nombre: string
    slug:   string
}

interface PaginaFija {
    valor:  string
    nombre: string
}

interface Props {
    productos:     Producto[]
    paginas_fijas: PaginaFija[]
    base_url:      string
}

function GeneradorEnlaces({ productos = [], paginas_fijas = [], base_url = '' }: Props) {
    return (
        <>
            <Head title="Generador de enlaces" />

            <div className="space-y-4">
                {/* Header canonical */}
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Link2 className="w-4 h-4 text-slate-600" />
                    </span>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Generador de enlaces</h1>
                        <p className="text-xs text-slate-500">
                            Armá enlaces UTM para tus campañas — para saber de qué fuente viene cada visitante.
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 max-w-3xl">
                    <FormularioUTM
                        productos={productos}
                        paginas_fijas={paginas_fijas}
                        base_url={base_url}
                    />
                </div>
            </div>
        </>
    )
}

GeneradorEnlaces.layout = (page: ReactNode) => <AdminLayout titulo="Generador de enlaces">{page}</AdminLayout>

export default GeneradorEnlaces
