import { useForm } from '@inertiajs/react'
import { FormEventHandler } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/Dialog'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/Select'

interface Role {
    id: number
    display_name: string
}

interface Props {
    open: boolean
    onClose: () => void
    roles: Role[]
}

export default function AddUserModal({ open, onClose, roles }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name:        '',
        username:    '',
        email:       '',
        phone:       '',
        gender:      '',
        role_id:     '',
        birthdate:   '',
        country:     '',
        department:  '',
        city:        '',
    })

    const submit: FormEventHandler = (e) => {
        e.preventDefault()
        post(route('admin.usuarios.store'), {
            preserveScroll: true,
            onSuccess: () => { reset(); onClose() },
        })
    }

    const handleClose = () => { reset(); onClose() }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Agregar usuario</DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-3">

                    {/* Nombre completo */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Nombre completo <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Juan Pérez"
                            className="h-9"
                            autoFocus
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>

                    {/* Correo */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Correo electrónico <span className="text-red-500">*</span></Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="juan@empresa.com"
                            className="h-9"
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>

                    {/* Celular + Sexo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="phone">Celular <span className="text-red-500">*</span></Label>
                            <div className="flex h-9 overflow-hidden rounded-md border border-slate-200 focus-within:border-slate-400 focus-within:ring-3 focus-within:ring-slate-300/50">
                                <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 select-none">
                                    +57
                                </span>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    placeholder="300 000 0000"
                                    className="flex-1 bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                                />
                            </div>
                            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Sexo</Label>
                            <Select value={data.gender} onValueChange={v => setData('gender', v)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="masculino">Masculino</SelectItem>
                                    <SelectItem value="femenino">Femenino</SelectItem>
                                    <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
                        </div>
                    </div>

                    {/* Usuario + Rol */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="username">Usuario <span className="text-red-500">*</span></Label>
                            <Input
                                id="username"
                                value={data.username}
                                onChange={e => setData('username', e.target.value)}
                                placeholder="juanperez"
                                className="h-9"
                            />
                            {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Rol <span className="text-red-500">*</span></Label>
                            <Select value={data.role_id} onValueChange={v => setData('role_id', v)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map(r => (
                                        <SelectItem key={r.id} value={String(r.id)}>
                                            {r.display_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role_id && <p className="text-xs text-red-500">{errors.role_id}</p>}
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="border-t border-slate-100 pt-3">
                        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">Información adicional</p>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="birthdate">Fecha de cumpleaños</Label>
                                <Input
                                    id="birthdate"
                                    type="date"
                                    value={data.birthdate}
                                    onChange={e => setData('birthdate', e.target.value)}
                                    className="h-9"
                                />
                                {errors.birthdate && <p className="text-xs text-red-500">{errors.birthdate}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="country">País</Label>
                                <Input
                                    id="country"
                                    value={data.country}
                                    onChange={e => setData('country', e.target.value)}
                                    placeholder="Colombia"
                                    className="h-9"
                                />
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="department">Departamento</Label>
                                <Input
                                    id="department"
                                    value={data.department}
                                    onChange={e => setData('department', e.target.value)}
                                    placeholder="Antioquia"
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="city">Ciudad</Label>
                                <Input
                                    id="city"
                                    value={data.city}
                                    onChange={e => setData('city', e.target.value)}
                                    placeholder="Medellín"
                                    className="h-9"
                                />
                            </div>
                        </div>
                    </div>

                    {errors.general && (
                        <p className="text-xs text-red-500">{errors.general}</p>
                    )}

                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                        <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={processing || !data.name || !data.email || !data.phone || !data.gender || !data.username || !data.role_id}
                        >
                            {processing ? 'Enviando invitación...' : 'Crear y enviar invitación'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
