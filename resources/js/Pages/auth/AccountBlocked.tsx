import { Head, Link, usePage } from '@inertiajs/react'
import { LockKeyhole } from 'lucide-react'
import PublicLayout from '@/Layouts/PublicLayout'
import { Button } from '@/Components/ui/Button'

export default function AccountBlocked() {
    const { props } = usePage<{ flash?: { bloqueado_hasta?: string } }>()
    const bloqueadoHasta = props.flash?.bloqueado_hasta

    return (
        <PublicLayout>
            <Head title="Cuenta bloqueada" />

            <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-red-200 bg-red-50">
                    <LockKeyhole className="size-6 text-red-500" />
                </div>

                <h1 className="text-xl font-bold text-slate-900">Cuenta bloqueada temporalmente</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Tu cuenta fue bloqueada por múltiples intentos fallidos de inicio de sesión.
                </p>

                {bloqueadoHasta && (
                    <div className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        Podrás intentar de nuevo a partir del{' '}
                        <span className="font-semibold">{bloqueadoHasta}</span>.
                    </div>
                )}

                <div className="mt-6 w-full space-y-3">
                    <Button asChild className="h-9 w-full" variant="outline">
                        <a href="https://wa.me/573104594344" target="_blank" rel="noopener noreferrer">
                            Contactar soporte
                        </a>
                    </Button>

                    <Link
                        href={route('admin.login')}
                        className="flex h-9 w-full items-center justify-center rounded-lg text-sm text-slate-500 underline-offset-4 transition-colors duration-200 hover:text-slate-900 hover:underline"
                    >
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </PublicLayout>
    )
}
