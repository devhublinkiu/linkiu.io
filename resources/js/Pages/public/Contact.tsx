import { type ReactNode, useState } from 'react'
import { usePage, useForm } from '@inertiajs/react'
import { toast } from 'sonner'
import { SendIcon } from 'lucide-react'
import { getIcono } from '@/lib/iconos'
import { trackFb } from '@/lib/usePixel'
import WebLayout from '@/Layouts/WebLayout'
import Faq, { type FaqConfig } from '@/Components/public/home/faq'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Colores { primario: string; secundario: string; acento: string }

interface ContactoHero {
    titulo:            string | null
    color_titulo:      string | null
    descripcion:       string | null
    color_descripcion: string | null
}

interface CardContactoItem {
    color_fondo:      string
    color_texto:      string
    color_fondo_icon: string
    color_icon:       string
    icono:            string
    tagline:          string | null
    titulo:           string | null
    subtitulo:        string | null
    link:             string | null
}

interface CampoFormItem {
    key:       string
    activo:    boolean
    requerido: boolean
    orden:     number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolverColor(token: string, colores: Colores): string {
    if (token === 'blanco')     return '#FFFFFF'
    if (token === 'negro')      return '#000000'
    if (token === 'primario')   return colores.primario
    if (token === 'secundario') return colores.secundario
    if (token === 'acento')     return colores.acento
    return token
}

const CAMPO_LABELS: Record<string, string> = {
    nombre:  'Nombre',
    correo:  'Correo electrónico',
    asunto:  'Asunto',
    mensaje: 'Mensaje',
    celular: 'Celular',
    empresa: 'Empresa',
}

const CAMPO_PLACEHOLDERS: Record<string, string> = {
    nombre:  'Tu nombre',
    correo:  'tu@correo.com',
    asunto:  'Asunto del mensaje',
    mensaje: 'Cuéntanos en qué podemos ayudarte…',
    celular: '+57 300 000 0000',
    empresa: 'Nombre de tu empresa',
}

// ─── Formulario ───────────────────────────────────────────────────────────────

function ContactForm({ campos }: { campos: CampoFormItem[] }) {
    const [enviado, setEnviado] = useState(false)

    const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors duration-200 bg-white'

    const { data, setData, post, processing, errors, reset } = useForm<Record<string, string>>({
        _hp: '',
        ...Object.fromEntries(campos.map(c => [c.key, ''])),
    })

    function submit(e: React.FormEvent) {
        e.preventDefault()
        post(route('contacto.enviar'), {
            preserveScroll: true,
            onSuccess: () => {
                setEnviado(true)
                // Lead enriquecido con datos del form para mejor matching.
                trackFb('Lead', {}, {
                    email:      data.correo  || undefined,
                    phone:      data.celular || undefined,
                    first_name: data.nombre  || undefined,
                })
                reset()
            },
            onError: () => toast.error('Error al enviar el mensaje'),
        })
    }

    if (enviado) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center">
                    <SendIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">¡Mensaje enviado!</h2>
                <p className="text-slate-500 max-w-sm text-sm">
                    Recibimos tu mensaje y te responderemos pronto.
                </p>
                <button
                    type="button"
                    onClick={() => setEnviado(false)}
                    className="mt-1 text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-900 transition-colors duration-200 ease-in-out"
                >
                    Enviar otro mensaje
                </button>
            </div>
        )
    }

    const camposActivos = [...campos]
        .filter(c => c.activo)
        .sort((a, b) => a.orden - b.orden)

    return (
        <form onSubmit={submit} className="flex flex-col gap-5">
            {/* Honeypot antispam */}
            <input type="text" name="_hp" value={data._hp} onChange={e => setData('_hp', e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />

            <div>
                <h2 className="text-base font-bold text-slate-900">¿Prefieres escribirnos?</h2>
                <p className="text-xs text-slate-500 mt-0.5">Completa el formulario y te respondemos a tu correo.</p>
            </div>

            {camposActivos.map(campo => {
                const label       = CAMPO_LABELS[campo.key]       ?? campo.key
                const placeholder = CAMPO_PLACEHOLDERS[campo.key] ?? ''
                const isTextarea  = campo.key === 'mensaje'
                const type        = campo.key === 'correo' ? 'email' : campo.key === 'celular' ? 'tel' : 'text'

                return (
                    <div key={campo.key} className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">
                            {label}
                            {campo.requerido && <span className="text-red-500 ml-0.5">*</span>}
                        </label>
                        {isTextarea ? (
                            <textarea
                                value={data[campo.key] ?? ''}
                                onChange={e => setData(campo.key, e.target.value)}
                                placeholder={placeholder}
                                rows={4}
                                required={campo.requerido}
                                className={inputCls + ' resize-none'}
                            />
                        ) : (
                            <input
                                type={type}
                                value={data[campo.key] ?? ''}
                                onChange={e => setData(campo.key, e.target.value)}
                                placeholder={placeholder}
                                required={campo.requerido}
                                className={inputCls}
                            />
                        )}
                        {errors[campo.key] && (
                            <p className="text-xs text-red-500">{errors[campo.key]}</p>
                        )}
                    </div>
                )
            })}

            <button
                type="submit"
                disabled={processing}
                className="w-full sm:w-auto sm:self-start bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl transition-colors duration-200 ease-in-out text-sm flex items-center justify-center gap-2"
            >
                <SendIcon className="w-4 h-4" />
                {processing ? 'Enviando…' : 'Enviar mensaje'}
            </button>
        </form>
    )
}

// ─── Página ───────────────────────────────────────────────────────────────────

function Contact() {
    const { build } = usePage<{ build?: {
        colores?:              Colores
        contacto_hero?:        ContactoHero         | null
        contacto_cards?:       { items: CardContactoItem[] } | null
        contacto_form?:        { correo_destino: string | null; campos: CampoFormItem[] } | null
        contacto_secciones?:   Record<string, boolean> | null
        faq_contacto?:         FaqConfig            | null
    }}>().props

    const colores = build?.colores ?? { primario: '#314158', secundario: '#62748E', acento: '#FB2C36' }

    function visible(key: string): boolean {
        return build?.contacto_secciones?.[key] !== false
    }

    const titulo        = build?.contacto_hero?.titulo            || '¿En qué podemos ayudarte?'
    const colorTitulo   = build?.contacto_hero?.color_titulo      || 'negro'
    const descripcion   = build?.contacto_hero?.descripcion       || 'Elige el canal que prefieras. Estamos disponibles para responder tus preguntas.'
    const colorDesc     = build?.contacto_hero?.color_descripcion || 'negro'

    const cards   = build?.contacto_cards?.items ?? []
    const faqData = build?.faq_contacto          ?? null

    // Cards placeholder cuando el admin aún no configura sus canales de contacto.
    // Representan los 3 canales más comunes (teléfono, email, ubicación) con
    // estilo "muted" para indicar que están sin configurar. El admin las
    // reemplaza desde LinkiuBuild → Contacto → Cards.
    const CARDS_PLACEHOLDER: CardContactoItem[] = [
        { color_fondo: 'blanco', color_texto: 'primario', color_fondo_icon: 'blanco', color_icon: 'primario',
          icono: 'phone',   tagline: 'Tu teléfono',  titulo: 'Configura tu número', subtitulo: 'Visible para tus clientes', link: null },
        { color_fondo: 'blanco', color_texto: 'primario', color_fondo_icon: 'blanco', color_icon: 'primario',
          icono: 'mail',    tagline: 'Tu correo',    titulo: 'Configura tu email',  subtitulo: 'Para recibir mensajes',     link: null },
        { color_fondo: 'blanco', color_texto: 'primario', color_fondo_icon: 'blanco', color_icon: 'primario',
          icono: 'map-pin', tagline: 'Tu ubicación', titulo: 'Configura tu dirección', subtitulo: 'Si tienes tienda física',  link: null },
    ]
    const cardsMostradas = cards.length > 0 ? cards : CARDS_PLACEHOLDER
    const usarPlaceholder = cards.length === 0

    const camposDefault: CampoFormItem[] = [
        { key: 'nombre', activo: true, requerido: true, orden: 1 },
        { key: 'correo', activo: true, requerido: true, orden: 2 },
        { key: 'asunto', activo: true, requerido: false, orden: 3 },
        { key: 'mensaje', activo: true, requerido: true, orden: 4 },
    ]
    const campos = build?.contacto_form?.campos?.length ? build.contacto_form.campos : camposDefault

    return (
        <>
            {/* ── Hero ── */}
            {visible('hero') && (
                <section className="bg-white border-b border-slate-100 py-14">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <h1
                            className="text-4xl font-bold tracking-tight mb-3"
                            style={{ color: resolverColor(colorTitulo, colores) }}
                        >
                            {titulo}
                        </h1>
                        <p
                            className="text-lg leading-relaxed max-w-xl mx-auto"
                            style={{ color: resolverColor(colorDesc, colores) }}
                        >
                            {descripcion}
                        </p>
                    </div>
                </section>
            )}

            <div className="bg-slate-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col gap-10">

                    {/* ── Cards ── */}
                    {visible('cards') && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {cardsMostradas.map((card, i) => {
                                const bgCard   = resolverColor(card.color_fondo,      colores)
                                const txtCard  = resolverColor(card.color_texto,      colores)
                                const bgIcon   = resolverColor(card.color_fondo_icon, colores)
                                const txtIcon  = resolverColor(card.color_icon,       colores)
                                const Icono    = getIcono(card.icono)

                                const inner = (
                                    <div
                                        className={`flex flex-col gap-3 p-5 rounded-2xl h-full ${usarPlaceholder ? 'border-2 border-dashed border-slate-200' : ''}`}
                                        style={{ backgroundColor: usarPlaceholder ? '#FFFFFF' : bgCard }}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${usarPlaceholder ? 'border border-dashed border-slate-200 bg-slate-50' : ''}`}
                                            style={{ backgroundColor: usarPlaceholder ? undefined : bgIcon }}
                                        >
                                            <Icono className="w-5 h-5" style={{ color: usarPlaceholder ? '#94A3B8' : txtIcon }} />
                                        </div>
                                        <div>
                                            {card.tagline && (
                                                <p
                                                    className="text-xs font-semibold uppercase tracking-wider opacity-60"
                                                    style={{ color: usarPlaceholder ? '#64748B' : txtCard }}
                                                >
                                                    {card.tagline}
                                                </p>
                                            )}
                                            {card.titulo && (
                                                <p
                                                    className="text-sm font-bold mt-0.5"
                                                    style={{ color: usarPlaceholder ? '#94A3B8' : txtCard }}
                                                >
                                                    {card.titulo}
                                                </p>
                                            )}
                                            {card.subtitulo && (
                                                <p
                                                    className="text-xs mt-1 opacity-70"
                                                    style={{ color: usarPlaceholder ? '#64748B' : txtCard }}
                                                >
                                                    {card.subtitulo}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )

                                return card.link ? (
                                    <a
                                        key={i}
                                        href={card.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="transition-opacity duration-200 hover:opacity-90"
                                    >
                                        {inner}
                                    </a>
                                ) : (
                                    <div key={i}>{inner}</div>
                                )
                            })}
                        </div>
                    )}

                    {/* ── Formulario ── */}
                    {visible('formulario') && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
                            <ContactForm campos={campos} />
                        </div>
                    )}

                    {/* ── FAQ ── */}
                    {/* Si faqData es null o items vacío, el componente Faq cae a su FALLBACK
                        de 3 preguntas genéricas. Así el cliente nuevo ve un FAQ "vivo" en lugar
                        de un hueco hasta que configure el suyo desde LinkiuBuild → Contacto → FAQ. */}
                    {visible('faq') && (
                        <Faq config={faqData} />
                    )}

                </div>
            </div>
        </>
    )
}

Contact.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>

export default Contact
