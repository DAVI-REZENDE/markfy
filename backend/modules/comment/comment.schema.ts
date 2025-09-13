export const commentTypeDefs = `
  type Comment {
    id: ID!
    content: String!
    createdAt: String!
    updatedAt: String!
    author: User!
    post: Post!
  }

  input CreateCommentInput {
    postId: ID!
    content: String!
  }

  extend type Mutation {
    createComment(input: CreateCommentInput!): Comment!
  }
`
