import { type ReactNode, useEffect } from 'react'
import { Head, Link, usePage } from '@inertiajs/react'
import { CheckCircle2Icon, PackageIcon } from 'lucide-react'
import WebLayout from '@/Layouts/WebLayout'
import { trackFb } from '@/lib/usePixel'

interface Props {
    codigo: string
    nombre: string
    email: string
    total: number
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function OrdenConfirmacion() {
    const { codigo, nombre, email, total } = usePage<Props>().props

    useEffect(() => {
        trackFb('Purchase', {
            value:    total,
            currency: 'COP',
            order_id: codigo,
        })
    }, [])

    return (
        <>
            <Head title={`Pedido ${codigo} confirmado`} />

            <section className="bg-slate-50 min-h-[80vh] flex items-center justify-center py-16 px-4">
                <div className="max-w-lg w-full">

                    {/* Icono */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2Icon className="w-8 h-8 text-emerald-500" />
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                        <h1 className="text-xl font-bold text-slate-900 mb-2">
                            ¡Pedido recibido, {nombre}!
                        </h1>
                        <p className="text-slate-500 text-sm mb-6">
                            Te enviamos la confirmación a <strong className="text-slate-700">{email}</strong> y<br/>
                            también recibirás un mensaje por WhatsApp.
                        </p>

                        <div className="bg-slate-50 rounded-xl p-4 mb-6 flex items-center justify-between">
                            <div className="text-left">
                                <p className="text-xs text-slate-400">Código de pedido</p>
                                <p className="text-lg font-mono font-bold text-slate-900">{codigo}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Total</p>
                                <p className="text-lg font-bold text-slate-900">{formatPrecio(total)}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link
                                href={route('orden.seguimiento', codigo)}
                                className="w-full bg-slate-900 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors duration-200 text-sm flex items-center justify-center gap-2"
                            >
                                <PackageIcon className="w-4 h-4" />
                                Seguir mi pedido
                            </Link>
                            <Link
                                href="/"
                                className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium py-3 rounded-xl transition-colors duration-200 text-sm"
                            >
                                Volver al inicio
                            </Link>
                        </div>
                    </div>

                </div>
            </section>
        </>
    )
}

OrdenConfirmacion.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>

export default OrdenConfirmacion
