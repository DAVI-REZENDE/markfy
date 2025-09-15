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
  introspection: true,
  plugins: [
    // Plugin para logging
    {
      async requestDidStart() {
        return {
          async willSendResponse(requestContext) {
            console.log('GraphQL Request:', {
              query: requestContext.request.query,
              variables: requestContext.request.variables,
              operationName: requestContext.request.operationName
            })
          }
        }
      }
    }
  ]
})

let fastifyInstance: any = null

async function createFastifyInstance() {
  if (fastifyInstance) {
    return fastifyInstance
  }

  const fastify = Fastify({
    logger: true
  })

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

    // Configurar parsing de JSON
    fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
      console.log('Content-Type:', req.headers['content-type'])
      console.log('Body type:', typeof body)
      console.log('Body preview:', body?.toString().substring(0, 100))
      
      try {
        const json = JSON.parse(body as string)
        console.log('Parsed JSON successfully')
        done(null, json)
      } catch (err) {
        console.error('JSON parse error:', err)
        done(err as Error, undefined)
      }
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
        const user = (request as any).user || null
        console.log('GraphQL Context - User:', user)
        console.log('GraphQL Context - Request cookies:', request.cookies)
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


    // API routes
    fastify.get('/api/*', async (request, reply) => {
      return { message: 'API endpoint' }
    })

    // Catch all for other routes
    fastify.get('/*', async (request, reply) => {
      return { message: 'API endpoint' }
    })

    await fastify.ready()
    fastifyInstance = fastify
    return fastify
  } catch (err) {
    fastify.log.error(err)
    throw err
  }
}

// Export the handler for Vercel
export default async function handler(req: any, res: any) {
  try {
    const app = await createFastifyInstance()
    
    // Log da requisição para debug
    console.log('Vercel Handler - Request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      cookies: req.headers.cookie
    })
    
    // Aguardar o Fastify estar pronto
    await app.ready()
    
    // Usar o método correto do Fastify para Vercel
    const response = await app.inject({
      method: req.method,
      url: req.url,
      headers: req.headers,
      payload: req.body
    })
    
    // Set headers from response
    Object.keys(response.headers).forEach(key => {
      res.setHeader(key, response.headers[key])
    })
    
    // Set status code
    res.statusCode = response.statusCode
    
    // Send response
    res.end(response.payload)
    
  } catch (error) {
    console.error('Vercel Handler Error:', error)
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'Internal Server Error' }))
  }
}
