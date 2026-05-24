import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-slate-400 aria-invalid:border-red-400 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "bg-slate-600 text-white [a&]:hover:bg-slate-800",
        secondary:
          "bg-slate-100 text-slate-700 [a&]:hover:bg-slate-200",
        destructive:
          "bg-red-500 text-white [a&]:hover:bg-red-700",
        outline:
          "border-slate-200 text-slate-700 [a&]:hover:bg-slate-50 [a&]:hover:text-slate-900",
        ghost:
          "[a&]:hover:bg-slate-100 [a&]:hover:text-slate-700",
        link:
          "text-slate-600 underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
