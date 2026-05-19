import { useForm } from '@inertiajs/react'
import { FormEventHandler } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/Dialog'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'

interface Props {
    open: boolean
    onClose: () => void
    totalCustom: number
    limite: number
}

export default function AddRoleModal({ open, onClose, totalCustom, limite }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({ nombre: '' })

    const submit: FormEventHandler = (e) => {
        e.preventDefault()
        post(route('admin.roles.store'), {
            preserveScroll: true,
            onSuccess: () => { reset(); onClose() },
            onError:   () => toast.error('Error al crear el rol'),
        })
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose() } }}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Agregar rol</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-slate-500">
                    {totalCustom} de {limite} roles personalizados usados.
                </p>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="nombre">Nombre del rol</Label>
                        <Input
                            id="nombre"
                            value={data.nombre}
                            onChange={e => setData('nombre', e.target.value)}
                            placeholder="ej: soporte, vendedor"
                            autoFocus
                            className="h-9"
                        />
                        {errors.nombre && (
                            <p className="text-xs text-red-500">{errors.nombre}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => { reset(); onClose() }}>
                            Cancelar
                        </Button>
                        <Button type="submit" size="sm" disabled={processing || !data.nombre.trim()}>
                            {processing ? 'Creando...' : 'Crear rol'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
