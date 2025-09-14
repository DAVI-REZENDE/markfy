import { ApolloWrapper } from '@/components/apollo-wrapper'
import { AuthProvider } from '@/contexts/AuthContext'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Markfy - Plataforma de Blog Moderna',
  description: 'Crie e compartilhe conteúdo incrível com nossa plataforma de blog moderna',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ApolloWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  )
}