import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../core/db'

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: { user: { userId: string } }) => {
      // console.log('user', context)
      const { user } = context
      if (!user) {
        return null
      }
      
      const fullUser = await prisma.user.findUnique({
        where: { id: context.user.userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      })
      
      if (!fullUser) {
        return null
      }
      
      return {
        ...fullUser,
        createdAt: fullUser.createdAt.toISOString()
      }
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: { name: string; email: string; password: string } }, { reply }: { reply: any }) => {
      const { name, email, password } = input

      // Verificar se usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        throw new Error('Usuário já existe com este email')
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 12)

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      })

      // Gerar JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      )

      // Definir cookie HTTP-only seguro
      reply.setCookie('token', token, {
        httpOnly: true,
        secure: false, // Mudado para false para desenvolvimento local
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        path: '/'
        // Removido domain para desenvolvimento local
      })

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString()
        },
        success: true
      }
    },

    login: async (_: any, { input }: { input: { email: string; password: string } }, { reply }: { reply: any }) => {
      const { email, password } = input

      console.log('LOGIN - Starting login process for:', email)

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        console.log('LOGIN - User not found for email:', email)
        throw new Error('Credenciais inválidas')
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password)

      if (!isValidPassword) {
        console.log('LOGIN - Invalid password for user:', email)
        throw new Error('Credenciais inválidas')
      }

      // Gerar JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      )

      console.log('LOGIN - Token generated:', {
        token: token.substring(0, 20) + '...',
        userId: user.id,
        email: user.email
      })

      // Definir cookie HTTP-only seguro
      reply.setCookie('token', token, {
        httpOnly: true,
        secure: false, // Mudado para false para desenvolvimento local
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        path: '/'
        // Removido domain para desenvolvimento local
      })
      
      console.log('LOGIN - Cookie set successfully')

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString()
        },
        success: true
      }
    },

    logout: async (_: any, __: any, { reply }: { reply: any }) => {
      // Limpar cookie HTTP-only
      reply.clearCookie('token', {
        httpOnly: true,
        secure: false, // Mudado para false para desenvolvimento local
        sameSite: 'lax',
        path: '/'
        // Removido domain para desenvolvimento local
      })

      return {
        success: true
      }
    }
  }
}
