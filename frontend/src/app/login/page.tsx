'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { LOGIN } from '@/lib/queries'
import { useMutation } from '@apollo/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login: authLogin, isAuthenticated, refetchUser } = useAuth()

  const [login] = useMutation(LOGIN)

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data } = await login({
        variables: {
          input: { email, password }
        }
      })

      if (data.login.success) {
        // O cookie HTTP-only já foi definido pelo backend
        // Aguardar o refetch dos dados do usuário
        await refetchUser()
        
        // Redirecionar para dashboard
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const testAuth = async () => {
    try {
      console.log('Testing auth endpoint...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace('/graphql', '')}/test-auth`, {
        credentials: 'include'
      })
      const data = await response.json()
      console.log('Test auth response:', data)
    } catch (error) {
      console.error('Test auth error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <CardTitle className="text-2xl">Entrar no Markfy</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
            <Button type="button" variant="outline" className="w-full mt-2" onClick={testAuth}>
              Testar Auth
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-blue-600 hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Demo:</strong> admin@markfy.com / 123456
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
