import { Link, usePage } from '@inertiajs/react'
import { ArrowRightIcon, StarIcon } from 'lucide-react'

interface HeroConfig {
    titulo?:               string | null
    titulo_acento?:        string | null
    descripcion?:          string | null
    btn_primario_texto?:   string | null
    btn_primario_link?:    string | null
    btn_secundario_texto?: string | null
    btn_secundario_link?:  string | null
    resenas_activo?:       boolean
    resenas_rating?:       number
    resenas_cantidad?:     number
    color_acento_titulo?:  string
    color_btn_bg?:         string
    color_btn_text?:       string
}

interface ResenaItem { nombre: string }
interface ResenasConfig { items?: ResenaItem[] }
interface Colores { primario: string; secundario: string; acento: string }

// Avatares placeholder — los nombres solo siembran el generador DiceBear (no son reales).
// Mantén nombres neutros y diversos para que sirvan a cualquier vertical de tienda.
const FALLBACK_NOMBRES = ['Ana M.', 'Carlos R.', 'Sofía L.', 'Diego P.']

function avatarUrl(nombre: string): string {
    return `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(nombre)}`
}

function resolverColor(token: string, colores: Colores): string {
    if (token === 'primario')   return colores.primario
    if (token === 'secundario') return colores.secundario
    if (token === 'acento')     return colores.acento
    if (token === 'blanco')     return '#FFFFFF'
    return '#000000'
}

function Estrellas({ valor }: { valor: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                    key={i}
                    className={`w-3.5 h-3.5 ${i <= Math.floor(valor) ? 'text-amber-500' : 'text-slate-200'}`}
                    fill="currentColor"
                />
            ))}
        </div>
    )
}

export default function HeroText() {
    const { build } = usePage<{
        build?: { hero?: HeroConfig; resenas?: ResenasConfig; colores?: Colores }
    }>().props

    const hero    = build?.hero
    const colores = build?.colores ?? { primario: '#314158', secundario: '#62748E', acento: '#FB2C36' }

    const nombres = (build?.resenas?.items?.length ? build.resenas.items : FALLBACK_NOMBRES.map(n => ({ nombre: n })))
        .slice(0, 4)
        .map(r => r.nombre)

    const titulo        = hero?.titulo               || null
    const tituloAcento  = hero?.titulo_acento        || null
    const descripcion   = hero?.descripcion          || null
    const btn1Texto     = hero?.btn_primario_texto   || null
    const btn1Link      = hero?.btn_primario_link    || '#'
    const btn2Texto     = hero?.btn_secundario_texto || null
    const btn2Link      = hero?.btn_secundario_link  || '#'
    const resenasActivo = hero?.resenas_activo       ?? true
    const rating        = hero?.resenas_rating       ?? 4.7
    const cantidad      = hero?.resenas_cantidad     ?? 312

    const acentoColor = resolverColor(hero?.color_acento_titulo ?? 'acento',   colores)
    const btnBg       = resolverColor(hero?.color_btn_bg        ?? 'primario', colores)
    const btnText     = resolverColor(hero?.color_btn_text      ?? 'blanco',   colores)

    return (
        <div className="flex flex-col items-center text-center">

            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl font-bold leading-[1.04] tracking-tight mb-5">
                {titulo ? (
                    <>
                        {titulo}
                        {tituloAcento && (
                            <>
                                {' '}
                                <span style={{ color: acentoColor }}>{tituloAcento}</span>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        Tu tienda online,<br />
                        hecha para{' '}
                        <span style={{ color: acentoColor }}>destacar</span>.
                    </>
                )}
            </h1>

            {/* Subheadline */}
            {descripcion ? (
                <p className="text-lg leading-relaxed max-w-xl mb-8 opacity-80">
                    {descripcion}
                </p>
            ) : (
                <p className="text-lg leading-relaxed max-w-xl mb-8 opacity-80">
                    Personaliza este texto desde el panel de administración. Cuéntale a tus clientes qué te hace diferente y por qué deberían elegirte.
                </p>
            )}

            {/* CTAs */}
            <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
                <Link
                    href={btn1Texto ? btn1Link : '/productos'}
                    style={{ backgroundColor: btnBg, color: btnText }}
                    className="inline-flex items-center gap-2 text-base font-semibold px-7 py-4 rounded-xl transition-opacity duration-200 ease-in-out hover:opacity-90"
                >
                    {btn1Texto || 'Ver productos'}
                    <ArrowRightIcon className="w-4 h-4" />
                </Link>
                {(btn2Texto || !btn1Texto) && (
                    <Link
                        href={btn2Texto ? btn2Link : '/quienes-somos'}
                        style={{ borderColor: btnBg, color: btnBg }}
                        className="inline-flex items-center border bg-white text-base font-medium px-5 py-4 rounded-xl transition-opacity duration-200 ease-in-out hover:opacity-70"
                    >
                        {btn2Texto || 'Nuestra historia'}
                    </Link>
                )}
            </div>

            {/* Social proof */}
            {resenasActivo && (
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    <div className="flex">
                        {nombres.map((nombre, i) => (
                            <img
                                key={i}
                                src={avatarUrl(nombre)}
                                alt={nombre}
                                className={`w-9 h-9 rounded-full border-2 border-white shadow-sm bg-slate-100 ${i !== 0 ? '-ml-2.5' : ''}`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Estrellas valor={rating} />
                        <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
                        <span className="text-sm opacity-60">· {cantidad.toLocaleString()} reseñas verificadas</span>
                    </div>
                </div>
            )}

        </div>
    )
}
