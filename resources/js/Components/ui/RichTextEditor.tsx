import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import {
    BoldIcon, ItalicIcon, Heading2Icon, Heading3Icon,
    ListIcon, ListOrderedIcon, LinkIcon, QuoteIcon, UndoIcon, RedoIcon,
} from 'lucide-react'
import { useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface Props {
    /** HTML inicial (lo que viene de la BD). */
    value:        string
    /** Callback cuando cambia el contenido. Recibe HTML. */
    onChange:     (html: string) => void
    placeholder?: string
    disabled?:    boolean
    className?:   string
}

interface ToolbarButtonProps {
    onClick:  () => void
    active?:  boolean
    disabled?: boolean
    label:    string
    children: React.ReactNode
}

function ToolbarButton({ onClick, active, disabled, label, children }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
            className={cn(
                'flex items-center justify-center size-7 rounded transition-colors duration-200 ease-in-out',
                active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
            )}
        >
            {children}
        </button>
    )
}

/**
 * Editor WYSIWYG basado en TipTap. Genera HTML semántico que el backend
 * sanitiza con HTMLPurifier antes de persistir (defensa XSS).
 *
 * Soporta: bold, italic, h2/h3, bullet/ordered lists, blockquote, links,
 * undo/redo. Suficiente para artículos de blog sin abrir superficie de
 * ataque o complejidad innecesaria.
 */
export default function RichTextEditor({ value, onChange, placeholder, disabled, className }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },     // H1 lo reservamos para el título del post
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class:  'text-slate-900 underline underline-offset-2 hover:opacity-80',
                    rel:    'noopener noreferrer',
                    target: '_blank',
                },
            }),
        ],
        content:   value,
        editable:  !disabled,
        immediatelyRender: false,  // SSR-safe (Inertia hidrata después)
        onUpdate({ editor }) {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-60 px-4 py-3',
            },
        },
    })

    // Sincroniza si el value externo cambia (ej. reset del formulario tras submit)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value, { emitUpdate: false })
        }
    }, [value, editor])

    const insertarLink = useCallback(() => {
        if (!editor) return
        const prev = editor.getAttributes('link').href as string | undefined
        const url  = window.prompt('URL del enlace:', prev ?? 'https://')
        if (url === null) return  // canceló
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }, [editor])

    if (!editor) return null

    return (
        <div className={cn('border border-slate-200 rounded-lg bg-white overflow-hidden', disabled && 'opacity-60', className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-2 py-1.5 border-b border-slate-100 flex-wrap">
                <ToolbarButton
                    label="Negrita"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                >
                    <BoldIcon className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton
                    label="Cursiva"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                >
                    <ItalicIcon className="size-3.5" />
                </ToolbarButton>

                <span className="w-px h-4 bg-slate-200 mx-1" />

                <ToolbarButton
                    label="Encabezado 2"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive('heading', { level: 2 })}
                >
                    <Heading2Icon className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton
                    label="Encabezado 3"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive('heading', { level: 3 })}
                >
                    <Heading3Icon className="size-3.5" />
                </ToolbarButton>

                <span className="w-px h-4 bg-slate-200 mx-1" />

                <ToolbarButton
                    label="Lista con viñetas"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                >
                    <ListIcon className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton
                    label="Lista numerada"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                >
                    <ListOrderedIcon className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton
                    label="Cita"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                >
                    <QuoteIcon className="size-3.5" />
                </ToolbarButton>

                <span className="w-px h-4 bg-slate-200 mx-1" />

                <ToolbarButton label="Insertar enlace" onClick={insertarLink} active={editor.isActive('link')}>
                    <LinkIcon className="size-3.5" />
                </ToolbarButton>

                <span className="w-px h-4 bg-slate-200 mx-1" />

                <ToolbarButton
                    label="Deshacer"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <UndoIcon className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton
                    label="Rehacer"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <RedoIcon className="size-3.5" />
                </ToolbarButton>
            </div>

            {/* Área editable */}
            <EditorContent editor={editor} data-placeholder={placeholder} />
        </div>
    )
}
