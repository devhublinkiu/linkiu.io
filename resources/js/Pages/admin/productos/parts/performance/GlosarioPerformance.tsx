import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import {
    BookOpen, Clock, Flame as FlameAccent, Sparkles, Thermometer, TrendingUp, Trophy as TrophyAccent,
} from 'lucide-react'
import { ICONOS_SENAL } from './senales'
import type { SenalKey } from './types'

/**
 * Sheet lateral con la explicación completa de las 4 métricas de
 * performance. Lenguaje no técnico — pensado para que un admin sin
 * background estadístico entienda exactamente qué está leyendo.
 */
export function GlosarioPerformance() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                    <BookOpen className="size-4" />
                    Glosario
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-lg">Glosario de performance</SheetTitle>
                    <SheetDescription>
                        Cómo leer las columnas de Score, Temperatura, Tendencia y Señal.
                    </SheetDescription>
                </SheetHeader>

                <div className="px-4 pb-6 space-y-6">

                    {/* SCORE */}
                    <Section icon={Sparkles} iconColor="text-blue-500" titulo="Score" subtitulo="0 a 100">
                        <p>
                            Indica <strong>qué tan bien le va a este producto comparado con los demás</strong> de
                            tu catálogo. 100 es el top, 0 es el último.
                        </p>
                        <Detalle titulo="¿En qué se basa?">
                            <Bullet>Cuántas personas compran cuando lo visitan (conversión)</Bullet>
                            <Bullet>Cuántas unidades ha vendido en total desde que existe</Bullet>
                            <Bullet>Cuánta gente lo está viendo este mes</Bullet>
                            <Bullet>Si las ventas están subiendo o bajando</Bullet>
                        </Detalle>
                        <Detalle titulo="¿Cómo se interpretan los colores?">
                            <ColorBand color="bg-emerald-500" label="80 o más"     desc="Top performer del catálogo" />
                            <ColorBand color="bg-blue-500"    label="60 a 79"      desc="Por encima del promedio" />
                            <ColorBand color="bg-amber-500"   label="30 a 59"      desc="Bajo el promedio" />
                            <ColorBand color="bg-slate-300"   label="Menos de 30"  desc="En la cola del catálogo" />
                        </Detalle>
                        <Aviso>
                            Si tienes menos de 20 productos activos, el Score se calcula directo
                            (sin compararse contra el catálogo, porque no hay suficientes para un
                            ranking confiable).
                        </Aviso>
                    </Section>

                    {/* TEMPERATURA */}
                    <Section icon={Thermometer} iconColor="text-orange-500" titulo="Temperatura" subtitulo="0 a 100">
                        <p>
                            Mide <strong>qué tan activo está el producto en los últimos 7 días</strong>. A diferencia
                            del Score, esto es absoluto: no se compara con otros productos, mide
                            si <em>este</em> producto está vivo o quieto.
                        </p>
                        <Detalle titulo="¿En qué se basa?">
                            <Bullet>Ventas de los últimos 7 días</Bullet>
                            <Bullet>Visitas de los últimos 7 días</Bullet>
                            <Bullet>Conversión (qué % de quienes lo ven, compran)</Bullet>
                        </Detalle>
                        <Detalle titulo="Bandas de temperatura">
                            <ColorBand color="bg-emerald-500" label="70 o más"     desc="Caliente — el producto se mueve" />
                            <ColorBand color="bg-amber-400"   label="40 a 69"      desc="Tibio — actividad moderada" />
                            <ColorBand color="bg-slate-300"   label="15 a 39"      desc="Frío — poca actividad" />
                            <ColorBand color="bg-slate-200"   label="Menos de 15"  desc="Helado — sin movimiento real" />
                        </Detalle>
                        <Aviso>
                            La escala se <strong>adapta a tu negocio</strong>: si tus mejores productos
                            venden 10/sem, "Caliente" es 10. Si venden 100/sem, "Caliente" es 100.
                            No hay número mágico fijo.
                        </Aviso>
                    </Section>

                    {/* TENDENCIA */}
                    <Section icon={TrendingUp} iconColor="text-emerald-600" titulo="Tendencia">
                        <p>
                            Muestra si las ventas <strong>subieron o bajaron de forma significativa</strong>
                            en la última semana, comparado con el promedio de las 4 semanas previas.
                        </p>
                        <Detalle titulo="¿Cuándo aparece la flecha?">
                            <Bullet>↑ verde — ventas subieron de forma clara</Bullet>
                            <Bullet>↓ rojo — ventas bajaron de forma clara</Bullet>
                            <Bullet>— gris — sin cambios importantes o sin suficiente volumen</Bullet>
                        </Detalle>
                        <Detalle titulo="¿Por qué a veces sale '—'?">
                            <p>
                                Si el producto vende menos de 1 unidad por semana en promedio, el sistema
                                no muestra tendencia porque cualquier % sería ruido. Por ejemplo: pasar
                                de 1 venta a 2 venta es "+100%", pero estadísticamente no significa nada.
                            </p>
                        </Detalle>
                        <Aviso>
                            Pasamos el filtro estadístico para evitar falsas alarmas: necesita
                            <strong> al menos 15% de cambio Y significancia estadística</strong> para
                            mostrar flecha.
                        </Aviso>
                    </Section>

                    {/* SEÑAL */}
                    <Section icon={FlameAccent} iconColor="text-violet-500" titulo="Señal">
                        <p>
                            Un patrón cualitativo que sugiere <strong>qué hacer con el producto</strong>. Se
                            detectan 6 patrones distintos. Solo aparece uno por producto (el de mayor
                            prioridad si varios aplican).
                        </p>
                        <div className="space-y-2 mt-3">
                            <SenalRow
                                senalKey="lanzamiento"
                                label="Lanzamiento"
                                cuando="Producto creado hace menos de 30 días y ya está vendiendo bien"
                                accion="Subirlo a destacado y escalarlo"
                            />
                            <SenalRow
                                senalKey="trending"
                                label="Trending"
                                cuando="Ventas creciendo con fuerza esta semana"
                                accion="Asegurar stock, escalar pauta"
                            />
                            <SenalRow
                                senalKey="caballo"
                                label="Caballo"
                                cuando="Top performer estable que no está bajando"
                                accion="No tocar lo que funciona"
                            />
                            <SenalRow
                                senalKey="pitch_flojo"
                                label="Pitch flojo"
                                cuando="Recibe muchas visitas pero casi nadie compra"
                                accion="Revisar título, precio, fotos o copy"
                            />
                            <SenalRow
                                senalKey="sin_trafico"
                                label="Sin tráfico"
                                cuando="Casi nadie está viendo este producto"
                                accion="Falta exposición — categoría, SEO o marketing"
                            />
                            <SenalRow
                                senalKey="zombie"
                                label="Zombie"
                                cuando="Sin ventas hace más de 60 días y casi sin visitas"
                                accion="Considerar archivar o relanzar con cambios"
                            />
                        </div>
                    </Section>

                    {/* FRESCURA */}
                    <Section icon={Clock} iconColor="text-slate-500" titulo="¿Cuándo se actualizan los datos?">
                        <p>
                            Las métricas se calculan automáticamente y se guardan en caché por
                            <strong> 1 hora</strong> para que la página cargue rápido.
                        </p>
                        <Detalle titulo="Se actualizan al instante cuando:">
                            <Bullet>Editas un producto (precio, estado, etc.)</Bullet>
                            <Bullet>Llega una orden nueva con este producto</Bullet>
                            <Bullet>Se cancela una orden con este producto</Bullet>
                        </Detalle>
                        <Detalle titulo="Datos que usa el sistema">
                            <Bullet>Tabla de órdenes y sus items</Bullet>
                            <Bullet>Visitas registradas a las páginas de producto</Bullet>
                            <Bullet>Tiempo desde que se creó cada producto</Bullet>
                        </Detalle>
                        <Aviso>
                            Las visitas no actualizan el caché al instante (sería costoso). Pueden tomar
                            hasta 1 hora en reflejarse. Las ventas sí actualizan inmediatamente.
                        </Aviso>
                    </Section>

                </div>
            </SheetContent>
        </Sheet>
    )
}

// ─────────────────────────────────────────────────────────────────
// Sub-componentes internos del Glosario
// ─────────────────────────────────────────────────────────────────

interface SectionProps {
    icon:       React.ComponentType<{ className?: string }>
    iconColor:  string
    titulo:     string
    subtitulo?: string
    children:   React.ReactNode
}

function Section({ icon: Icon, iconColor, titulo, subtitulo, children }: SectionProps) {
    return (
        <section className="space-y-2.5">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200">
                <Icon className={`size-4 ${iconColor}`} />
                <h3 className="text-sm font-semibold text-slate-900">{titulo}</h3>
                {subtitulo && (
                    <span className="text-xs text-slate-500 font-normal">{subtitulo}</span>
                )}
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-2.5">
                {children}
            </div>
        </section>
    )
}

function Detalle({ titulo, children }: { titulo: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{titulo}</p>
            <div className="space-y-1">{children}</div>
        </div>
    )
}

function Bullet({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-sm text-slate-600 leading-relaxed pl-3 relative">
            <span className="absolute left-0 top-2 size-1 rounded-full bg-slate-400" />
            {children}
        </p>
    )
}

function ColorBand({ color, label, desc }: { color: string; label: string; desc: string }) {
    return (
        <div className="flex items-center gap-2.5 text-xs">
            <span className={`size-3 rounded-full ${color} shrink-0`} />
            <span className="font-medium text-slate-700 w-24">{label}</span>
            <span className="text-slate-500">{desc}</span>
        </div>
    )
}

function Aviso({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-600 leading-relaxed">
            {children}
        </div>
    )
}

function SenalRow({
    senalKey, label, cuando, accion,
}: { senalKey: SenalKey; label: string; cuando: string; accion: string }) {
    const { icon: Icon, color } = ICONOS_SENAL[senalKey]
    return (
        <div className="rounded-md border border-slate-200 px-3 py-2.5">
            <div className="flex items-center gap-2 mb-1">
                <Icon className={`size-4 ${color} shrink-0`} />
                <p className="text-sm font-semibold text-slate-900">{label}</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-1">
                <span className="font-medium text-slate-600">Cuándo: </span>{cuando}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-medium text-slate-600">Acción: </span>{accion}
            </p>
        </div>
    )
}
