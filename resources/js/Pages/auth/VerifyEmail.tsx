import { FormEventHandler } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { MailCheck } from 'lucide-react'
import PublicLayout from '@/Layouts/PublicLayout'
import { Button } from '@/Components/ui/Button'

interface Props {
    status?: string
}

export default function VerifyEmail({ status }: Props) {
    const { post, processing } = useForm({})

    const submit: FormEventHandler = (e) => {
        e.preventDefault()
        post(route('admin.verify-email.resend'))
    }

    return (
        <PublicLayout>
            <Head title="Verificar correo" />

            <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                    <MailCheck className="size-6 text-slate-600" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">Revisa tu correo</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Enviamos un enlace de verificación a tu dirección de correo.
                    Haz clic en el enlace para activar tu cuenta.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Se envió un nuevo enlace de verificación a tu correo.
                </div>
            )}

            <form onSubmit={submit} className="space-y-3">
                <Button type="submit" className="h-9 w-full" disabled={processing} variant="outline">
                    {processing ? 'Enviando...' : 'Reenviar enlace de verificación'}
                </Button>

                <Link
                    href={route('admin.logout')}
                    method="post"
                    as="button"
                    className="flex h-9 w-full items-center justify-center rounded-lg text-sm text-slate-500 underline-offset-4 transition-colors duration-200 hover:text-slate-900 hover:underline"
                >
                    Cerrar sesión
                </Link>
            </form>
        </PublicLayout>
    )
}
