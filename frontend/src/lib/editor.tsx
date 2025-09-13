'use client'

import { Button } from '@/components/ui/button'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { TableKit } from '@tiptap/extension-table'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'
import { useEffect } from 'react'

import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon
} from 'lucide-react'

interface EditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export function Editor({ content = '', onChange, placeholder = 'Comece a escrever...', autoFocus = false }: EditorProps) {
  const lowlight = createLowlight(common)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          HTMLAttributes: {
            class: 'font-bold text-foreground text-3xl mb-6 mt-0',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-primary pl-4 py-2 italic text-muted-foreground bg-muted/30 rounded-r',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'bg-muted px-2 py-1 rounded text-sm font-mono text-foreground',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-muted p-4 rounded-lg overflow-x-auto',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-6 mb-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-6 mb-4',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'mb-2',
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4 leading-relaxed',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:text-primary/80 underline underline-offset-2 transition-colors',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-sm border border-border',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TableKit.configure({
        table: {
          resizable: true,
          HTMLAttributes: {
            class: 'w-full border-collapse border border-border rounded-lg overflow-hidden mb-4',
          },
        },
        tableRow: {
          HTMLAttributes: {
            class: 'border border-border',
          },
        },
        tableHeader: {
          HTMLAttributes: {
            class: 'border border-border px-4 py-2 text-left bg-muted font-semibold',
          },
        },
        tableCell: {
          HTMLAttributes: {
            class: 'border border-border px-4 py-2 text-left',
          },
        },
      }),
    ],
    content: content || '<h1></h1>',
    immediatelyRender: false,
    autofocus: autoFocus,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    onCreate: ({ editor }) => {
      if (!content && autoFocus) {
        editor.commands.focus('start')
      }
    },
    editorProps: {
      attributes: {
        class: 'editor-content focus:outline-none min-h-[400px] p-6',
      },
    },
  })

  // Atualizar o editor quando o conteúdo mudar
  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = window.prompt('URL da imagem:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const url = window.prompt('URL do link:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 p-3 flex flex-wrap gap-1 mb-4">
        <Button
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('blockquote') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          variant={editor.isActive('code') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={addLink}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={addImage}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={addTable}
        >
          <TableIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="min-h-[400px] p-6 focus-within:outline-none"
        placeholder={placeholder}
      />
    </div>
  )
}
