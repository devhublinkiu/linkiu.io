import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'

export interface CtaQuienesConfig {
    titulo:      string | null
    descripcion: string | null
    btn_texto:   string | null
    btn_link:    string | null
}

interface Props {
    open:     boolean
    onClose:  () => void
    config:   CtaQuienesConfig | null
    disabled: boolean
}

export default function ModalCtaQuienes({ open, onClose, config, disabled }: Props) {
    const [titulo,      setTitulo]      = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [btnTexto,    setBtnTexto]    = useState('')
    const [btnLink,     setBtnLink]     = useState('')
    const [guardando,   setGuardando]   = useState(false)

    useEffect(() => {
        if (!open) return
        setTitulo(config?.titulo           ?? '')
        setDescripcion(config?.descripcion ?? '')
        setBtnTexto(config?.btn_texto      ?? '')
        setBtnLink(config?.btn_link        ?? '')
    }, [open])

    function guardar() {
        setGuardando(true)
        router.post(route('admin.build.quienes-somos.cta.config'), {
            titulo:      titulo      || null,
            descripcion: descripcion || null,
            btn_texto:   btnTexto    || null,
            btn_link:    btnLink     || null,
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
                    <SheetTitle>CTA</SheetTitle>
                    <SheetDescription>Llamada a acción al pie de la página.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                    <div className="space-y-1.5">
                        <Label htmlFor="cta-titulo">Título</Label>
                        <Input
                            id="cta-titulo"
                            value={titulo}
                            maxLength={100}
                            disabled={disabled}
                            onChange={e => setTitulo(e.target.value)}
                            placeholder="¿Lista para probar nuestra línea?"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="cta-desc">Descripción</Label>
                        <Input
                            id="cta-desc"
                            value={descripcion}
                            maxLength={150}
                            disabled={disabled}
                            onChange={e => setDescripcion(e.target.value)}
                            placeholder="Descubre la línea completa de productos."
                        />
                    </div>

                    <div className="border-t border-slate-100" />

                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700">Botón</p>
                        <div className="space-y-1.5">
                            <Label htmlFor="cta-btn-texto">Texto</Label>
                            <Input
                                id="cta-btn-texto"
                                value={btnTexto}
                                maxLength={50}
                                disabled={disabled}
                                onChange={e => setBtnTexto(e.target.value)}
                                placeholder="Ver productos"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="cta-btn-link">Link</Label>
                            <Input
                                id="cta-btn-link"
                                value={btnLink}
                                maxLength={500}
                                disabled={disabled || !btnTexto}
                                onChange={e => setBtnLink(e.target.value)}
                                placeholder="/productos"
                            />
                        </div>
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
