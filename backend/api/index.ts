import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { NextRequest } from 'next/server'

// Import schemas and resolvers
import { commentResolvers } from '../../modules/comment/comment.resolvers'
import { commentTypeDefs } from '../../modules/comment/comment.schema'
import { postResolvers } from '../../modules/post/post.resolvers'
import { postTypeDefs } from '../../modules/post/post.schema'
import { userResolvers } from '../../modules/user/user.resolvers'
import { userTypeDefs } from '../../modules/user/user.schema'

const typeDefs = mergeTypeDefs([userTypeDefs, postTypeDefs, commentTypeDefs])
const resolvers = mergeResolvers([userResolvers, postResolvers, commentResolvers])

const schema = makeExecutableSchema({ typeDefs, resolvers })

const server = new ApolloServer({
  schema,
  introspection: true,
  plugins: [
    // Plugin para logging
    {
      requestDidStart() {
        return {
          willSendResponse(requestContext) {
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

const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    // Aqui você pode adicionar lógica de autenticação
    // Por enquanto, retornamos um contexto vazio
    return {
      user: null
    }
  }
})

export { handler as GET, handler as POST }
