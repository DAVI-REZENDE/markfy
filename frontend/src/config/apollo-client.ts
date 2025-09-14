import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  credentials: 'include', // Incluir cookies nas requisições
  headers: {
    'Content-Type': 'application/json',
  }
})

const authLink = setContext((_, { headers }) => {
  // As credenciais (cookies) são enviadas automaticamente com credentials: 'include'
  // Não precisamos adicionar headers de autorização manualmente
  console.log('Apollo Client - Making request with headers:', headers)
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
      
      // Se for erro de autenticação, redirecionar para login
      // O cookie HTTP-only será gerenciado pelo backend
      if (message.includes('Não autenticado') || message.includes('authentication')) {
        if (typeof window !== 'undefined') {
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
    },
  },
})
