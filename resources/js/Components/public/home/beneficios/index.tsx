import { usePage } from '@inertiajs/react'
import { getIcono } from '@/lib/iconos'

interface BeneficioItem { icono: string; titulo: string; descripcion: string }

interface BeneficiosConfig {
    titulo:           string | null
    descripcion:      string | null
    color_fondo_card: string
    color_texto_card: string
    color_fondo_icon: string
    color_icon:       string
    items:            BeneficioItem[]
}

interface Colores { primario: string; secundario: string; acento: string }

// Beneficios genéricos aplicables a cualquier vertical. El admin los reemplaza
// desde LinkiuBuild → Inicio → Beneficios cuando defina los reales de su marca.
const FALLBACK: BeneficioItem[] = [
    { icono: 'sparkles',     titulo: 'Calidad garantizada',     descripcion: 'Productos seleccionados y verificados para asegurar tu satisfacción en cada compra.' },
    { icono: 'truck',        titulo: 'Envío rápido',            descripcion: 'Despachamos en tiempo récord para que tu pedido llegue cuando lo necesitas.' },
    { icono: 'shield-check', titulo: 'Compra segura',           descripcion: 'Tus datos protegidos y pagos cifrados. Compra con total tranquilidad.' },
    { icono: 'headphones',   titulo: 'Atención personalizada',  descripcion: 'Nuestro equipo está disponible para resolver cualquier duda o reclamo.' },
]

function resolverColor(token: string, colores: Colores): string {
    if (token === 'primario')   return colores.primario
    if (token === 'secundario') return colores.secundario
    if (token === 'acento')     return colores.acento
    if (token === 'blanco')     return '#FFFFFF'
    if (token === 'negro')      return '#000000'
    return token
}

export default function Beneficios() {
    const { build } = usePage<{
        build?: { beneficios?: BeneficiosConfig; colores?: Colores }
    }>().props

    const cfg     = build?.beneficios
    const colores = build?.colores ?? { primario: '#314158', secundario: '#62748E', acento: '#FB2C36' }
    const items   = cfg?.items?.length ? cfg.items : FALLBACK
    const titulo  = cfg?.titulo      || 'Por qué elegirnos'
    const desc    = cfg?.descripcion || 'Lo que nos hace diferentes y por qué nuestros clientes confían en nosotros.'

    const cardBg    = resolverColor(cfg?.color_fondo_card ?? 'blanco',    colores)
    const cardText  = resolverColor(cfg?.color_texto_card ?? 'primario',  colores)
    const iconBg    = resolverColor(cfg?.color_fondo_icon ?? 'acento',    colores)
    const iconColor = resolverColor(cfg?.color_icon       ?? 'blanco',    colores)

    return (
        <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-6">

                <div className="mb-12">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{titulo}</h2>
                    <p className="mt-4 text-xl text-slate-500 max-w-2xl">{desc}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, i) => {
                        const Icono = getIcono(item.icono)
                        return (
                            <div
                                key={i}
                                className="flex flex-col gap-4 border border-slate-200 rounded-lg p-8 hover:shadow-md transition-all duration-200 ease-in-out"
                                style={{ backgroundColor: cardBg, color: cardText }}
                            >
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: iconBg }}
                                >
                                    <Icono className="w-6 h-6" style={{ color: iconColor }} />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold mb-1">{item.titulo}</h3>
                                    <p className="text-sm leading-relaxed opacity-70">{item.descripcion}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

            </div>
        </section>
    )
}
