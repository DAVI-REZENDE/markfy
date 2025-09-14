'use client'

import { GET_ME } from '@/lib/queries'
import { useQuery } from '@apollo/client'
import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: User) => void
  logout: () => void
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Query para obter dados do usuário
  const { data: userData, loading: userLoading, error: userError, refetch } = useQuery(GET_ME, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    skip: false // Sempre executar a query
  })

  // Efeito para processar os dados da query
  useEffect(() => {
    console.log('AuthContext effect - userLoading:', userLoading, 'userData:', userData, 'userError:', userError)
    
    if (!userLoading) {
      console.log('GET_ME data:', userData)
      console.log('GET_ME error:', userError)
      
      if (userData?.me) {
        console.log('User authenticated:', userData.me)
        setUser(userData.me)
        setIsAuthenticated(true)
      } else {
        console.log('No user data, setting unauthenticated')
        setUser(null)
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }
  }, [userData, userError, userLoading])

  const login = (userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setIsLoading(false)
    // Limpar cache do Apollo
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  const refetchUser = async () => {
    try {
      const result = await refetch()
      if (result.data?.me) {
        setUser(result.data.me)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refetchUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
