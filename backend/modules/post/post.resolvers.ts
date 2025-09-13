import { prisma } from '../../core/db'

export const postResolvers = {
  Query: {
    posts: async () => {
      return await prisma.post.findMany({
        where: { published: true },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    },

    post: async (_: any, { slug }: { slug: string }) => {
      return await prisma.post.findUnique({
        where: { slug },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        }
      })
    },

    myPosts: async (_: any, __: any, { user }: { user: { userId: string } }) => {
      if (!user) {
        throw new Error('Não autenticado')
      }

      return await prisma.post.findMany({
        where: { authorId: user.userId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }
  },

  Mutation: {
    createPost: async (
      _: any,
      { input }: { input: any },
      { user }: { user: { userId: string; email: string } }
    ) => {
      if (!user) {
        throw new Error('Não autenticado')
      }

      const { title, content, excerpt, published } = input
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const post = await prisma.post.create({
        data: {
          title,
          slug,
          content,
          excerpt,
          published: published || false,
          publishedAt: published ? new Date() : null,
          authorId: user.userId
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return post
    },

    updatePost: async (_: any, { id, input }: { id: string; input: any }, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Não autenticado')
      }

      // Verificar se o post pertence ao usuário
      const existingPost = await prisma.post.findFirst({
        where: { id, authorId: user.id }
      })

      if (!existingPost) {
        throw new Error('Post não encontrado ou não autorizado')
      }

      const { title, content, excerpt, published } = input
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const post = await prisma.post.update({
        where: { id },
        data: {
          title,
          slug,
          content,
          excerpt,
          published: published || false,
          publishedAt: published && !existingPost.published ? new Date() : existingPost.publishedAt
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return post
    },

    deletePost: async (_: any, { id }: { id: string }, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Não autenticado')
      }

      // Verificar se o post pertence ao usuário
      const existingPost = await prisma.post.findFirst({
        where: { id, authorId: user.id }
      })

      if (!existingPost) {
        throw new Error('Post não encontrado ou não autorizado')
      }

      await prisma.post.delete({
        where: { id }
      })

      return { success: true }
    }
  }
}
