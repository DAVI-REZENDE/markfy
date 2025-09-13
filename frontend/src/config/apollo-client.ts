import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  credentials: 'include', // Incluir cookies nas requisições
})

const authLink = setContext((_, { headers }) => {
  // Como o backend prioriza cookies, não precisamos enviar no header
  // O token já está no cookie e será enviado automaticamente
  return {
    headers: {
      ...headers,
    }
  }
})

// Link de erro para lidar com tokens expirados
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
      
      // Se for erro de autenticação, limpar token e redirecionar
      if (message.includes('Unauthorized') || message.includes('authentication')) {
        if (typeof window !== 'undefined') {
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          window.location.href = '/login'
        }
      }
    })
  }

  if (networkError) {
    console.log(`[Network error]: ${networkError}`)
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Configurar políticas de cache para queries de autenticação
          myPosts: {
            merge(existing, incoming) {
              return incoming
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
  },
})
