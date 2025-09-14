import { gql } from '@apollo/client'

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      createdAt
    }
  }
`

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        name
        email
        createdAt
      }
      success
    }
  }
`

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        name
        email
        createdAt
      }
      success
    }
  }
`

export const LOGOUT = gql`
  mutation Logout {
    logout {
      success
    }
  }
`

export const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: String!) {
    post(slug: $slug) {
      id
      title
      slug
      content
      excerpt
      published
      createdAt
      updatedAt
    }
  }
`

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      slug
      content
      excerpt
      published
    }
  }
`

export const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      title
      slug
      content
      excerpt
      published
    }
  }
`
