import { type ReactNode, useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { CheckIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import ClientLayout from '@/Layouts/ClientLayout'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Button } from '@/Components/ui/Button'

interface ClienteData {
    nombre: string
    apellido: string
    email: string
    telefono: string
}

interface Props {
    cliente: ClienteData
}

function Perfil() {
    const { cliente: inicial } = usePage<Props>().props

    const [nombre,   setNombre]   = useState(inicial.nombre)
    const [apellido, setApellido] = useState(inicial.apellido)
    const [telefono, setTelefono] = useState(inicial.telefono)
    const [editando, setEditando] = useState(false)
    const [guardando, setGuardando] = useState(false)

    function guardar() {
        if (!nombre.trim() || !apellido.trim() || !telefono.trim()) {
            toast.error('Completa todos los campos')
            return
        }
        setGuardando(true)
        router.post(route('cuenta.perfil.update'), { nombre, apellido, telefono }, {
            preserveState: true,
            onSuccess: () => { setEditando(false); toast.success('Perfil actualizado') },
            onError: () => toast.error('Error al guardar'),
            onFinish: () => setGuardando(false),
        })
    }

    function cancelar() {
        setNombre(inicial.nombre)
        setApellido(inicial.apellido)
        setTelefono(inicial.telefono)
        setEditando(false)
    }

    return (
        <>
            <Head title="Mi perfil" />

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-900">Información personal</span>
                    {!editando ? (
                        <Button variant="ghost" size="xs" onClick={() => setEditando(true)}>
                            Editar
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="xs" onClick={cancelar}>
                                <XIcon /> Cancelar
                            </Button>
                            <Button size="xs" onClick={guardar} disabled={guardando}>
                                <CheckIcon />
                                {guardando ? 'Guardando…' : 'Guardar'}
                            </Button>
                        </div>
                    )}
                </div>

                <div className="px-5 py-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <Label>Nombre</Label>
                        {editando ? (
                            <Input value={nombre} onChange={e => setNombre(e.target.value)} />
                        ) : (
                            <p className="text-sm text-slate-900">{nombre}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label>Apellido</Label>
                        {editando ? (
                            <Input value={apellido} onChange={e => setApellido(e.target.value)} />
                        ) : (
                            <p className="text-sm text-slate-900">{apellido}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label>Correo electrónico</Label>
                        <p className="text-sm text-slate-500">{inicial.email}</p>
                        <p className="text-xs text-slate-500">El correo no se puede cambiar.</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Teléfono</Label>
                        {editando ? (
                            <Input value={telefono} onChange={e => setTelefono(e.target.value)} />
                        ) : (
                            <p className="text-sm text-slate-900">{telefono}</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

Perfil.layout = (page: ReactNode) => (
    <ClientLayout tab="perfil">{page}</ClientLayout>
)

export default Perfil
