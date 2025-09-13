'use client'

import { Alert } from '@/components/alert'
import { EditorHeader } from '@/components/editor-header'
import { LoadingSpinner } from '@/components/loading-spinner'
import { useAuth } from '@/hooks/useAuth'
import {
  extractContentWithoutTitle,
  extractTitleFromContent
} from '@/lib/editor-utils'
import { CREATE_POST } from '@/lib/queries'
import { useMutation } from '@apollo/client'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const Editor = dynamic(() => import('@/lib/editor').then(mod => ({ default: mod.Editor })), {
  ssr: false,
  loading: () => <div className="min-h-[200px] p-4 border rounded-lg flex items-center justify-center text-gray-500">Carregando editor...</div>
})

export default function EditorPage() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [createPost] = useMutation(CREATE_POST)

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      window.location.href = '/login'
    }
  }, [isAuthenticated, authLoading])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleSave = async (isPublish = false) => {
    const title = extractTitleFromContent(content)
    
    if (!title.trim()) {
      setError('O título (H1) é obrigatório')
      return
    }

    if (!content.trim()) {
      setError('O conteúdo é obrigatório')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const contentWithoutTitle = extractContentWithoutTitle(content)
      const input = {
        title: title.trim(),
        content: contentWithoutTitle.trim(),
        excerpt: null,
        published: isPublish
      }

      await createPost({
        variables: { input }
      })

      if (isPublish) {
        router.push('/dashboard')
      } else {
        setSuccess('Post salvo como rascunho!')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar post')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = () => handleSave(true)

  if (authLoading) {
    return <LoadingSpinner message="Verificando autenticação..." />
  }

  return (
    <div className="min-h-screen bg-white">
      <EditorHeader
        onSave={() => handleSave(false)}
        onPublish={handlePublish}
        isLoading={isLoading}
      />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <Alert 
            message={error} 
            type="error" 
            onClose={() => setError('')} 
          />
        )}

        {success && (
          <Alert 
            message={success} 
            type="success" 
            onClose={() => setSuccess('')} 
          />
        )}

        <div className="prose prose-lg max-w-none">
          <Editor
            content={content}
            onChange={setContent}
            placeholder="Digite o título do seu post aqui..."
            autoFocus={true}
          />
        </div>
      </main>
    </div>
  )
}
