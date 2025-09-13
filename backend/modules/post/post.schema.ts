export const postTypeDefs = `
  type Post {
    id: ID!
    title: String!
    slug: String!
    content: String!
    excerpt: String
    published: Boolean!
    publishedAt: String
    createdAt: String!
    updatedAt: String!
    author: User!
    comments: [Comment!]!
  }

  input CreatePostInput {
    title: String!
    content: String!
    excerpt: String
    published: Boolean
  }

  input UpdatePostInput {
    title: String
    content: String
    excerpt: String
    published: Boolean
  }

  type DeletePostPayload {
    success: Boolean!
  }

  extend type Query {
    posts: [Post!]!
    post(slug: String!): Post
    myPosts: [Post!]!
  }

  extend type Mutation {
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): DeletePostPayload!
  }
`
