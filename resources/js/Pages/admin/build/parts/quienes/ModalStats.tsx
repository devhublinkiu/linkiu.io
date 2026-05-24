import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'

interface StatItem { valor: string; etiqueta: string }

export interface StatsConfig {
    items: StatItem[]
}

interface Props {
    open:     boolean
    onClose:  () => void
    config:   StatsConfig | null
    disabled: boolean
}

const EMPTY_STATS: StatItem[] = [
    { valor: '', etiqueta: '' },
    { valor: '', etiqueta: '' },
    { valor: '', etiqueta: '' },
    { valor: '', etiqueta: '' },
]

export default function ModalStats({ open, onClose, config, disabled }: Props) {
    const [stats,    setStats]    = useState<StatItem[]>(EMPTY_STATS)
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        if (!open) return
        setStats(config?.items?.length === 4 ? config.items : EMPTY_STATS)
    }, [open])

    function actualizar(i: number, campo: keyof StatItem, val: string) {
        setStats(prev => prev.map((s, idx) => idx === i ? { ...s, [campo]: val } : s))
    }

    function guardar() {
        setGuardando(true)
        router.post(route('admin.build.quienes-somos.stats.config'), { items: stats }, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
            <SheetContent className="sm:max-w-lg flex flex-col">
                <SheetHeader>
                    <SheetTitle>Estadísticas</SheetTitle>
                    <SheetDescription>4 cifras destacadas de la marca.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {stats.map((stat, i) => (
                        <div key={i} className="rounded-lg border border-slate-200 p-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-400 w-4 shrink-0">{i + 1}</span>
                                <Input
                                    value={stat.valor}
                                    maxLength={20}
                                    disabled={disabled}
                                    onChange={e => actualizar(i, 'valor', e.target.value)}
                                    placeholder="1.200+"
                                    className="w-24 shrink-0"
                                />
                                <Input
                                    value={stat.etiqueta}
                                    maxLength={40}
                                    disabled={disabled}
                                    onChange={e => actualizar(i, 'etiqueta', e.target.value)}
                                    placeholder="Clientas satisfechas"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || disabled}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
