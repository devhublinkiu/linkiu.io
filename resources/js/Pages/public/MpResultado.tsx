import { type ReactNode } from 'react'
import { Head, Link, usePage } from '@inertiajs/react'
import { StatusScreen } from '@mercadopago/sdk-react'
import WebLayout from '@/Layouts/WebLayout'

function MpResultado() {
    const { payment_id } = usePage<{ payment_id: string | null } & Record<string, unknown>>().props

    return (
        <>
            <Head title="Estado del pago" />

            <section className="bg-slate-50 min-h-[70vh] py-16">
                <div className="max-w-xl mx-auto px-4">
                    {payment_id ? (
                        <StatusScreen
                            initialization={{ paymentId: payment_id }}
                            customization={{ backUrls: { error: '/checkout', return: '/' } }}
                        />
                    ) : (
                        <div className="text-center">
                            <p className="text-slate-500 text-sm mb-4">No se encontró información del pago.</p>
                            <Link href="/" className="text-sm underline text-slate-700">Volver al inicio</Link>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

MpResultado.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>

export default MpResultado
