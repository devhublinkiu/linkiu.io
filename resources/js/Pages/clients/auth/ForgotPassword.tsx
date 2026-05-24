import { FormEventHandler } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'
import PublicLayout from '@/Layouts/PublicLayout'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    })

    const submit: FormEventHandler = (e) => {
        e.preventDefault()
        post(route('cuenta.forgot-password.post'))
    }

    return (
        <PublicLayout>
            <Head title="Recuperar contraseña" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Recuperar contraseña</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Ingresa tu correo y te enviaremos un código de verificación.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="email"
                        autoFocus
                        placeholder="tu@correo.com"
                        aria-invalid={!!errors.email}
                        className="h-9"
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email}</p>
                    )}
                </div>

                <Button type="submit" className="h-9 w-full" disabled={processing}>
                    {processing ? 'Enviando...' : 'Continuar'}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <Link
                    href={route('cuenta.login')}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 underline-offset-4 transition-colors duration-200 hover:text-slate-900 hover:underline"
                >
                    <ArrowLeft className="size-3.5" />
                    Volver al inicio de sesión
                </Link>
            </div>
        </PublicLayout>
    )
}
