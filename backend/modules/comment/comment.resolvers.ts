import { prisma } from '../../core/db'

export const commentResolvers = {
  Mutation: {
    createComment: async (_: any, { input }: { input: any }, { user }: { user: { userId: string } }) => {
      if (!user) {
        throw new Error('Não autenticado')
      }

      const { postId, content } = input

      // Verificar se o post existe
      const post = await prisma.post.findUnique({
        where: { id: postId }
      })

      if (!post) {
        throw new Error('Post não encontrado')
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          authorId: user.userId,
          postId
        },
        include: {
          author: {
            select: {
              id: true,
              name: true
            }
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        }
      })

      return comment
    }
  }
}
