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
      origin: (origin, callback) => {
        const allowedOrigins = [
          'http://localhost:3000',
          'https://markfy.davirezende.dev',
          'https://markfy-api.davirezende.dev'
        ]
        
        console.log('CORS - Origin received:', origin)
        
        // Permitir requisições sem origin (ex: mobile apps, Postman)
        if (!origin) {
          console.log('CORS - Allowing request without origin')
          return callback(null, true)
        }
        
        if (allowedOrigins.includes(origin)) {
          console.log('CORS - Allowing origin:', origin)
          return callback(null, true)
        }
        
        console.log('CORS - Blocking origin:', origin)
        return callback(new Error('Not allowed by CORS'), false)
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
      exposedHeaders: ['Set-Cookie']
    })

    await fastify.register(cookie, {
      secret: process.env.JWT_SECRET || 'default-secret'
    })

    await fastify.register(jwt, {
      secret: process.env.JWT_SECRET || 'default-secret'
    })

    // Test endpoint para verificar autenticação (antes do middleware)
    fastify.get('/test-auth', async (request, reply) => {
      console.log('TEST-AUTH - Request details:', {
        url: request.url,
        method: request.method,
        headers: request.headers,
        cookies: request.cookies,
        user: (request as any).user
      })
      
      return { 
        authenticated: !!(request as any).user, 
        user: (request as any).user || null,
        cookies: request.cookies,
        cookieHeader: request.headers.cookie,
        allHeaders: request.headers
      }
    })

    // Authentication middleware
    fastify.addHook('preHandler', async (request, reply) => {
      console.log('🔐 AUTH MIDDLEWARE EXECUTED - URL:', request.url, 'METHOD:', request.method)
      
      try {
        console.log('Auth Middleware - Request:', {
          url: request.url,
          method: request.method,
          cookies: request.cookies,
          cookieHeader: request.headers.cookie
        })
        
        // Tentar obter token do cookie
        let token = request.cookies?.token
        console.log('Token from cookie:', token ? 'present' : 'missing')
        
        // Se não tiver no cookie, tentar do header Authorization
        if (!token) {
          const authHeader = request.headers.authorization
          if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7)
            console.log('Token from header:', token ? 'present' : 'missing')
          }
        }

        if (token) {
          console.log('Verifying token...')
          const decoded = await fastify.jwt.verify(token)
          console.log('Token decoded successfully:', decoded)
          request.user = decoded
        } else {
          console.log('No token found')
        }
      } catch (err) {
        console.log('Token verification error:', err)
        // Token inválido, continuar sem usuário
      }
    })

    // Start Apollo Server
    await server.start()

    // Register Apollo GraphQL route
    fastify.all('/graphql', fastifyApolloHandler(server, {
      context: async (request, reply) => {
        console.log('🔐 GRAPHQL CONTEXT - URL:', request.url, 'METHOD:', request.method)
        console.log('GraphQL Context - Request details:', {
          url: request.url,
          method: request.method,
          cookies: request.cookies,
          cookieHeader: request.headers.cookie
        })
        
        // Lógica de autenticação no contexto do GraphQL
        let user = null
        try {
          // Tentar obter token do cookie
          let token = request.cookies?.token
          console.log('GraphQL Context - Token from cookie:', token ? 'present' : 'missing')
          
          // Se não tiver no cookie, tentar do header Authorization
          if (!token) {
            const authHeader = request.headers.authorization
            if (authHeader && authHeader.startsWith('Bearer ')) {
              token = authHeader.substring(7)
              console.log('GraphQL Context - Token from header:', token ? 'present' : 'missing')
            }
          }

          if (token) {
            console.log('GraphQL Context - Verifying token...')
            const decoded = await fastify.jwt.verify(token)
            console.log('GraphQL Context - Token decoded successfully:', decoded)
            user = decoded
          } else {
            console.log('GraphQL Context - No token found')
          }
        } catch (err) {
          console.log('GraphQL Context - Token verification error:', err)
        }
        
        return {
          user,
          reply
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