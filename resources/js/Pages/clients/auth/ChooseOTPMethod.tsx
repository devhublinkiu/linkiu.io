import { FormEventHandler } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react'
import PublicLayout from '@/Layouts/PublicLayout'
import { Button } from '@/Components/ui/Button'
import { cn } from '@/lib/utils'

interface Props {
    tieneWhatsapp: boolean
    errors: { metodo?: string }
}

export default function ChooseOTPMethod({ tieneWhatsapp, errors }: Props) {
    const { data, setData, post, processing } = useForm({
        metodo: 'correo' as 'correo' | 'whatsapp',
    })

    const submit: FormEventHandler = (e) => {
        e.preventDefault()
        post(route('cuenta.choose-otp-method.post'))
    }

    const opciones = [
        {
            valor: 'correo' as const,
            icono: Mail,
            titulo: 'Correo electrónico',
            descripcion: 'Te enviaremos el código a tu correo',
        },
        ...(tieneWhatsapp
            ? [{
                valor: 'whatsapp' as const,
                icono: MessageCircle,
                titulo: 'WhatsApp',
                descripcion: 'Te enviaremos el código por WhatsApp',
            }]
            : []),
    ]

    return (
        <PublicLayout>
            <Head title="Elige cómo recibir el código" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">¿Cómo quieres recibir el código?</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Te enviaremos un código de 6 dígitos para verificar tu identidad.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    {opciones.map(({ valor, icono: Icono, titulo, descripcion }) => (
                        <button
                            key={valor}
                            type="button"
                            onClick={() => setData('metodo', valor)}
                            className={cn(
                                'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors duration-200',
                                data.metodo === valor
                                    ? 'border-slate-600 bg-slate-50'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                            )}
                        >
                            <div className={cn(
                                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                                data.metodo === valor ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600',
                            )}>
                                <Icono className="size-4" />
                            </div>
                            <div>
                                <p className={cn(
                                    'text-sm font-medium',
                                    data.metodo === valor ? 'text-slate-900' : 'text-slate-700',
                                )}>
                                    {titulo}
                                </p>
                                <p className="text-xs text-slate-500">{descripcion}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {errors.metodo && (
                    <p className="text-xs text-red-500">{errors.metodo}</p>
                )}

                <Button type="submit" className="h-9 w-full" disabled={processing}>
                    {processing ? 'Enviando código...' : 'Enviar código'}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <Link
                    href={route('cuenta.forgot-password')}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 underline-offset-4 transition-colors duration-200 hover:text-slate-900 hover:underline"
                >
                    <ArrowLeft className="size-3.5" />
                    Cambiar correo
                </Link>
            </div>
        </PublicLayout>
    )
}
