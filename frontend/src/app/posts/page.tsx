'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserButton } from '@/components/user-button'
import { gql, useQuery } from '@apollo/client'
import { ArrowRight, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      slug
      excerpt
      publishedAt
      author {
        name
      }
    }
  }
`

export default function PostsPage() {
  const [posts, setPosts] = useState([])
  const { data, loading, error } = useQuery(GET_POSTS)

  useEffect(() => {
    if (data?.posts) {
      setPosts(data.posts)
    }
  }, [data])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando posts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Erro ao carregar posts
          </h3>
          <p className="text-gray-600 mb-4">
            Não foi possível carregar os posts. Tente novamente.
          </p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
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
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Markfy</span>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Posts</h1>
          <p className="text-gray-600">Explore os últimos posts da comunidade</p>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum post encontrado
              </h3>
              <p className="text-gray-600">
                Ainda não há posts publicados. Seja o primeiro a criar um!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {posts.map((post: any) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">
                        <Link 
                          href={`/posts/${post.slug}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-base mb-4">
                        {post.excerpt || 'Sem resumo disponível'}
                      </CardDescription>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {post.author.name}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(Number(post.publishedAt)).toLocaleDateString('pt-BR')}
                        </div>
                        <Badge variant="secondary">
                          Publicado
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/posts/${post.slug}`}>
                        Ler mais
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
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
