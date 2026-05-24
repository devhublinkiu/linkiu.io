import { useEffect, useRef, useState } from 'react'
import { usePage } from '@inertiajs/react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import PlaceholderImage from '@/Components/public/PlaceholderImage'

interface CarruselItem { url: string; ruta: string; link: string | null }
interface CarruselConfig {
    titulo:      string | null
    descripcion: string | null
    items:       CarruselItem[]
}

// Cantidad de placeholders cuando el carrusel está vacío. El admin sube
// imágenes reales desde LinkiuBuild → Inicio → Carrusel y reemplazan estos slots.
const PLACEHOLDER_SLOTS = 4

const ITEM_WIDTH  = 280
const GAP         = 16

export default function Carrusel() {
    const { build } = usePage<{ build?: { carrusel?: CarruselConfig } }>().props

    const cfg   = build?.carrusel
    const items = cfg?.items ?? []

    const scrollRef                     = useRef<HTMLDivElement>(null)
    const [canPrev, setCanPrev]         = useState(false)
    const [canNext, setCanNext]         = useState(true)

    function actualizarFlechas() {
        const el = scrollRef.current
        if (!el) return
        setCanPrev(el.scrollLeft > 4)
        setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
    }

    useEffect(() => {
        actualizarFlechas()
    }, [items.length])

    function scrollPrev() {
        scrollRef.current?.scrollBy({ left: -(ITEM_WIDTH + GAP) * 2, behavior: 'smooth' })
    }

    function scrollNext() {
        scrollRef.current?.scrollBy({ left:  (ITEM_WIDTH + GAP) * 2, behavior: 'smooth' })
    }

    const titulo = cfg?.titulo      || null
    const desc   = cfg?.descripcion || null
    const usarPlaceholder = items.length === 0

    function Imagen({ item }: { item: CarruselItem }) {
        const img = (
            <img
                src={item.url}
                alt=""
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                draggable={false}
            />
        )
        if (item.link) {
            return (
                <a href={item.link} className="group block size-full overflow-hidden rounded-xl">
                    {img}
                </a>
            )
        }
        return <div className="group size-full overflow-hidden rounded-xl">{img}</div>
    }

    return (
        <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-6">

                {(titulo || desc) && (
                    <div className="mb-10">
                        {titulo && <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{titulo}</h2>}
                        {desc   && <p className="mt-3 text-lg text-slate-500">{desc}</p>}
                    </div>
                )}

                <div className="relative">
                    {/* Flechas — solo desktop */}
                    {canPrev && (
                        <button
                            type="button"
                            onClick={scrollPrev}
                            className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                            aria-label="Anterior"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                    )}
                    {canNext && (
                        <button
                            type="button"
                            onClick={scrollNext}
                            className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                            aria-label="Siguiente"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    )}

                    {/* Scroll container */}
                    <div
                        ref={scrollRef}
                        onScroll={actualizarFlechas}
                        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 -mx-6 px-6 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {usarPlaceholder ? (
                            Array.from({ length: PLACEHOLDER_SLOTS }).map((_, i) => (
                                <div
                                    key={i}
                                    className="shrink-0 aspect-square w-[65vw] md:w-64 lg:w-72"
                                >
                                    <PlaceholderImage label="Imagen" iconSize="md" className="rounded-xl" />
                                </div>
                            ))
                        ) : (
                            items.map((item, i) => (
                                <div
                                    key={i}
                                    className="shrink-0 aspect-square w-[65vw] md:w-64 lg:w-72 rounded-xl overflow-hidden bg-slate-100"
                                >
                                    <Imagen item={item} />
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </section>
    )
}
