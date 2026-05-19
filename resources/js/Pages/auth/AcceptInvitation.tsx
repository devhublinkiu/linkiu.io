import { FormEventHandler, useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Eye, EyeOff, MailX } from 'lucide-react'
import PublicLayout from '@/Layouts/PublicLayout'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'

interface Props {
    tokenValido: boolean
    token?: string
    email?: string
    errors: { password?: string; password_confirmation?: string; token?: string }
}

export default function AcceptInvitation({ tokenValido, token, email, errors }: Props) {
    const { data, setData, post, processing } = useForm({
        password: '',
        password_confirmation: '',
    })

    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)

    const submit: FormEventHandler = (e) => {
        e.preventDefault()
        post(route('admin.invitation.post', { token }))
    }

    if (!tokenValido) {
        return (
            <PublicLayout>
                <Head title="Invitación inválida" />

                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-red-200 bg-red-50">
                        <MailX className="size-6 text-red-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">Enlace inválido o expirado</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Este enlace de invitación ya no es válido. Puede haber expirado o ya fue utilizado.
                        Contacta al administrador para recibir una nueva invitación.
                    </p>
                    <a
                        href="https://wa.me/573104594344"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 text-sm text-slate-600 underline-offset-4 transition-colors duration-200 hover:text-slate-900 hover:underline"
                    >
                        Contactar soporte
                    </a>
                </div>
            </PublicLayout>
        )
    }

    return (
        <PublicLayout>
            <Head title="Activar cuenta" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Activa tu cuenta</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Fuiste invitado con el correo{' '}
                    <span className="font-medium text-slate-700">{email}</span>.
                    Crea una contraseña para comenzar.
                </p>
            </div>

            {errors.token && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errors.token}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={mostrarPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                            autoFocus
                            aria-invalid={!!errors.password}
                            className="h-9 pr-9"
                        />
                        <button
                            type="button"
                            onClick={() => setMostrarPassword(!mostrarPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 hover:text-slate-600"
                            tabIndex={-1}
                        >
                            {mostrarPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-500">{errors.password}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                    <div className="relative">
                        <Input
                            id="password_confirmation"
                            type={mostrarConfirmacion ? 'text' : 'password'}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                            aria-invalid={!!errors.password_confirmation}
                            className="h-9 pr-9"
                        />
                        <button
                            type="button"
                            onClick={() => setMostrarConfirmacion(!mostrarConfirmacion)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 hover:text-slate-600"
                            tabIndex={-1}
                        >
                            {mostrarConfirmacion ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    {errors.password_confirmation && (
                        <p className="text-xs text-red-500">{errors.password_confirmation}</p>
                    )}
                </div>

                <p className="text-xs text-slate-400">Mínimo 8 caracteres.</p>

                <Button type="submit" className="h-9 w-full" disabled={processing}>
                    {processing ? 'Activando...' : 'Activar cuenta'}
                </Button>
            </form>
        </PublicLayout>
    )
}
