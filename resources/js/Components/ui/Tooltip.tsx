import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function TooltipProvider({
    delayDuration = 0,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
    return (
        <TooltipPrimitive.Provider
            data-slot="tooltip-provider"
            delayDuration={delayDuration}
            {...props}
        />
    )
}

function Tooltip({
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
    return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

// Trigger/Content necesitan forwardRef porque Radix UI pasa refs internamente
// (focus management + portal positioning). React 18: function components sin
// forwardRef → warning + ref perdido.
const TooltipTrigger = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ ...props }, ref) => (
    <TooltipPrimitive.Trigger ref={ref} data-slot="tooltip-trigger" {...props} />
))
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 0, children, ...props }, ref) => (
    <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
            ref={ref}
            data-slot="tooltip-content"
            sideOffset={sideOffset}
            className={cn(
                "z-50 inline-flex w-fit max-w-xs origin-[var(--radix-tooltip-content-transform-origin)] items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-white outline-none has-[[data-slot=kbd]]:pr-1.5",
                className
            )}
            {...props}
        >
            {children}
            <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-slate-700 fill-slate-700" />
        </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
