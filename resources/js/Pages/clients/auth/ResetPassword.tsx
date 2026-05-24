import { FormEventHandler, useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Eye, EyeOff } from 'lucide-react'
import PublicLayout from '@/Layouts/PublicLayout'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'

export default function ResetPassword() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    })

    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)

    const submit: FormEventHandler = (e) => {
        e.preventDefault()
        post(route('cuenta.reset-password.post'))
    }

    return (
        <PublicLayout>
            <Head title="Nueva contraseña" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Crea una nueva contraseña</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Elige una contraseña segura de al menos 8 caracteres.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="password">Nueva contraseña</Label>
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
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-200 hover:text-slate-600"
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
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-200 hover:text-slate-600"
                            tabIndex={-1}
                        >
                            {mostrarConfirmacion ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    {errors.password_confirmation && (
                        <p className="text-xs text-red-500">{errors.password_confirmation}</p>
                    )}
                </div>

                <Button type="submit" className="h-9 w-full" disabled={processing}>
                    {processing ? 'Guardando...' : 'Guardar contraseña'}
                </Button>
            </form>
        </PublicLayout>
    )
}
