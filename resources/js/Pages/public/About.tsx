import { type ReactNode, useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { ArrowRightIcon, PlusIcon, MinusIcon } from 'lucide-react'
import { getIcono } from '@/lib/iconos'
import { cn } from '@/lib/utils'
import WebLayout from '@/Layouts/WebLayout'
import PlaceholderImage from '@/Components/public/PlaceholderImage'

interface ValorItem   { icono: string; titulo: string; descripcion: string }
interface StatItem    { valor: string; etiqueta: string }
interface Colores     { primario: string; secundario: string; acento: string }

interface QuienesIdentidad {
    titulo:            string | null
    color_titulo:      string | null
    descripcion:       string | null
    color_descripcion: string | null
}
interface FaqItem             { pregunta: string; respuesta: string }
interface FaqData             { titulo: string | null; items: FaqItem[] }
interface QuienesHistoria     { historia_titulo: string | null; historia: string | null; imagen_url: string | null }
interface QuienesStats        { items: StatItem[] }
interface QuienesMisionVision {
    mision:             string | null
    vision:             string | null
    color_fondo_mision: string | null
    color_fondo_vision: string | null
}
interface QuienesValores {
    color_fondo_card: string | null
    color_texto_card: string | null
    color_fondo_icon: string | null
    color_icon:       string | null
    items:            ValorItem[]
}
interface QuienesCta {
    titulo:      string | null
    descripcion: string | null
    btn_texto:   string | null
    btn_link:    string | null
}

function resolverColor(token: string, colores: Colores): string {
    if (token === 'blanco')     return '#FFFFFF'
    if (token === 'negro')      return '#000000'
    if (token === 'primario')   return colores.primario
    if (token === 'secundario') return colores.secundario
    if (token === 'acento')     return colores.acento
    return token
}

// Defaults genéricos aplicables a cualquier vertical. El admin los reemplaza
// desde LinkiuBuild → Quiénes Somos con la identidad real de su marca.
const DEFAULT_TITULO    = 'Sobre nosotros'
const DEFAULT_HERO_DESC = 'Personaliza esta sección desde el panel de administración. Cuéntale a tus clientes quién eres y qué te mueve.'
const DEFAULT_HIST_TITULO  = 'Nuestra historia'
const DEFAULT_HISTORIA     = 'Aquí va el relato de cómo empezó tu negocio: lo que te motivó a emprender, los desafíos que enfrentaste y por qué hoy haces lo que haces.\n\nEste texto se edita desde el panel de administración en LinkiuBuild → Quiénes Somos → Historia. Aprovecha el espacio para conectar emocionalmente con tus clientes y mostrarles que detrás de la marca hay personas reales.'
const DEFAULT_MISION       = 'Describe aquí el propósito de tu negocio: qué problema resuelves, a quién sirves y cómo lo haces diferente.'
const DEFAULT_VISION       = 'Describe aquí adónde quieres llegar como marca: el impacto que aspiras a tener en los próximos años.'

const DEFAULT_STATS: StatItem[] = [
    { valor: '★★★★★', etiqueta: 'calidad garantizada' },
    { valor: '100%',  etiqueta: 'compromiso al cliente' },
    { valor: '24/7',  etiqueta: 'soporte disponible'   },
    { valor: '∞',     etiqueta: 'historias por contar' },
]

const DEFAULT_VALORES: ValorItem[] = [
    { icono: 'shield-check', titulo: 'Calidad',     descripcion: 'Cada producto pasa por controles rigurosos antes de llegar a tus manos.' },
    { icono: 'heart',        titulo: 'Cercanía',    descripcion: 'Detrás de cada pedido hay un equipo dispuesto a escucharte y ayudarte.' },
    { icono: 'sparkles',     titulo: 'Innovación',  descripcion: 'Mejoramos continuamente para ofrecerte siempre la mejor experiencia.' },
    { icono: 'handshake',    titulo: 'Confianza',   descripcion: 'Construimos relaciones a largo plazo basadas en transparencia y honestidad.' },
]

function About() {
    const { build } = usePage<{ build?: {
        colores?:               Colores
        quienes_hero?:          QuienesIdentidad    | null
        quienes_historia?:      QuienesHistoria     | null
        quienes_stats?:         QuienesStats        | null
        quienes_mision_vision?: QuienesMisionVision | null
        quienes_valores?:       QuienesValores      | null
        quienes_cta?:           QuienesCta          | null
        quienes_secciones?:     Record<string, boolean> | null
        faq_quienes?:           FaqData             | null
    }}>().props

    const colores = build?.colores ?? { primario: '#314158', secundario: '#62748E', acento: '#FB2C36' }

    function visible(key: string): boolean {
        return build?.quienes_secciones?.[key] !== false
    }

    // Identidad (hero)
    const titulo        = build?.quienes_hero?.titulo             || DEFAULT_TITULO
    const colorTitulo   = build?.quienes_hero?.color_titulo       || 'primario'
    const heroDesc      = build?.quienes_hero?.descripcion        || DEFAULT_HERO_DESC
    const colorHeroDesc = build?.quienes_hero?.color_descripcion  || 'negro'

    // Historia
    const histTitulo   = build?.quienes_historia?.historia_titulo || DEFAULT_HIST_TITULO
    const histTexto    = build?.quienes_historia?.historia        || DEFAULT_HISTORIA
    const histImagenUrl = build?.quienes_historia?.imagen_url     ?? null

    // Stats
    const stats = build?.quienes_stats?.items?.length === 4 ? build.quienes_stats.items : DEFAULT_STATS

    // Misión y visión
    const mision           = build?.quienes_mision_vision?.mision || DEFAULT_MISION
    const vision           = build?.quienes_mision_vision?.vision || DEFAULT_VISION
    const colorFondoMision = build?.quienes_mision_vision?.color_fondo_mision || 'blanco'
    const colorFondoVision = build?.quienes_mision_vision?.color_fondo_vision || 'negro'
    const bgMision         = resolverColor(colorFondoMision, colores)
    const bgVision         = resolverColor(colorFondoVision, colores)
    const misionDark       = colorFondoMision !== 'blanco'
    const visionDark       = colorFondoVision !== 'blanco'

    // Valores
    const colorFondoCard = build?.quienes_valores?.color_fondo_card || 'blanco'
    const colorTextoCard = build?.quienes_valores?.color_texto_card || 'primario'
    const colorFondoIcon = build?.quienes_valores?.color_fondo_icon || 'acento'
    const colorIcon      = build?.quienes_valores?.color_icon       || 'blanco'
    const valores        = build?.quienes_valores?.items?.length ? build.quienes_valores.items : DEFAULT_VALORES

    // CTA
    const faqData    = build?.faq_quienes ?? null

    const ctaTitulo  = build?.quienes_cta?.titulo      || 'Explora nuestro catálogo'
    const ctaDesc    = build?.quienes_cta?.descripcion || 'Descubre lo que tenemos para ofrecerte.'
    const ctaBtnText = build?.quienes_cta?.btn_texto   || 'Ver productos'
    const ctaBtnLink = build?.quienes_cta?.btn_link    || '/productos'

    const [faqAbierto, setFaqAbierto] = useState<number | null>(null)

    return (
        <>
            {/* ── Hero ── */}
            {visible('identidad') && (
                <section className="bg-white border-b border-slate-100 py-16 lg:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="max-w-2xl">
                            <h1
                                className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-5"
                                style={{ color: resolverColor(colorTitulo, colores) }}
                            >
                                {titulo}
                            </h1>
                            <p className="text-xl leading-relaxed" style={{ color: resolverColor(colorHeroDesc, colores) }}>
                                {heroDesc}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Historia ── */}
            {visible('historia') && (
                <section className="bg-slate-50 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <div className="rounded-2xl min-h-72 lg:min-h-96 overflow-hidden">
                                {histImagenUrl ? (
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 size-full flex items-center justify-center border border-slate-100">
                                        <img
                                            src={histImagenUrl}
                                            alt={titulo}
                                            className="size-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <PlaceholderImage label="Imagen de tu historia" iconSize="lg" className="size-full" />
                                )}
                            </div>
                            <div className="flex flex-col gap-6">
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                                    {histTitulo}
                                </h2>
                                {histTexto.split('\n\n').map((parrafo, i) => (
                                    <p key={i} className="text-slate-600 leading-relaxed">
                                        {parrafo}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Stats ── */}
            {visible('stats') && (
                <section className="bg-slate-900 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map(({ valor, etiqueta }) => (
                                <div key={etiqueta} className="text-center">
                                    <p className="text-3xl font-black text-white">{valor}</p>
                                    <p className="text-sm text-slate-400 mt-1">{etiqueta}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Misión y visión ── */}
            {visible('mision_vision') && (
                <section className="bg-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                className="border border-slate-200 rounded-2xl p-8 flex flex-col gap-4"
                                style={{ backgroundColor: bgMision }}
                            >
                                <span
                                    className="text-xs font-bold uppercase tracking-widest"
                                    style={{ color: misionDark ? 'rgba(255,255,255,0.6)' : colores.primario }}
                                >
                                    Misión
                                </span>
                                <p className={misionDark ? 'text-white/80 leading-relaxed' : 'text-slate-700 leading-relaxed'}>
                                    {mision}
                                </p>
                            </div>
                            <div
                                className="border border-slate-200 rounded-2xl p-8 flex flex-col gap-4"
                                style={{ backgroundColor: bgVision }}
                            >
                                <span
                                    className="text-xs font-bold uppercase tracking-widest"
                                    style={{ color: visionDark ? 'rgba(255,255,255,0.6)' : colores.primario }}
                                >
                                    Visión
                                </span>
                                <p className={visionDark ? 'text-white/80 leading-relaxed' : 'text-slate-700 leading-relaxed'}>
                                    {vision}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Valores ── */}
            {visible('valores') && (
                <section className="bg-slate-50 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Lo que nos define</h2>
                            <p className="text-slate-500 mt-2">Los principios que guían cada decisión que tomamos.</p>
                        </div>
                        {/* TODO LinkiuBuild: el título y descripción de Valores aún no son editables
                            desde el admin. Cuando se agregue, leer de build?.quienes_valores. */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {valores.map(({ icono, titulo, descripcion }) => {
                                const Icono = getIcono(icono)
                                const bgCard   = resolverColor(colorFondoCard, colores)
                                const bgIcon   = resolverColor(colorFondoIcon, colores)
                                const clrIcon  = resolverColor(colorIcon, colores)
                                const clrText  = resolverColor(colorTextoCard, colores)
                                return (
                                    <div
                                        key={titulo}
                                        className="border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 hover:border-slate-300 transition-colors duration-200 ease-in-out"
                                        style={{ backgroundColor: bgCard }}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: bgIcon }}
                                        >
                                            <Icono className="w-5 h-5" style={{ color: clrIcon }} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold mb-1" style={{ color: clrText }}>{titulo}</p>
                                            <p className="text-xs leading-relaxed" style={{ color: clrText, opacity: 0.7 }}>{descripcion}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ── FAQ ── */}
            {visible('faq') && faqData && faqData.items.length > 0 && (
                <section className="bg-slate-50 py-16 border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {faqData.titulo || 'Preguntas frecuentes'}
                            </h2>
                        </div>
                        <div className="flex flex-col gap-2 max-w-3xl">
                            {faqData.items.map(({ pregunta, respuesta }, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'rounded-xl border transition-colors duration-200 overflow-hidden',
                                        faqAbierto === i ? 'border-slate-300 bg-white' : 'border-slate-200 bg-white hover:border-slate-300'
                                    )}
                                >
                                    <button
                                        onClick={() => setFaqAbierto(faqAbierto === i ? null : i)}
                                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                                    >
                                        <span className="text-sm font-semibold text-slate-700">{pregunta}</span>
                                        <div className={cn(
                                            'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200',
                                            faqAbierto === i ? 'bg-slate-900' : 'bg-slate-200'
                                        )}>
                                            {faqAbierto === i
                                                ? <MinusIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                                                : <PlusIcon  className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.5} />
                                            }
                                        </div>
                                    </button>
                                    {faqAbierto === i && (
                                        <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                                            {respuesta}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── CTA ── */}
            {visible('cta') && (
                <section className="bg-white py-16 border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{ctaTitulo}</h2>
                            <p className="text-slate-500 mt-1">{ctaDesc}</p>
                        </div>
                        {ctaBtnText && (
                            <Link
                                href={ctaBtnLink}
                                style={{ backgroundColor: colores.primario }}
                                className="inline-flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-xl transition-opacity duration-200 ease-in-out hover:opacity-90 text-sm shrink-0"
                            >
                                {ctaBtnText}
                                <ArrowRightIcon className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                </section>
            )}
        </>
    )
}

About.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>

export default About
