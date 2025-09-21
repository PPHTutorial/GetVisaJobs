'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { useEffect, useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Link as LinkIcon,
    Image as ImageIcon,
    Table as TableIcon,
    Palette,
} from 'lucide-react'

interface RichTextEditorProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    className?: string
    maxLength?: number
    showToolbar?: boolean
    height?: string
    disabled?: boolean
}

export function RichTextEditor({
    value = '',
    onChange,
    placeholder = 'Start writing...',
    className,
    maxLength = 1000,
    showToolbar = true,
    height = '40px',
    disabled = false,
}: RichTextEditorProps) {
    const [isToolbarOpen, setIsToolbarOpen] = useState(false)
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === 'heading') {
                        return 'Heading...'
                    }
                    return placeholder || 'Start writing...'
                },
                emptyNodeClass: 'is-editor-empty',
            }),
            CharacterCount.configure({
                limit: maxLength,
            }),
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto',
                },
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            onChange?.(html)
        },
        editable: !disabled,
        immediatelyRender: false,
    })

    // Update editor content when value prop changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value)
        }
    }, [editor, value])

    const addLink = useCallback(() => {
        if (!editor) return

        const url = window.prompt('Enter URL:')
        if (url) {
            editor.chain().focus().setLink({ href: url }).run()
        }
    }, [editor])

    const addImage = useCallback(() => {
        if (!editor) return

        const url = window.prompt('Enter image URL:')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }, [editor])

    const addTable = useCallback(() => {
        if (!editor) return

        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }, [editor])

    if (!editor) {
        return (
            <div className={cn('border border-input rounded-md p-4 bg-background', className)}>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        )
    }

    return (
        <div className={cn('border border-input rounded-md bg-background', className)}>
            {showToolbar && (
                <div className="border-b border-input p-2 bg-muted/20">
                    <Dialog open={isToolbarOpen} onOpenChange={setIsToolbarOpen}>
                        <DialogTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-max justify-start bg-accent/20 hover:bg-accent/30"
                                disabled={disabled}
                            >
                                <Palette className="h-4 w-4 mr-2" />
                                Formatting Options
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Text Formatting</h3>

                                {/* Text Formatting */}
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant={editor.isActive('bold') ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => editor.chain().focus().toggleBold().run()}
                                        disabled={disabled}
                                    >
                                        <Bold className="h-4 w-4 mr-2" />
                                        Bold
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={editor.isActive('italic') ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => editor.chain().focus().toggleItalic().run()}
                                        disabled={disabled}
                                    >
                                        <Italic className="h-4 w-4 mr-2" />
                                        Italic
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={editor.isActive('strike') ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => editor.chain().focus().toggleStrike().run()}
                                        disabled={disabled}
                                    >
                                        <Strikethrough className="h-4 w-4 mr-2" />
                                        Strikethrough
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={editor.isActive('code') ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => editor.chain().focus().toggleCode().run()}
                                        disabled={disabled}
                                    >
                                        <Code className="h-4 w-4 mr-2" />
                                        Code
                                    </Button>
                                </div>

                                <Separator />

                                {/* Headings */}
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Headings</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                            disabled={disabled}
                                        >
                                            <Heading1 className="h-4 w-4 mr-2" />
                                            H1
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                            disabled={disabled}
                                        >
                                            <Heading2 className="h-4 w-4 mr-2" />
                                            H2
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                            disabled={disabled}
                                        >
                                            <Heading3 className="h-4 w-4 mr-2" />
                                            H3
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                {/* Lists */}
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Lists & Quotes</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant={editor.isActive('bulletList') ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                                            disabled={disabled}
                                        >
                                            <List className="h-4 w-4 mr-2" />
                                            Bullet List
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={editor.isActive('orderedList') ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                            disabled={disabled}
                                        >
                                            <ListOrdered className="h-4 w-4 mr-2" />
                                            Numbered List
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={editor.isActive('blockquote') ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                            disabled={disabled}
                                        >
                                            <Quote className="h-4 w-4 mr-2" />
                                            Quote
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                {/* Text Alignment */}
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Text Alignment</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                            disabled={disabled}
                                        >
                                            <AlignLeft className="h-4 w-4 mr-2" />
                                            Left
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                            disabled={disabled}
                                        >
                                            <AlignCenter className="h-4 w-4 mr-2" />
                                            Center
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                            disabled={disabled}
                                        >
                                            <AlignRight className="h-4 w-4 mr-2" />
                                            Right
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                                            disabled={disabled}
                                        >
                                            <AlignJustify className="h-4 w-4 mr-2" />
                                            Justify
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                {/* Advanced Features */}
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Advanced Features</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addLink}
                                            disabled={disabled}
                                        >
                                            <LinkIcon className="h-4 w-4 mr-2" />
                                            Add Link
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addImage}
                                            disabled={disabled}
                                        >
                                            <ImageIcon className="h-4 w-4 mr-2" />
                                            Add Image
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addTable}
                                            disabled={disabled}
                                        >
                                            <TableIcon className="h-4 w-4 mr-2" />
                                            Add Table
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                {/* Undo/Redo */}
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Actions</h4>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => editor.chain().focus().undo().run()}
                                            disabled={!editor.can().undo() || disabled}
                                        >
                                            <Undo className="h-4 w-4 mr-2" />
                                            Undo
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => editor.chain().focus().redo().run()}
                                            disabled={!editor.can().redo() || disabled}
                                        >
                                            <Redo className="h-4 w-4 mr-2" />
                                            Redo
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            <div className="p-4">
                <EditorContent
                    editor={editor}
                    
                    className={cn(
                        'prose prose-sm max-w-none focus:outline-none',
                        'prose-headings:font-semibold prose-headings:text-gray-900',
                        'prose-p:text-gray-700 prose-p:leading-relaxed',
                        'prose-strong:text-gray-900 prose-strong:font-semibold',
                        'prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
                        'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic',
                        'prose-li:text-gray-700',
                        'prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800',
                        'prose-img:rounded-lg prose-img:shadow-sm',
                        'prose-table:border-collapse prose-table:border prose-table:border-gray-300',
                        'prose-th:bg-gray-50 prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-th:text-left',
                        'prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2',
                        '[&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:text-gray-900',
                        '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
                        '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400',
                        '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
                        '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none',
                        '[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
                        // List styling
                        '[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:space-y-1',
                        '[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:space-y-1',
                        '[&_.ProseMirror_li]:text-gray-700 [&_.ProseMirror_li]:leading-relaxed',
                        '[&_.ProseMirror_ul_li]:marker:text-gray-500',
                        '[&_.ProseMirror_ol_li]:marker:text-gray-500'
                    )}
                    style={{ minHeight: 100 }}
                />

                {maxLength && (
                    <div className="mt-2 text-xs text-gray-500 text-right">
                        {editor.storage.characterCount.characters()}/{maxLength} characters
                    </div>
                )}
            </div>
        </div>
    )
}