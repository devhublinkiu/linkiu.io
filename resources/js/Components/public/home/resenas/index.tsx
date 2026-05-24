import { usePage } from '@inertiajs/react'
import { StarIcon } from 'lucide-react'

interface ResenaItem {
    nombre:     string
    ciudad:     string
    estrellas:  number
    comentario: string
}

interface ResenasConfig {
    titulo?:      string | null
    descripcion?: string | null
    items?:       ResenaItem[]
}

interface HeroConfig {
    resenas_rating?:   number
    resenas_cantidad?: number
}

// Reseñas placeholder con avatares neutros y comentarios genéricos. El admin
// reemplaza desde LinkiuBuild → Inicio → Reseñas con testimonios reales.
const FALLBACK: ResenaItem[] = [
    { nombre: 'Ana M.',     ciudad: '',  estrellas: 5, comentario: 'Excelente experiencia de compra. El proceso fue rápido, el producto llegó en perfecto estado y el equipo de atención respondió todas mis dudas.' },
    { nombre: 'Carlos R.',  ciudad: '',  estrellas: 5, comentario: 'Muy buena calidad y atención. Recomendado al 100%. Volvería a comprar sin dudarlo.' },
    { nombre: 'Sofía L.',   ciudad: '',  estrellas: 5, comentario: 'El envío llegó antes de lo esperado y el empaque fue impecable. Muy satisfecha con mi pedido.' },
    { nombre: 'Diego P.',   ciudad: '',  estrellas: 4, comentario: 'Buen producto, buen precio. El proceso de compra fue claro y sin complicaciones. Ya estoy planeando mi próxima compra.' },
    { nombre: 'Laura S.',   ciudad: '',  estrellas: 5, comentario: 'Servicio impecable de principio a fin. Cuando tuve una consulta, la respondieron en minutos. Una atención al cliente de verdad.' },
    { nombre: 'Andrés C.',  ciudad: '',  estrellas: 5, comentario: 'Calidad superior a lo que esperaba. Vale cada peso. Definitivamente repito y recomiendo.' },
]

function avatarUrl(nombre: string): string {
    return `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(nombre)}`
}

function Estrellas({ valor }: { valor: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                    key={i}
                    className={`w-3.5 h-3.5 ${i <= valor ? 'text-amber-500' : 'text-slate-200'}`}
                    fill="currentColor"
                />
            ))}
        </div>
    )
}

function Card({ r }: { r: ResenaItem }) {
    return (
        <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-lg p-6 h-full">
            <Estrellas valor={r.estrellas} />
            <p className="text-base text-slate-700 leading-relaxed flex-1">"{r.comentario}"</p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <img
                    src={avatarUrl(r.nombre)}
                    alt={r.nombre}
                    className="w-9 h-9 rounded-full shrink-0 bg-slate-100"
                />
                <div>
                    <p className="text-sm font-semibold text-slate-900">{r.nombre}</p>
                    {r.ciudad && <p className="text-xs text-slate-500">{r.ciudad}</p>}
                </div>
            </div>
        </div>
    )
}

export default function Resenas() {
    const { build } = usePage<{
        build?: { resenas?: ResenasConfig; hero?: HeroConfig }
    }>().props

    const cfg     = build?.resenas
    const hero    = build?.hero
    const titulo  = cfg?.titulo      || 'Lo que dicen nuestros clientes'
    const desc    = cfg?.descripcion || 'Opiniones reales de quienes ya compraron con nosotros.'
    const items   = cfg?.items?.length ? cfg.items : FALLBACK
    const rating  = hero?.resenas_rating   ?? 4.8
    const cantidad = hero?.resenas_cantidad ?? 0

    return (
        <section className="bg-slate-50 py-16">
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(i => (
                                <StarIcon key={i} className="w-5 h-5 text-amber-500" fill="currentColor" />
                            ))}
                        </div>
                        <span className="text-base font-semibold text-slate-900">{rating.toFixed(1)}</span>
                        {cantidad > 0 && (
                            <span className="text-base text-slate-500">· {cantidad.toLocaleString()} reseñas verificadas</span>
                        )}
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{titulo}</h2>
                    <p className="mt-3 text-lg text-slate-500 max-w-xl mx-auto">{desc}</p>
                </div>

                {/* Mobile: scroll snap */}
                <div className="flex md:hidden gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-none">
                    {items.map((r, i) => (
                        <div key={i} className="snap-center shrink-0 w-[82vw]">
                            <Card r={r} />
                        </div>
                    ))}
                </div>

                {/* Desktop: grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((r, i) => (
                        <Card key={i} r={r} />
                    ))}
                </div>

            </div>
        </section>
    )
}
