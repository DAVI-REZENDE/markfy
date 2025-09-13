'use client'

import { Alert } from '@/components/alert'
import { EditorHeader } from '@/components/editor-header'
import { LoadingSpinner } from '@/components/loading-spinner'
import { useAuth } from '@/hooks/useAuth'
import {
  createContentWithTitle,
  extractContentWithoutTitle,
  extractTitleFromContent
} from '@/lib/editor-utils'
import {
  CREATE_POST,
  GET_POST_BY_SLUG,
  UPDATE_POST
} from '@/lib/queries'
import { useMutation, useQuery } from '@apollo/client'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const Editor = dynamic(() => import('@/lib/editor').then(mod => ({ default: mod.Editor })), {
  ssr: false,
  loading: () => <div className="min-h-[200px] p-4 border rounded-lg flex items-center justify-center text-gray-500">Carregando editor...</div>
})

interface EditPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [slug, setSlug] = useState<string>('')
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug)
    })
  }, [params])

  const { data: postData, loading: postLoading, error: postError } = useQuery(GET_POST_BY_SLUG, {
    variables: { slug },
    skip: !isAuthenticated || !slug,
    onCompleted: (data) => {
      if (data?.post) {
        const post = data.post
        const contentWithTitle = createContentWithTitle(post.title, post.content)
        setContent(contentWithTitle)
      } else {
      }
    },
    onError: (error) => {
      console.error('Query error:', error)
    }
  })

  const [createPost] = useMutation(CREATE_POST)
  const [updatePost] = useMutation(UPDATE_POST)

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

      if (postData?.post) {
        await updatePost({
          variables: { 
            id: postData.post.id, 
            input 
          }
        })
      } else {
        await createPost({
          variables: { input }
        })
      }

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

  if (authLoading || postLoading) {
    return <LoadingSpinner message="Carregando post..." />
  }

  if (postError) {
    console.error('Post error:', postError)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar post</h2>
          <p className="text-gray-600 mb-4">Ocorreu um erro ao carregar o post: {postError.message}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Se não está carregando e não há dados, mostrar post não encontrado
  if (!postLoading && !postData?.post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post não encontrado</h2>
          <p className="text-gray-600 mb-4">O post que você está tentando editar não existe ou você não tem permissão para editá-lo.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
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
