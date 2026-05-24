import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Textarea } from '@/Components/ui/Textarea'
import TokenSelector from '../TokenSelector'

interface Colores { primario: string; secundario: string; acento: string }

export interface MisionVisionConfig {
    mision:             string | null
    vision:             string | null
    color_fondo_mision: string
    color_fondo_vision: string
}

interface Props {
    open:     boolean
    onClose:  () => void
    config:   MisionVisionConfig | null
    colores:  Colores
    disabled: boolean
}

export default function ModalMisionVision({ open, onClose, config, colores, disabled }: Props) {
    const [mision,           setMision]           = useState('')
    const [vision,           setVision]           = useState('')
    const [colorFondoMision, setColorFondoMision] = useState('blanco')
    const [colorFondoVision, setColorFondoVision] = useState('negro')
    const [guardando,        setGuardando]        = useState(false)

    useEffect(() => {
        if (!open) return
        setMision(config?.mision                       ?? '')
        setVision(config?.vision                       ?? '')
        setColorFondoMision(config?.color_fondo_mision ?? 'blanco')
        setColorFondoVision(config?.color_fondo_vision ?? 'negro')
    }, [open])

    const tokenOpciones = [
        { label: 'Principal',  value: 'primario',   hex: colores.primario   },
        { label: 'Secundario', value: 'secundario', hex: colores.secundario },
        { label: 'Acento',     value: 'acento',     hex: colores.acento     },
        { label: 'Blanco',     value: 'blanco',     hex: '#FFFFFF'          },
        { label: 'Negro',      value: 'negro',      hex: '#000000'          },
    ]

    function guardar() {
        setGuardando(true)
        router.post(route('admin.build.quienes-somos.mision-vision.config'), {
            mision:             mision || null,
            vision:             vision || null,
            color_fondo_mision: colorFondoMision,
            color_fondo_vision: colorFondoVision,
        }, {
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
                    <SheetTitle>Misión y visión</SheetTitle>
                    <SheetDescription>Propósito y proyección de la marca.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                    {/* Misión */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700">Misión</p>
                        <Textarea
                            id="mv-mision"
                            value={mision}
                            maxLength={400}
                            disabled={disabled}
                            onChange={e => setMision(e.target.value)}
                            placeholder="Ofrecer productos de cuidado capilar de alta calidad, libres de químicos agresivos…"
                            rows={4}
                        />
                        <TokenSelector
                            label="Color de fondo"
                            value={colorFondoMision}
                            onChange={setColorFondoMision}
                            opciones={tokenOpciones}
                            disabled={disabled}
                        />
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* Visión */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700">Visión</p>
                        <Textarea
                            id="mv-vision"
                            value={vision}
                            maxLength={400}
                            disabled={disabled}
                            onChange={e => setVision(e.target.value)}
                            placeholder="Ser la marca de referencia en cuidado capilar natural en Colombia…"
                            rows={4}
                        />
                        <TokenSelector
                            label="Color de fondo"
                            value={colorFondoVision}
                            onChange={setColorFondoVision}
                            opciones={tokenOpciones}
                            disabled={disabled}
                        />
                    </div>

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
