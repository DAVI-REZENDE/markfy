'use client'

import { GET_ME } from '@/lib/queries'
import { useQuery } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Query para obter dados do usuário
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_ME, {
    skip: !isAuthenticated, // Só executa se estiver autenticado
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network'
  })

  useEffect(() => {
    // Verificar se há token no cookie
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1]
        
        setIsAuthenticated(!!token)
        setIsLoading(false)
      }
    }

    checkAuth()

    // Verificar autenticação quando a página ganha foco
    const handleFocus = () => {
      checkAuth()
    }

    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const login = (token: string) => {
    if (typeof window !== 'undefined') {
      // Salvar token no cookie com configurações de segurança
      document.cookie = `token=${token}; path=/; max-age=604800; secure; samesite=strict`
      setIsAuthenticated(true)
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      // Limpar token do cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      setIsAuthenticated(false)
      router.push('/login')
    }
  }

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]
    }
    return null
  }

  // Tratamento de erro
  useEffect(() => {
    if (userError && isAuthenticated) {
      console.log('Erro na query GET_ME:', userError)
      
      // Se for erro de autenticação, fazer logout
      if (userError.message.includes('Não autenticado')) {
        console.log('Token inválido, fazendo logout...')
        logout()
      }
    }
  }, [userError, isAuthenticated, logout])

  return {
    isAuthenticated,
    isLoading: isLoading || userLoading,
    user: userData?.me as User | undefined,
    login,
    logout,
    getToken
  }
}
