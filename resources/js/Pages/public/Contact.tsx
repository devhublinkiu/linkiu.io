import { type ReactNode, useState } from 'react'
import { MailIcon, MapPinIcon, ClockIcon, MessageCircleIcon, SendIcon, AtSignIcon, PlusIcon, MinusIcon } from 'lucide-react'
import WebLayout from '@/Layouts/WebLayout'
import { cn } from '@/lib/utils'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface InfoContacto {
    email: string
    whatsapp: string
    instagram?: string
    ciudad: string
    horario: string
    horario_fin?: string
}

interface Props {
    titulo?: string
    subtitulo?: string
    info?: InfoContacto
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS: Required<Props> = {
    titulo: '¿En qué podemos ayudarte?',
    subtitulo: 'Elige el canal que prefieras. Estamos disponibles para responder tus preguntas, ayudarte con tu pedido o resolver cualquier inquietud.',
    info: {
        email: 'hola@savia.co',
        whatsapp: '+57 300 000 0000',
        instagram: '@savia.co',
        ciudad: 'Bogotá, Colombia',
        horario: 'Lun – Vie · 8:00 am – 6:00 pm',
        horario_fin: 'Sábados · 9:00 am – 1:00 pm',
    },
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ = [
    {
        pregunta: '¿Cuánto demora el envío?',
        respuesta: 'Despachamos en 1 día hábil. El tiempo de entrega es de 3 a 5 días hábiles a cualquier ciudad de Colombia. Ciudades principales (Bogotá, Medellín, Cali) pueden recibir en 2 días hábiles.',
    },
    {
        pregunta: '¿Cómo hago seguimiento a mi pedido?',
        respuesta: 'Una vez despachado, te enviamos el número de guía al correo y WhatsApp registrados. Puedes rastrear tu pedido directamente en la página de la transportadora.',
    },
    {
        pregunta: '¿Puedo devolver o cambiar un producto?',
        respuesta: 'Sí. Tienes 15 días calendario desde la fecha de recepción para solicitar una devolución o cambio. El producto debe estar sin abrir y en su empaque original. Escríbenos y gestionamos todo.',
    },
    {
        pregunta: '¿Qué métodos de pago aceptan?',
        respuesta: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard), PSE, Nequi y contraentrega en ciudades seleccionadas. Todos los pagos están cifrados y son 100% seguros.',
    },
    {
        pregunta: '¿Hacen envíos a toda Colombia?',
        respuesta: 'Sí, hacemos envíos a todo el territorio nacional. El envío es gratis en pedidos iguales o mayores a $89.900.',
    },
    {
        pregunta: '¿Los productos tienen garantía?',
        respuesta: 'Todos nuestros productos tienen garantía de satisfacción. Si por cualquier razón no quedas satisfecha, contáctanos dentro de los 15 días siguientes a la compra y buscamos la mejor solución para ti.',
    },
]

// ─── Componentes ──────────────────────────────────────────────────────────────

function FaqItem({ pregunta, respuesta, abierto, onToggle }: {
    pregunta: string
    respuesta: string
    abierto: boolean
    onToggle: () => void
}) {
    return (
        <div className={cn(
            'rounded-xl border transition-colors duration-200 overflow-hidden',
            abierto ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-50 hover:bg-white'
        )}>
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
                <span className={cn(
                    'text-sm font-semibold transition-colors duration-200',
                    abierto ? 'text-slate-900' : 'text-slate-700'
                )}>
                    {pregunta}
                </span>
                <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200',
                    abierto ? 'bg-slate-900' : 'bg-slate-200'
                )}>
                    {abierto
                        ? <MinusIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                        : <PlusIcon className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.5} />
                    }
                </div>
            </button>
            {abierto && (
                <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                    {respuesta}
                </p>
            )}
        </div>
    )
}

// ─── Página ───────────────────────────────────────────────────────────────────

function Contact({ titulo, subtitulo, info }: Props) {
    const t  = titulo    ?? DEFAULTS.titulo
    const s  = subtitulo ?? DEFAULTS.subtitulo
    const ci = info      ?? DEFAULTS.info

    const [faqAbierto, setFaqAbierto] = useState<number | null>(null)
    const [enviado, setEnviado] = useState(false)

    const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors duration-200 bg-white'

    const CANALES = [
        {
            icono: MessageCircleIcon,
            label: 'WhatsApp',
            valor: ci.whatsapp,
            sub: 'Respuesta en menos de 2 horas',
            href: `https://wa.me/${ci.whatsapp.replace(/\D/g, '')}`,
            color: 'bg-emerald-500 hover:bg-emerald-600',
            iconoBg: 'bg-white/20',
            textColor: 'text-white',
            subColor: 'text-emerald-100',
            externo: true,
        },
        {
            icono: MailIcon,
            label: 'Correo',
            valor: ci.email,
            sub: 'Te respondemos en el día',
            href: `mailto:${ci.email}`,
            color: 'bg-white hover:bg-slate-50 border border-slate-200',
            iconoBg: 'bg-slate-100',
            textColor: 'text-slate-900',
            subColor: 'text-slate-400',
            externo: false,
        },
        ...(ci.instagram ? [{
            icono: AtSignIcon,
            label: 'Instagram',
            valor: ci.instagram,
            sub: 'Síguenos y escríbenos por DM',
            href: `https://instagram.com/${ci.instagram.replace('@', '')}`,
            color: 'bg-white hover:bg-slate-50 border border-slate-200',
            iconoBg: 'bg-slate-100',
            textColor: 'text-slate-900',
            subColor: 'text-slate-400',
            externo: true,
        }] : []),
    ]

    const ASUNTOS = [
        'Información sobre un producto',
        'Estado de mi pedido',
        'Devolución o cambio',
        'Problema con mi compra',
        'Trabajo con nosotros',
        'Otro',
    ]

    return (
        <>
            {/* ── Header ── */}
            <section className="bg-white border-b border-slate-100 py-14">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Contacto
                    </span>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">{t}</h1>
                    <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">{s}</p>
                </div>
            </section>

            <div className="bg-slate-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col gap-10">

                    {/* ── Canales ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {CANALES.map(canal => {
                            const Icono = canal.icono
                            return (
                                <a
                                    key={canal.label}
                                    href={canal.href}
                                    target={canal.externo ? '_blank' : undefined}
                                    rel={canal.externo ? 'noopener noreferrer' : undefined}
                                    className={cn(
                                        'flex flex-col gap-3 p-5 rounded-2xl transition-all duration-200 group',
                                        canal.color
                                    )}
                                >
                                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', canal.iconoBg)}>
                                        <Icono className={cn('w-5 h-5', canal.textColor)} />
                                    </div>
                                    <div>
                                        <p className={cn('text-[10px] font-semibold uppercase tracking-wider', canal.subColor)}>{canal.label}</p>
                                        <p className={cn('text-sm font-bold mt-0.5', canal.textColor)}>{canal.valor}</p>
                                        <p className={cn('text-xs mt-1', canal.subColor)}>{canal.sub}</p>
                                    </div>
                                </a>
                            )
                        })}
                    </div>

                    {/* Info secundaria */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5"><MapPinIcon className="w-3.5 h-3.5" />{ci.ciudad}</span>
                        <span className="flex items-center gap-1.5"><ClockIcon className="w-3.5 h-3.5" />{ci.horario}</span>
                        {ci.horario_fin && <span className="flex items-center gap-1.5"><ClockIcon className="w-3.5 h-3.5" />{ci.horario_fin}</span>}
                    </div>

                    {/* ── Formulario ── */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
                        {enviado ? (
                            <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
                                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-200">
                                    <SendIcon className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">¡Mensaje enviado!</h2>
                                <p className="text-slate-500 max-w-sm text-sm">
                                    Recibimos tu mensaje y te responderemos en las próximas 2 horas en días hábiles.
                                </p>
                                <button
                                    onClick={() => setEnviado(false)}
                                    className="mt-1 text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-900 transition-colors duration-200"
                                >
                                    Enviar otro mensaje
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={e => { e.preventDefault(); setEnviado(true) }} className="flex flex-col gap-5">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">¿Prefieres escribirnos?</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Completa el formulario y te respondemos a tu correo.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-slate-600">Nombre</label>
                                        <input type="text" placeholder="Tu nombre" className={inputCls} required />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-slate-600">Correo electrónico</label>
                                        <input type="email" placeholder="tu@correo.com" className={inputCls} required />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-slate-600">Asunto</label>
                                    <select className={inputCls} required>
                                        <option value="">Selecciona un asunto</option>
                                        {ASUNTOS.map(a => <option key={a}>{a}</option>)}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-slate-600">Mensaje</label>
                                    <textarea
                                        placeholder="Cuéntanos en qué podemos ayudarte..."
                                        rows={4}
                                        className={inputCls + ' resize-none'}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full sm:w-auto sm:self-start bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2"
                                >
                                    <SendIcon className="w-4 h-4" />
                                    Enviar mensaje
                                </button>
                            </form>
                        )}
                    </div>

                    {/* ── FAQ ── */}
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Preguntas frecuentes</h2>
                            <p className="text-slate-500 mt-1 text-sm">Puede que aquí encuentres la respuesta que buscas.</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            {FAQ.map(({ pregunta, respuesta }, i) => (
                                <FaqItem
                                    key={i}
                                    pregunta={pregunta}
                                    respuesta={respuesta}
                                    abierto={faqAbierto === i}
                                    onToggle={() => setFaqAbierto(faqAbierto === i ? null : i)}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

Contact.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>

export default Contact
