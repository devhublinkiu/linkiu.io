import { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { useEffect } from 'react'
import { Plus, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/AlertDialog'
import AddUserModal from './parts/AddUserModal'

interface Usuario {
    id: number
    name: string
    username: string | null
    email: string
    rol: string
    is_super: boolean
    pendiente: boolean
    created_at: string
}

interface Role {
    id: number
    display_name: string
}

interface Props {
    usuarios: Usuario[]
    roles: Role[]
}

function Iniciales({ name }: { name: string }) {
    const partes = name.trim().split(' ')
    const letras = partes.length >= 2
        ? partes[0][0] + partes[1][0]
        : partes[0].slice(0, 2)
    return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold uppercase text-slate-600">
            {letras}
        </div>
    )
}

export default function UsuariosIndex({ usuarios, roles }: Props) {
    const [modalOpen, setModalOpen] = useState(false)
    const [reenviando, setReenviando] = useState<number | null>(null)
    const [eliminar, setEliminar] = useState<Usuario | null>(null)
    const { props } = usePage<{ auth: { user: { id: number }; permissions: string[] }; flash?: { status?: string } }>()

    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)

    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    const handleReenviar = (usuario: Usuario) => {
        setReenviando(usuario.id)
        router.post(route('admin.usuarios.reenviar', usuario.id), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Invitación reenviada'),
            onError: (e)  => toast.error(e.general ?? 'No se pudo reenviar la invitación'),
            onFinish: ()  => setReenviando(null),
        })
    }

    const confirmarDelete = () => {
        if (!eliminar) return
        router.delete(route('admin.usuarios.destroy', eliminar.id), {
            preserveScroll: true,
            onSuccess: () => { toast.success('Usuario eliminado'); setEliminar(null) },
            onError: (e)  => { toast.error(e.general ?? 'No se pudo eliminar el usuario'); setEliminar(null) },
        })
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Panel', href: route('admin.dashboard') },
                { label: 'Usuarios' },
            ]}
        >
            <Head title="Usuarios" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Usuarios del panel</h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Gestiona los usuarios que tienen acceso al panel de administración.
                    </p>
                </div>
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button
                                    size="sm"
                                    onClick={() => setModalOpen(true)}
                                    disabled={!puede('usuarios.crear')}
                                >
                                    <Plus className="size-4" />
                                    Agregar usuario
                                </Button>
                            </span>
                        </TooltipTrigger>
                        {!puede('usuarios.crear') && (
                            <TooltipContent>No tienes permiso para crear usuarios</TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>

            <TooltipProvider delayDuration={200}>
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-100">
                                <th className="px-4 py-3 text-left font-medium text-slate-500">Usuario</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-500">Correo</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-500">Rol</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-500">Estado</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-500">Creado</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                                        No hay usuarios registrados aún.
                                    </td>
                                </tr>
                            )}
                            {usuarios.map(usuario => (
                                <tr key={usuario.id} className="border-b border-slate-100 bg-white transition-colors duration-200 last:border-0 hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Iniciales name={usuario.name} />
                                            <div>
                                                <p className="font-medium text-slate-900">{usuario.name}</p>
                                                {usuario.username && (
                                                    <p className="text-xs text-slate-400">@{usuario.username}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{usuario.email}</td>
                                    <td className="px-4 py-3 text-slate-600">{usuario.rol}</td>
                                    <td className="px-4 py-3">
                                        {usuario.pendiente ? (
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                                    Pendiente
                                                </span>
                                                {puede('usuarios.crear') && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={() => handleReenviar(usuario)}
                                                                disabled={reenviando === usuario.id}
                                                                className="rounded p-1 text-slate-400 transition-colors duration-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 outline-none"
                                                            >
                                                                <RefreshCw className={`size-3.5 ${reenviando === usuario.id ? 'animate-spin' : ''}`} />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Reenviar invitación</TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                                Activo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{usuario.created_at}</td>
                                    <td className="px-4 py-3 text-right">
                                        {(() => {
                                            const esSelf    = usuario.id === props.auth.user.id
                                            const esSuper   = usuario.is_super
                                            const sinPerm   = !puede('usuarios.eliminar')
                                            const deshabilitado = esSelf || esSuper || sinPerm
                                            const tooltip = esSuper
                                                ? 'No se puede eliminar al super-admin'
                                                : esSelf
                                                    ? 'No puedes eliminar tu propia cuenta'
                                                    : sinPerm
                                                        ? 'No tienes permiso para eliminar usuarios'
                                                        : 'Eliminar usuario'
                                            return (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span>
                                                            <button
                                                                onClick={() => !deshabilitado && setEliminar(usuario)}
                                                                disabled={deshabilitado}
                                                                className="rounded p-1 text-slate-300 transition-colors duration-200 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 outline-none"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="left">{tooltip}</TooltipContent>
                                                </Tooltip>
                                            )
                                        })()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TooltipProvider>

            <AddUserModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                roles={roles}
            />

            <AlertDialog open={!!eliminar} onOpenChange={open => !open && setEliminar(null)}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de eliminar a <strong>{eliminar?.name}</strong>. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={confirmarDelete}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    )
}
