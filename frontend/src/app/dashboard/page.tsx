'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserButton } from '@/components/user-button'
import { useAuth } from '@/contexts/AuthContext'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Calendar, Edit, Eye, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const GET_MY_POSTS = gql`
  query GetMyPosts {
    myPosts {
      id
      title
      slug
      excerpt
      published
      publishedAt
      createdAt
      updatedAt
    }
  }
`

const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id) {
      success
    }
  }
`

export default function DashboardPage() {
  const [posts, setPosts] = useState([])
  const { data, loading, refetch } = useQuery(GET_MY_POSTS)
  const [deletePost] = useMutation(DELETE_POST)
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (data?.myPosts) {
      setPosts(data.myPosts)
    }
  }, [data])

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      window.location.href = '/login'
    }
  }, [isAuthenticated, authLoading])

  const handleDeletePost = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este post?')) {
      try {
        await deletePost({ variables: { id } })
        refetch()
      } catch (error) {
        console.error('Erro ao excluir post:', error)
      }
    }
  }

  console.log(posts);
  

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Verificando autenticação...' : 'Carregando posts...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Markfy</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild>
              <Link href="/dashboard/editor">
                <Plus className="h-4 w-4 mr-2" />
                Novo Post
              </Link>
            </Button>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Posts</h1>
          <p className="text-gray-600">Gerencie seus posts e conteúdo</p>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum post encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                Comece criando seu primeiro post
              </p>
              <Button asChild>
                <Link href="/dashboard/editor">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Post
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {posts.map((post: any) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                      <CardDescription className="mb-4">
                        {post.excerpt || 'Sem resumo disponível'}
                      </CardDescription>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(Number(post.createdAt)).toLocaleDateString('pt-BR')}
                        </div>
                        <Badge variant={post.published ? 'default' : 'secondary'}>
                          {post.published ? 'Publicado' : 'Rascunho'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/posts/${post.slug}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/editor/${post.slug}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
