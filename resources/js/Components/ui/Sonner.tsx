import { type CSSProperties } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster({ ...props }: ToasterProps) {
    return (
        <Sonner
            theme="light"
            position="bottom-center"
            richColors
            toastOptions={{
                classNames: {
                    toast:        "!shadow-none !rounded-lg",
                    closeButton:  "!rounded-lg !border-slate-200 !bg-white !text-slate-500 hover:!bg-slate-100",
                    actionButton: "!rounded-lg !bg-slate-600 !text-white hover:!bg-slate-700",
                    cancelButton: "!rounded-lg !bg-slate-100 !text-slate-700 hover:!bg-slate-200",
                },
            }}
            style={{
                "--normal-bg":      "#ffffff",
                "--normal-border":  "#e2e8f0",
                "--normal-text":    "#334155",
                "--success-bg":     "#ecfdf5",
                "--success-border": "#d1fae5",
                "--success-text":   "#059669",
                "--error-bg":       "#fef2f2",
                "--error-border":   "#fee2e2",
                "--error-text":     "#dc2626",
                "--info-bg":        "#eff6ff",
                "--info-border":    "#dbeafe",
                "--info-text":      "#2563eb",
                "--warning-bg":     "#fffbeb",
                "--warning-border": "#fef3c7",
                "--warning-text":   "#d97706",
            } as CSSProperties}
            {...props}
        />
    )
}

export { Toaster }
