'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserButton } from '@/components/user-button'
import { useAuth } from '@/contexts/AuthContext'
import { gql, useMutation, useQuery } from '@apollo/client'
import { ArrowLeft, Calendar, MessageSquare, User } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

const GET_POST = gql`
  query GetPost($slug: String!) {
    post(slug: $slug) {
      id
      title
      content
      publishedAt
      author {
        name
      }
      comments {
        id
        content
        createdAt
        author {
          name
        }
      }
    }
  }
`

const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      content
      author {
        name
      }
    }
  }
`

export default function PostPage() {
  const params = useParams()
  const slug = params.slug as string
  const [comment, setComment] = useState('')
  const { isAuthenticated } = useAuth()
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const { data, loading, error, refetch } = useQuery(GET_POST, {
    variables: { slug }
  })
  const [createComment] = useMutation(CREATE_COMMENT)

  const post = data?.post

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !post) return

    setIsSubmittingComment(true)
    try {
      await createComment({
        variables: {
          input: {
            postId: post.id,
            content: comment.trim()
          }
        }
      })
      setComment('')
      refetch()
    } catch (error) {
      console.error('Erro ao criar comentário:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando post...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Post não encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            O post que você está procurando não existe ou foi removido.
          </p>
          <Button asChild>
            <Link href="/posts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos posts
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/posts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Markfy</span>
            </div>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Início
            </Link>
            <Link href="/posts" className="text-blue-600 font-medium">
              Posts
            </Link>
            <UserButton />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          {/* Post Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600 mb-6">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                {post.author.name}
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {new Date(Number(post.publishedAt)).toLocaleDateString('pt-BR')}
              </div>
              <Badge variant="secondary">
                Publicado
              </Badge>
            </div>
          </div>

          {/* Post Content */}
          <div 
            className="tiptap max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Comments Section */}
          <div className="border-t pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <MessageSquare className="h-6 w-6 mr-2" />
              Comentários ({post.comments.length})
            </h3>

            {/* Comment Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Deixe um comentário</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Escreva seu comentário..."
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={4}
                    required
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmittingComment || !comment.trim()}
                  >
                    {isSubmittingComment ? 'Enviando...' : 'Enviar comentário'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Comments List */}
            <div className="space-y-4">
              {post.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </p>
              ) : (
                post.comments.map((comment: any) => (
                  <Card key={comment.id}>
                    <CardContent>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-gray-900">
                              {comment.author.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(Number(comment.createdAt)).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-gray-700">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>© 2024 Markfy. Feito com ❤️ para criadores de conteúdo.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
