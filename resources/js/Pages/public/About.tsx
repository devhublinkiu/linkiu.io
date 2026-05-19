import { type ReactNode } from 'react'
import { Link } from '@inertiajs/react'
import { LeafIcon, ShieldCheckIcon, HeartIcon, MapPinIcon, ArrowRightIcon } from 'lucide-react'
import WebLayout from '@/Layouts/WebLayout'

// ─── Tipos (props que vendrán del admin) ──────────────────────────────────────

interface Valor {
    icono: 'leaf' | 'shield' | 'heart' | 'map'
    titulo: string
    descripcion: string
}

interface Stat {
    valor: string
    etiqueta: string
}

interface Props {
    marca?: {
        nombre: string
        tagline: string
        historia_titulo: string
        historia: string
        mision: string
        vision: string
        imagen_historia: string
    }
    valores?: Valor[]
    stats?: Stat[]
}

// ─── Defaults (mock hasta que el admin los configure) ─────────────────────────

const DEFAULTS: Required<Props> = {
    marca: {
        nombre: 'SAVIA',
        tagline: 'Cuidado capilar con propósito',
        historia_titulo: 'Una marca nacida desde la necesidad real',
        historia: 'SAVIA nació en Colombia con una convicción clara: las mujeres merecen productos que cuiden su cabello sin poner en riesgo su salud. Durante años, el mercado ofrecía tintes cargados de amoníaco y peróxido agresivo — fórmulas que daban resultado a costa del daño. Nosotras decidimos buscar un camino diferente.\n\nDesarrollamos una fórmula libre de químicos agresivos, formulada con ingredientes botánicos de origen local, pensada para cubrir canas con resultados reales y duraderos. Hoy, más de 1.200 clientas en todo el país ya son parte de esta comunidad.',
        mision: 'Ofrecer productos de cuidado capilar de alta calidad, libres de químicos agresivos, que transformen el cabello sin comprometer la salud de quienes los usan.',
        vision: 'Ser la marca de referencia en cuidado capilar natural en Colombia y Latinoamérica, reconocida por la confianza de sus clientas y la integridad de sus fórmulas.',
        imagen_historia: '/assets/products/savia-verde.png',
    },
    valores: [
        { icono: 'leaf',   titulo: 'Natural',    descripcion: 'Fórmulas libres de amoníaco, parabenos y químicos agresivos. Lo que ponemos en tu cabello importa.' },
        { icono: 'shield', titulo: 'Honesto',     descripcion: 'Sin promesas vacías. Resultados reales, verificados por nuestras clientas, sin retoque de fotos.' },
        { icono: 'heart',  titulo: 'Cercano',     descripcion: 'Cada pedido es una persona real. Respondemos, acompañamos y nos aseguramos de que quedes feliz.' },
        { icono: 'map',    titulo: 'Colombiano',  descripcion: 'Formulado y producido en Colombia. Con orgullo local y compromiso con el ecosistema productivo del país.' },
    ],
    stats: [
        { valor: '2021',    etiqueta: 'Año de fundación' },
        { valor: '1.200+',  etiqueta: 'Clientas satisfechas' },
        { valor: '4.7★',    etiqueta: 'Calificación promedio' },
        { valor: '32',      etiqueta: 'Ciudades con envío' },
    ],
}

// ─── Iconos ───────────────────────────────────────────────────────────────────

const ICONOS = {
    leaf:   LeafIcon,
    shield: ShieldCheckIcon,
    heart:  HeartIcon,
    map:    MapPinIcon,
}

// ─── Página ───────────────────────────────────────────────────────────────────

function About({ marca, valores, stats }: Props) {
    const m  = marca   ?? DEFAULTS.marca
    const v  = valores ?? DEFAULTS.valores
    const s  = stats   ?? DEFAULTS.stats

    return (
        <>
            {/* ── Hero ── */}
            <section className="bg-white border-b border-slate-100 py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            Quiénes somos
                        </span>
                        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-5">
                            {m.nombre} —<br />
                            <span className="text-emerald-600">{m.tagline}</span>
                        </h1>
                        <p className="text-xl text-slate-500 leading-relaxed">
                            Una marca colombiana creada para quienes se niegan a elegir entre verse bien y cuidar su cabello.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Historia ── */}
            <section className="bg-slate-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Imagen */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center min-h-72 lg:min-h-96 border border-slate-100">
                            <img
                                src={m.imagen_historia}
                                alt={m.nombre}
                                className="h-56 lg:h-72 w-auto object-contain drop-shadow-xl animate-bottle-float"
                            />
                        </div>
                        {/* Texto */}
                        <div className="flex flex-col gap-6">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                                {m.historia_titulo}
                            </h2>
                            {m.historia.split('\n\n').map((parrafo, i) => (
                                <p key={i} className="text-slate-600 leading-relaxed">
                                    {parrafo}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="bg-slate-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {s.map(({ valor, etiqueta }) => (
                            <div key={etiqueta} className="text-center">
                                <p className="text-3xl font-black text-white">{valor}</p>
                                <p className="text-sm text-slate-400 mt-1">{etiqueta}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Misión y visión ── */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-slate-200 rounded-2xl p-8 flex flex-col gap-4">
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Misión</span>
                            <p className="text-slate-700 leading-relaxed">{m.mision}</p>
                        </div>
                        <div className="border border-slate-200 rounded-2xl p-8 flex flex-col gap-4 bg-slate-900">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visión</span>
                            <p className="text-slate-300 leading-relaxed">{m.vision}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Valores ── */}
            <section className="bg-slate-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Lo que nos define</h2>
                        <p className="text-slate-500 mt-2">Los principios que guían cada decisión que tomamos.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {v.map(({ icono, titulo, descripcion }) => {
                            const Icono = ICONOS[icono]
                            return (
                                <div key={titulo} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 hover:border-emerald-200 hover:shadow-sm transition-all duration-200">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                        <Icono className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 mb-1">{titulo}</p>
                                        <p className="text-xs text-slate-500 leading-relaxed">{descripcion}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="bg-white py-16 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">¿Lista para probar {m.nombre}?</h2>
                        <p className="text-slate-500 mt-1">Descubre la línea completa de productos.</p>
                    </div>
                    <Link
                        href="/productos"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm shrink-0"
                    >
                        Ver productos
                        <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </>
    )
}

About.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>

export default About
