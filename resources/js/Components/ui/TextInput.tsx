import { forwardRef, useEffect, useRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    isFocused?: boolean
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
    { type = 'text', className, isFocused = false, ...props },
    ref
) {
    const localRef = useRef<HTMLInputElement>(null)
    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) ?? localRef

    useEffect(() => {
        if (isFocused) resolvedRef.current?.focus()
    }, [])

    return (
        <input
            {...props}
            type={type}
            ref={resolvedRef}
            className={cn(
                'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-gray-400 transition-colors duration-200 ease-in-out focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300',
                className
            )}
        />
    )
})

export default TextInput
