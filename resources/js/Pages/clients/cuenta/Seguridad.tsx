import { type ReactNode, useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import ClientLayout from '@/Layouts/ClientLayout'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Button } from '@/Components/ui/Button'

function Seguridad() {
    const [actual,    setActual]    = useState('')
    const [nueva,     setNueva]     = useState('')
    const [confirmar, setConfirmar] = useState('')
    const [guardando, setGuardando] = useState(false)

    const [verActual,    setVerActual]    = useState(false)
    const [verNueva,     setVerNueva]     = useState(false)
    const [verConfirmar, setVerConfirmar] = useState(false)

    const [errores, setErrores] = useState<Record<string, string>>({})

    function guardar() {
        setErrores({})
        if (!actual || !nueva || !confirmar) {
            toast.error('Completa todos los campos')
            return
        }
        if (nueva !== confirmar) {
            setErrores({ password_nueva_confirmation: 'Las contraseñas no coinciden.' })
            return
        }
        setGuardando(true)
        router.post(route('cuenta.seguridad.update'), {
            password_actual:              actual,
            password_nueva:               nueva,
            password_nueva_confirmation:  confirmar,
        }, {
            preserveState: true,
            onSuccess: () => {
                toast.success('Contraseña actualizada')
                setActual('')
                setNueva('')
                setConfirmar('')
            },
            onError: (e) => setErrores(e),
            onFinish: () => setGuardando(false),
        })
    }

    return (
        <>
            <Head title="Seguridad" />

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-w-md">
                <div className="px-5 py-4 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-900">Cambiar contraseña</span>
                </div>
                <div className="px-5 py-6 space-y-4">
                    <div className="space-y-1.5">
                        <Label>Contraseña actual</Label>
                        <div className="relative">
                            <Input
                                type={verActual ? 'text' : 'password'}
                                value={actual}
                                onChange={e => setActual(e.target.value)}
                                className="pr-9"
                            />
                            <button type="button" tabIndex={-1} onClick={() => setVerActual(!verActual)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200">
                                {verActual ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        {errores.password_actual && <p className="text-xs text-red-500">{errores.password_actual}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Nueva contraseña</Label>
                        <div className="relative">
                            <Input
                                type={verNueva ? 'text' : 'password'}
                                value={nueva}
                                onChange={e => setNueva(e.target.value)}
                                className="pr-9"
                            />
                            <button type="button" tabIndex={-1} onClick={() => setVerNueva(!verNueva)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200">
                                {verNueva ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-400">Mínimo 8 caracteres.</p>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Confirmar nueva contraseña</Label>
                        <div className="relative">
                            <Input
                                type={verConfirmar ? 'text' : 'password'}
                                value={confirmar}
                                onChange={e => setConfirmar(e.target.value)}
                                className="pr-9"
                            />
                            <button type="button" tabIndex={-1} onClick={() => setVerConfirmar(!verConfirmar)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200">
                                {verConfirmar ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        {errores.password_nueva_confirmation && (
                            <p className="text-xs text-red-500">{errores.password_nueva_confirmation}</p>
                        )}
                    </div>

                    <Button onClick={guardar} disabled={guardando} className="w-full">
                        {guardando ? 'Guardando…' : 'Cambiar contraseña'}
                    </Button>
                </div>
            </div>
        </>
    )
}

Seguridad.layout = (page: ReactNode) => (
    <ClientLayout tab="seguridad">{page}</ClientLayout>
)

export default Seguridad
