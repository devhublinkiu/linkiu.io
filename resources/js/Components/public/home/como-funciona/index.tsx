import { usePage } from '@inertiajs/react'

interface PasoItem { titulo: string; descripcion: string; badge: string | null }

interface ComoFuncionaConfig {
    titulo:       string | null
    descripcion:  string | null
    color_acento: string
    items:        PasoItem[]
}

interface Colores { primario: string; secundario: string; acento: string }

// Pasos genéricos del flujo de compra. El admin los reemplaza desde
// LinkiuBuild → Inicio → Cómo funciona si quiere mensajes propios.
const FALLBACK: PasoItem[] = [
    { titulo: 'Explora el catálogo', descripcion: 'Encuentra el producto ideal navegando por nuestras categorías y ofertas.',           badge: 'Catálogo actualizado' },
    { titulo: 'Realiza tu pedido',   descripcion: 'Agrega los productos al carrito y completa el pago de forma rápida y segura.',       badge: 'Pago 100% seguro'     },
    { titulo: 'Recibe tu compra',    descripcion: 'Te notificamos en cada etapa del envío. Tu pedido llega directo a tu puerta.',       badge: 'Envío garantizado'    },
]

function resolverColor(token: string, colores: Colores): string {
    if (token === 'primario')   return colores.primario
    if (token === 'secundario') return colores.secundario
    if (token === 'acento')     return colores.acento
    if (token === 'blanco')     return '#FFFFFF'
    if (token === 'negro')      return '#000000'
    return token
}

function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function ComoFunciona() {
    const { build } = usePage<{
        build?: { como_funciona?: ComoFuncionaConfig; colores?: Colores }
    }>().props

    const cfg     = build?.como_funciona
    const colores = build?.colores ?? { primario: '#314158', secundario: '#62748E', acento: '#FB2C36' }
    const items   = cfg?.items?.length ? cfg.items : FALLBACK
    const titulo  = cfg?.titulo      || 'Comprar nunca fue tan fácil'
    const desc    = cfg?.descripcion || 'De tu elección a tu puerta en pocos pasos.'
    const acento  = resolverColor(cfg?.color_acento ?? 'acento', colores)

    const lgCols: Record<number, string> = {
        1: 'lg:grid-cols-1',
        2: 'lg:grid-cols-2',
        3: 'lg:grid-cols-3',
        4: 'lg:grid-cols-4',
        5: 'lg:grid-cols-5',
    }
    const colsClass = lgCols[items.length] ?? 'lg:grid-cols-3'
    const maxW = items.length === 1 ? 'lg:max-w-sm lg:mx-auto'
               : items.length === 2 ? 'lg:max-w-2xl lg:mx-auto'
               : ''

    return (
        <section className="bg-gray-50 py-16" id="como-funciona">
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-14">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{titulo}</h2>
                    <p className="mt-4 text-xl text-slate-500 max-w-xl mx-auto">{desc}</p>
                </div>

                <div className={`grid grid-cols-1 ${colsClass} ${maxW} gap-8 relative`}>

                    {/* Línea conectora desktop — solo con 3 pasos */}
                    {items.length === 3 && (
                        <div className="hidden lg:block absolute top-10 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px bg-slate-200" />
                    )}

                    {items.map((paso, i) => (
                        <div key={i} className="relative flex flex-col items-center text-center gap-5">

                            <div
                                className="relative z-10 w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md border-2"
                                style={{ borderColor: acento }}
                            >
                                <span className="text-3xl font-bold select-none" style={{ color: hexToRgba(acento, 0.3) }}>
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <h3 className="text-xl font-semibold text-slate-900">{paso.titulo}</h3>
                                <p className="text-base text-slate-500 leading-relaxed max-w-xs mx-auto">{paso.descripcion}</p>
                                {paso.badge && (
                                    <span
                                        className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1 mx-auto mt-1 border"
                                        style={{
                                            color:           acento,
                                            backgroundColor: hexToRgba(acento, 0.08),
                                            borderColor:     hexToRgba(acento, 0.2),
                                        }}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: acento }} />
                                        {paso.badge}
                                    </span>
                                )}
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
