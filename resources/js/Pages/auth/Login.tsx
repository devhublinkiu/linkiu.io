import { FormEventHandler, useState } from 'react'
import { Head, Link, useForm, usePage } from '@inertiajs/react'
import { Eye, EyeOff } from 'lucide-react'
import PublicLayout from '@/Layouts/PublicLayout'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Checkbox } from '@/Components/ui/Checkbox'

interface Props {
    errors: { email?: string; password?: string }
}

export default function Login({ errors }: Props) {
    const { props } = usePage<{ flash?: { status?: string } }>()
    const status = props.flash?.status
    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
        recordar: false,
    })

    const [mostrarPassword, setMostrarPassword] = useState(false)

    const submit: FormEventHandler = (e) => {
        e.preventDefault()
        post(route('admin.login'))
    }

    return (
        <PublicLayout>
            <Head title="Iniciar sesión" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Bienvenido</h1>
                <p className="mt-1 text-sm text-slate-500">Ingresa a tu panel de administración</p>
            </div>

            {status === 'password-updated' && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Contraseña actualizada correctamente. Ya puedes iniciar sesión.
                </div>
            )}

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
                        aria-invalid={!!errors.email}
                        className="h-9"
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={mostrarPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="current-password"
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

                <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2">
                        <Checkbox
                            checked={data.recordar}
                            onCheckedChange={(v) => setData('recordar', !!v)}
                        />
                        <span className="text-sm text-slate-600">Recordar sesión</span>
                    </label>
                    <Link
                        href={route('admin.forgot-password')}
                        className="text-sm text-slate-600 underline-offset-4 transition-colors duration-200 hover:text-slate-900 hover:underline"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                <Button type="submit" className="h-9 w-full" disabled={processing}>
                    {processing ? 'Ingresando...' : 'Iniciar sesión'}
                </Button>
            </form>
        </PublicLayout>
    )
}
