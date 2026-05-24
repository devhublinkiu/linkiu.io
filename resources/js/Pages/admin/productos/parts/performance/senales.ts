import {
    EyeOff, Flame, MoonStar, MousePointerClick, Rocket, Trophy,
    type LucideIcon,
} from 'lucide-react'
import type { SenalKey } from './types'

/**
 * Mapping centralizado SenalKey → Lucide icon + color semántico.
 * Compartido por `SenalIcon` (en la tabla) y `GlosarioPerformance`
 * (en el Sheet de ayuda) para garantizar coherencia visual.
 */
export const ICONOS_SENAL: Record<SenalKey, { icon: LucideIcon; color: string }> = {
    zombie:      { icon: MoonStar,           color: 'text-slate-400'   },
    pitch_flojo: { icon: MousePointerClick,  color: 'text-amber-600'   },
    sin_trafico: { icon: EyeOff,             color: 'text-blue-500'    },
    lanzamiento: { icon: Rocket,             color: 'text-violet-500'  },
    trending:    { icon: Flame,              color: 'text-orange-500'  },
    caballo:     { icon: Trophy,             color: 'text-emerald-600' },
}
