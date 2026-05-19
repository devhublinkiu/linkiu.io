import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputErrorProps extends HTMLAttributes<HTMLParagraphElement> {
    message?: string
}

export default function InputError({ message, className, ...props }: InputErrorProps) {
    return message ? (
        <p {...props} className={cn('text-sm text-red-500', className)}>
            {message}
        </p>
    ) : null
}
