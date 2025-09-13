import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../core/db'

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      const { user } = context || {}
      if (!user || !user.userId) {
        return null
      }
      
      // Buscar usuário completo do banco de dados
      const fullUser = await prisma.user.findUnique({
        where: { id: user.userId },
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
      
      // Converter createdAt para string
      return {
        ...fullUser,
        createdAt: fullUser.createdAt.toISOString()
      }
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: { name: string; email: string; password: string } }) => {
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

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString()
        },
        token
      }
    },

    login: async (_: any, { input }: { input: { email: string; password: string } }) => {
      const { email, password } = input

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        throw new Error('Credenciais inválidas')
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password)

      if (!isValidPassword) {
        throw new Error('Credenciais inválidas')
      }

      // Gerar JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      )

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString()
        },
        token
      }
    }
  }
}
