import { Link, usePage } from '@inertiajs/react'
import { ArrowRightIcon } from 'lucide-react'

interface StatItem { valor: string; etiqueta: string }

interface CtaConfig {
    color_fondo:          string
    color_acento:         string
    color_texto:          string
    titulo_linea1:        string | null
    titulo_acento:        string | null
    descripcion:          string | null
    descripcion_acento:   string | null
    btn_primario_texto:   string | null
    btn_primario_link:    string | null
    btn_secundario_texto: string | null
    btn_secundario_link:  string | null
    stats:                StatItem[]
}

interface Colores { primario: string; secundario: string; acento: string }

// Stats placeholder genéricas. El admin las reemplaza desde
// LinkiuBuild → Inicio → CTA con cifras reales del negocio.
const DEFAULT_STATS: StatItem[] = [
    { valor: '24/7',  etiqueta: 'soporte disponible'      },
    { valor: '100%',  etiqueta: 'pago seguro'             },
    { valor: '★★★★★', etiqueta: 'calidad garantizada'     },
]

function resolverColor(token: string, colores: Colores): string {
    if (token === 'primario')   return colores.primario
    if (token === 'secundario') return colores.secundario
    if (token === 'acento')     return colores.acento
    if (token === 'blanco')     return '#FFFFFF'
    if (token === 'negro')      return '#000000'
    return token
}

export default function CtaFinal() {
    const { build } = usePage<{ build?: { cta?: CtaConfig; colores?: Colores } }>().props

    const cfg     = build?.cta
    const colores = build?.colores ?? { primario: '#314158', secundario: '#62748E', acento: '#FB2C36' }

    const fondo  = resolverColor(cfg?.color_fondo  ?? 'negro',  colores)
    const acento = resolverColor(cfg?.color_acento ?? 'acento', colores)
    const texto  = resolverColor(cfg?.color_texto  ?? 'blanco', colores)

    const tituloLinea1       = cfg?.titulo_linea1        || 'Lo que necesitas'
    const tituloAcento       = cfg?.titulo_acento        || 'está a un clic de distancia.'
    const descripcion        = cfg?.descripcion          || 'Explora nuestro catálogo y descubre por qué nuestros clientes confían en nosotros.'
    const descripcionAcento  = cfg?.descripcion_acento   || ''
    const btnPrimarioTexto   = cfg?.btn_primario_texto   || 'Ver productos'
    const btnPrimarioLink    = cfg?.btn_primario_link    || '/productos'
    const btnSecundarioTexto = cfg?.btn_secundario_texto || 'Nuestra historia'
    const btnSecundarioLink  = cfg?.btn_secundario_link  || '/quienes-somos'
    const stats              = cfg?.stats?.length === 3 ? cfg.stats : DEFAULT_STATS

    return (
        <section style={{ backgroundColor: fondo, color: texto }} className="py-24">
            <div className="max-w-4xl mx-auto px-6 text-center">

                <h2 className="text-4xl font-bold tracking-tight leading-tight mb-5">
                    {tituloLinea1}<br />
                    <span style={{ color: acento }}>{tituloAcento}</span>
                </h2>

                <p className="text-xl max-w-xl mx-auto mb-10 opacity-60">
                    {descripcion}
                    {descripcionAcento && (
                        <span className="block mt-2 font-medium opacity-100" style={{ color: acento }}>
                            {descripcionAcento}
                        </span>
                    )}
                </p>

                <div className="flex items-center justify-center gap-4 flex-wrap">
                    {btnPrimarioTexto && (
                        <Link
                            href={btnPrimarioLink}
                            style={{ backgroundColor: texto, color: fondo }}
                            className="inline-flex items-center gap-2 text-base font-semibold px-8 py-4 rounded-lg transition-opacity duration-200 ease-in-out hover:opacity-90 shadow-lg"
                        >
                            {btnPrimarioTexto}
                            <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    )}
                    {btnSecundarioTexto && (
                        <Link
                            href={btnSecundarioLink}
                            style={{ borderColor: texto, color: texto }}
                            className="inline-flex items-center border bg-transparent text-base font-medium px-6 py-4 rounded-lg transition-opacity duration-200 ease-in-out opacity-80 hover:opacity-100"
                        >
                            {btnSecundarioTexto}
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-6 mt-16 pt-10 border-t" style={{ borderColor: texto + '1A' }}>
                    {stats.map(({ valor, etiqueta }) => (
                        <div key={etiqueta} className="flex flex-col items-center gap-1">
                            <span className="text-3xl font-bold">{valor}</span>
                            <span className="text-sm opacity-50">{etiqueta}</span>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
