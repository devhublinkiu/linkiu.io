import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Textarea } from '@/Components/ui/Textarea'
import TokenSelector from '../TokenSelector'

interface Colores { primario: string; secundario: string; acento: string }

export interface HeroContactoConfig {
    titulo:            string | null
    color_titulo:      string
    descripcion:       string | null
    color_descripcion: string
}

interface Props {
    open:     boolean
    onClose:  () => void
    config:   HeroContactoConfig | null
    colores:  Colores
    disabled: boolean
}

export default function ModalHeroContacto({ open, onClose, config, colores, disabled }: Props) {
    const [titulo,           setTitulo]           = useState('')
    const [colorTitulo,      setColorTitulo]      = useState('primario')
    const [descripcion,      setDescripcion]      = useState('')
    const [colorDescripcion, setColorDescripcion] = useState('negro')
    const [guardando,        setGuardando]        = useState(false)

    useEffect(() => {
        if (!open) return
        setTitulo(config?.titulo                      ?? '')
        setColorTitulo(config?.color_titulo           ?? 'primario')
        setDescripcion(config?.descripcion            ?? '')
        setColorDescripcion(config?.color_descripcion ?? 'negro')
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
        router.post(route('admin.build.contacto.hero.config'), {
            titulo:            titulo      || null,
            color_titulo:      colorTitulo,
            descripcion:       descripcion || null,
            color_descripcion: colorDescripcion,
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
                    <SheetTitle>Hero</SheetTitle>
                    <SheetDescription>Título y descripción de la página de contacto.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700">Título</p>
                        <div className="space-y-1.5">
                            <Label htmlFor="hero-titulo">Texto</Label>
                            <Input
                                id="hero-titulo"
                                value={titulo}
                                maxLength={100}
                                disabled={disabled}
                                onChange={e => setTitulo(e.target.value)}
                                placeholder="¿En qué podemos ayudarte?"
                            />
                        </div>
                        <TokenSelector
                            label="Color"
                            value={colorTitulo}
                            onChange={setColorTitulo}
                            opciones={tokenOpciones}
                            disabled={disabled}
                        />
                    </div>

                    <div className="border-t border-slate-100" />

                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700">Descripción</p>
                        <Textarea
                            value={descripcion}
                            maxLength={300}
                            disabled={disabled}
                            onChange={e => setDescripcion(e.target.value)}
                            placeholder="Elige el canal que prefieras. Estamos disponibles para responder tus preguntas."
                            rows={3}
                        />
                        <TokenSelector
                            label="Color del texto"
                            value={colorDescripcion}
                            onChange={setColorDescripcion}
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
