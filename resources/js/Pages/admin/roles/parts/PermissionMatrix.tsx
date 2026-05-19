import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/Components/ui/Switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/AlertDialog'
import axios from 'axios'

interface Role {
    id: number
    name: string
    display_name: string
    is_super: boolean
    is_system: boolean
    users_count: number
    permissions: string[]
}

interface ModuloConfig {
    label: string
    actions: Record<string, string>
}

interface Props {
    modulos: Record<string, ModuloConfig>
    roles: Role[]
}

export default function PermissionMatrix({ modulos, roles }: Props) {
    const [permisos, setPermisos] = useState<Record<number, string[]>>(
        Object.fromEntries(roles.map(r => [r.id, r.permissions]))
    )
    const [toggling, setToggling] = useState<string | null>(null)
    const [eliminar, setEliminar] = useState<Role | null>(null)

    const tienePermiso = (roleId: number, permiso: string) =>
        permisos[roleId]?.includes(permiso) ?? false

    const handleToggle = async (role: Role, permiso: string) => {
        if (role.is_super) return

        const key = `${role.id}-${permiso}`
        setToggling(key)

        const activo = tienePermiso(role.id, permiso)

        // Actualización optimista
        setPermisos(prev => ({
            ...prev,
            [role.id]: activo
                ? prev[role.id].filter(p => p !== permiso)
                : [...(prev[role.id] ?? []), permiso],
        }))

        try {
            await axios.post(route('admin.roles.toggle-permission', role.id), { permiso })
            toast.success(activo ? 'Permiso desactivado' : 'Permiso activado')
        } catch {
            // Revertir si falla
            setPermisos(prev => ({
                ...prev,
                [role.id]: activo
                    ? [...(prev[role.id] ?? []), permiso]
                    : prev[role.id].filter(p => p !== permiso),
            }))
            toast.error('No se pudo actualizar el permiso')
        } finally {
            setToggling(null)
        }
    }

    const confirmarDelete = () => {
        if (!eliminar) return
        router.delete(route('admin.roles.destroy', eliminar.id), {
            preserveScroll: true,
            onSuccess: () => { toast.success('Rol eliminado correctamente'); setEliminar(null) },
            onError:   () => { toast.error('No se pudo eliminar el rol'); setEliminar(null) },
        })
    }

    return (
        <TooltipProvider delayDuration={200}>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-100">
                            <th className="px-4 py-3 text-left font-medium text-slate-500">
                                Módulo / Acción
                            </th>
                            {roles.map(role => (
                                <th key={role.id} className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className={`font-semibold ${role.is_super ? 'text-slate-900' : 'text-slate-700'}`}>
                                            {role.display_name}
                                        </span>
                                        {!role.is_system && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => role.users_count === 0 && setEliminar(role)}
                                                        disabled={role.users_count > 0}
                                                        className="rounded p-0.5 text-slate-300 transition-colors duration-200 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 outline-none"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" sideOffset={4}>
                                                    {role.users_count > 0
                                                        ? `Tiene ${role.users_count} usuario${role.users_count !== 1 ? 's' : ''} asignado${role.users_count !== 1 ? 's' : ''}`
                                                        : 'Eliminar rol'
                                                    }
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                    {role.users_count > 0 && (
                                        <span className="mt-0.5 block text-xs font-normal text-slate-400">
                                            {role.users_count} usuario{role.users_count !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(modulos).map(([moduloKey, modulo]) => (
                            <>
                                {/* Fila de cabecera del módulo */}
                                <tr key={`header-${moduloKey}`} className="border-b border-slate-200 bg-slate-50">
                                    <td
                                        colSpan={roles.length + 1}
                                        className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-950"
                                    >
                                        {modulo.label}
                                    </td>
                                </tr>

                                {/* Filas de acciones */}
                                {Object.entries(modulo.actions).map(([accionKey, accionLabel]) => {
                                    const permiso = `${moduloKey}.${accionKey}`
                                    const algunActivo = roles.some(r => tienePermiso(r.id, permiso))
                                    return (
                                        <tr key={permiso} className="border-b border-slate-100 bg-white transition-colors duration-200 last:border-0 hover:bg-slate-50">
                                            <td className={`px-4 py-3 ${algunActivo ? 'text-slate-950' : 'text-slate-600'}`}>
                                                {accionLabel}
                                            </td>
                                            {roles.map(role => (
                                                <td key={role.id} className="px-4 py-3 text-center">
                                                    <Switch
                                                        checked={tienePermiso(role.id, permiso)}
                                                        onCheckedChange={() => handleToggle(role, permiso)}
                                                        disabled={role.is_super || toggling === `${role.id}-${permiso}`}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    )
                                })}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
            <AlertDialog open={!!eliminar} onOpenChange={open => !open && setEliminar(null)}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar rol?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de eliminar el rol <strong>{eliminar?.display_name}</strong>. Esta acción no se puede deshacer.
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
        </TooltipProvider>
    )
}
