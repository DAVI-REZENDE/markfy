import { ApolloServer } from '@apollo/server'
import { fastifyApolloHandler } from '@as-integrations/fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'
import { makeExecutableSchema } from '@graphql-tools/schema'
import Fastify from 'fastify'

// Import schemas and resolvers
import { commentResolvers } from '../modules/comment/comment.resolvers'
import { commentTypeDefs } from '../modules/comment/comment.schema'
import { postResolvers } from '../modules/post/post.resolvers'
import { postTypeDefs } from '../modules/post/post.schema'
import { userResolvers } from '../modules/user/user.resolvers'
import { userTypeDefs } from '../modules/user/user.schema'

const typeDefs = mergeTypeDefs([userTypeDefs, postTypeDefs, commentTypeDefs])
const resolvers = mergeResolvers([userResolvers, postResolvers, commentResolvers])

const schema = makeExecutableSchema({ typeDefs, resolvers })

const server = new ApolloServer({
  schema,
})

const fastify = Fastify({
  logger: true
})

async function start() {
  try {
    // Register plugins
    await fastify.register(cors, {
      origin: ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
    })

    await fastify.register(cookie, {
      secret: process.env.JWT_SECRET || 'default-secret'
    })

    await fastify.register(jwt, {
      secret: process.env.JWT_SECRET || 'default-secret'
    })

    // Authentication middleware
    fastify.addHook('preHandler', async (request, reply) => {
      try {
        // Tentar obter token do cookie primeiro
        let token = request.cookies.token
        
        // Se não tiver no cookie, tentar do header Authorization
        if (!token) {
          const authHeader = request.headers.authorization
          if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7)
          }
        }

        if (token) {
          const decoded = await fastify.jwt.verify(token)
          request.user = decoded
        }
      } catch (err) {
        // Token inválido, continuar sem usuário
      }
    })

    // Start Apollo Server
    await server.start()

    // Register Apollo GraphQL route
    fastify.all('/graphql', fastifyApolloHandler(server, {
      context: async (request) => {
        const user = (request as any).user || null
        return {
          user
        }
      }
    }))

    // Health check endpoint
    fastify.get('/health', async (request, reply) => {
      return { status: 'ok', timestamp: new Date().toISOString() }
    })

    const port = process.env.PORT || 4000
    const host = '0.0.0.0'

    await fastify.listen({ port: Number(port), host })
    console.log(`🚀 Servidor rodando em http://${host}:${port}`)
    console.log(`📊 GraphQL Playground em http://${host}:${port}/graphql`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()