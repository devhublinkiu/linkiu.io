import { useState, useEffect } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import PermissionMatrix from './parts/PermissionMatrix'
import AddRoleModal from './parts/AddRoleModal'

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
    total_custom: number
    limite: number
}

export default function RolesIndex({ modulos, roles, total_custom, limite }: Props) {
    const [modalOpen, setModalOpen] = useState(false)
    const { props } = usePage<{ auth: { permissions: string[] }; flash?: { status?: string } }>()

    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)

    // Mostrar toast si viene flash de éxito tras crear/eliminar
    useEffect(() => {
        if (props.flash?.status) {
            toast.success(props.flash.status)
        }
    }, [props.flash?.status])

    const limiteAlcanzado = total_custom >= limite

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Panel', href: route('admin.dashboard') },
                { label: 'Roles y permisos' },
            ]}
        >
            <Head title="Roles y permisos" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Matriz de permisos</h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Activa o desactiva permisos por rol. Los cambios se guardan automáticamente.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">
                        {total_custom}/{limite} roles personalizados
                    </span>
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        size="sm"
                                        onClick={() => setModalOpen(true)}
                                        disabled={limiteAlcanzado || !puede('roles.crear')}
                                    >
                                        <Plus className="size-4" />
                                        Agregar rol
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            {(!puede('roles.crear') || limiteAlcanzado) && (
                                <TooltipContent>
                                    {!puede('roles.crear')
                                        ? 'No tienes permiso para crear roles'
                                        : `Límite de ${limite} roles personalizados alcanzado`
                                    }
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <PermissionMatrix modulos={modulos} roles={roles} />

            <AddRoleModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                totalCustom={total_custom}
                limite={limite}
            />
        </AdminLayout>
    )
}
