import { CheckIcon, Pencil, Star, Trash2 } from 'lucide-react'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from '@/Components/ui/AlertDialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'

export interface Direccion {
    id: number
    etiqueta: string | null
    departamento: string
    ciudad: string
    direccion: string
    apartamento: string | null
    predeterminada: boolean
}

interface Props {
    direccion: Direccion
    onEditar: (d: Direccion) => void
    onEliminar: (d: Direccion) => void
    onMarcarPredeterminada: (d: Direccion) => void
}

export function AddressCard({ direccion: d, onEditar, onEliminar, onMarcarPredeterminada }: Props) {
    return (
        <div className={`bg-white border rounded-lg p-5 ${d.predeterminada ? 'border-slate-900' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-900">
                            {d.etiqueta || d.ciudad}
                        </p>
                        {d.predeterminada && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                                <Star className="w-2.5 h-2.5" /> Predeterminada
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500">{d.direccion}{d.apartamento ? `, ${d.apartamento}` : ''}</p>
                    <p className="text-xs text-slate-500">{d.ciudad}, {d.departamento}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {!d.predeterminada && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onMarcarPredeterminada(d)}
                                        className="p-1.5 text-slate-500 hover:text-slate-700 transition-colors duration-200"
                                    >
                                        <CheckIcon className="w-4 h-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Marcar como predeterminada</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    <button
                        onClick={() => onEditar(d)}
                        className="p-1.5 text-slate-500 hover:text-slate-700 transition-colors duration-200"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button className="p-1.5 text-slate-500 hover:text-red-500 transition-colors duration-200">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar dirección?</AlertDialogTitle>
                                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction variant="destructive" onClick={() => onEliminar(d)}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    )
}
