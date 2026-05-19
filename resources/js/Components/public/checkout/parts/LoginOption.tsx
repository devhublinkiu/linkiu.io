import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Link } from '@inertiajs/react'
import { UserIcon, ChevronDownIcon } from 'lucide-react'

export default function LoginOption() {
    const [abierto,   setAbierto]   = useState(false)
    const [email,     setEmail]     = useState('')
    const [password,  setPassword]  = useState('')
    const [error,     setError]     = useState('')
    const [cargando,  setCargando]  = useState(false)

    function iniciarSesion(e: React.FormEvent) {
        e.preventDefault()
        if (!email || !password) return
        setCargando(true)
        setError('')
        router.post(
            route('cuenta.login.post'),
            { email, password, redirect: '/checkout' },
            {
                preserveScroll: true,
                onError: (errors) => {
                    setError(errors.email ?? errors.password ?? 'Credenciales incorrectas')
                    setCargando(false)
                },
            },
        )
    }

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
            <button
                type="button"
                onClick={() => setAbierto(p => !p)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
                <div className="flex items-center gap-2.5">
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">¿Ya tienes cuenta? Inicia sesión para pre-llenar tus datos</span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`} />
            </button>

            {abierto && (
                <form onSubmit={iniciarSesion} className="px-5 pb-5 border-t border-slate-200 pt-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">Correo electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors duration-200"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors duration-200"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-red-500">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full bg-slate-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-slate-800 transition-colors duration-200 disabled:opacity-60"
                    >
                        {cargando ? 'Iniciando sesión…' : 'Iniciar sesión'}
                    </button>
                    <p className="text-center text-xs text-slate-400">
                        ¿No tienes cuenta?{' '}
                        <Link href={route('cuenta.login')} className="text-slate-600 underline underline-offset-2 hover:text-slate-900">
                            Regístrate
                        </Link>
                    </p>
                </form>
            )}
        </div>
    )
}
