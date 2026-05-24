import { FormEventHandler, useEffect } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react'
import PublicLayout from '@/Layouts/PublicLayout'
import { Button } from '@/Components/ui/Button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/Components/ui/InputOTP'

interface Props {
    metodo: 'correo' | 'whatsapp'
    email: string
    errors: { codigo?: string }
}

export default function VerifyOTP({ metodo, email, errors }: Props) {
    const { data, setData, post, processing } = useForm({
        codigo: '',
    })

    // Auto-submit cuando el estado ya tiene los 6 dígitos completos
    useEffect(() => {
        if (data.codigo.length === 6 && !processing) {
            post(route('cuenta.verify-otp'))
        }
    }, [data.codigo])

    const submit: FormEventHandler = (e) => {
        e.preventDefault()
        if (data.codigo.length === 6) {
            post(route('cuenta.verify-otp'))
        }
    }

    const destino = metodo === 'whatsapp' ? 'tu número de WhatsApp' : email
    const Icono   = metodo === 'whatsapp' ? MessageCircle : Mail

    return (
        <PublicLayout>
            <Head title="Verificar código" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Verifica tu identidad</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Ingresa el código de 6 dígitos que enviamos a{' '}
                    <span className="font-medium text-slate-700">{destino}</span>.
                </p>
            </div>

            <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <Icono className="size-4 shrink-0 text-slate-500" />
                <p className="text-sm text-slate-600">
                    {metodo === 'whatsapp' ? 'Enviado por WhatsApp' : 'Enviado por correo electrónico'}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="flex justify-center">
                    <InputOTP
                        maxLength={6}
                        value={data.codigo}
                        onChange={(v) => setData('codigo', v)}
                    >
                        <InputOTPGroup>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <InputOTPSlot key={i} index={i} className="size-11 text-base" />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                {errors.codigo && (
                    <p className="text-center text-xs text-red-500">{errors.codigo}</p>
                )}

                <Button
                    type="submit"
                    className="h-9 w-full"
                    disabled={processing || data.codigo.length < 6}
                >
                    {processing ? 'Verificando...' : 'Verificar código'}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <Link
                    href={route('cuenta.choose-otp-method')}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 underline-offset-4 transition-colors duration-200 hover:text-slate-900 hover:underline"
                >
                    <ArrowLeft className="size-3.5" />
                    Elegir otro método
                </Link>
            </div>
        </PublicLayout>
    )
}
