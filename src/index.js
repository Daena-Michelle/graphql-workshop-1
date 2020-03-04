import { GraphQLServer } from "graphql-yoga";
import gql from "graphql-tag";

import db from "./db";

const typeDefs = gql`
  type Query {
    users: [User!]!
    posts: [Post!]!
  }

  type Mutation {
    createUser(data: CreateUserInput!): User!
    createPost(data: CreatePostInput!): Post!
    createComment(data: CreateCommentInput!): Comment!
  }

  input CreateUserInput {
    name: String!
    email: String!
    age: Int
    id: ID!
  }

  input CreatePostInput {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: ID!
  }

  input CreateCommentInput {
    id: ID!
    text: String!
    post: ID!
    author: ID!
  }

  type User {
    name: String!
    email: String!
    age: Int
    id: ID!
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Post {
    title: String!
    body: String!
    id: ID!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    post: Post!
    author: User!
  }
`;

const resolvers = {
  Query: {
    users() {
      return db.users;
    },

    posts() {
      return db.posts;
    }
  },

  Mutation: {
    createUser(_, { data }) {
      const newUser = {
        id: data.id,
        name: data.name,
        age: data.age,
        email: data.email
      };
      db.users.push(newUser);
      return newUser;
    },
    createPost(_, { data }) {
      try {
        const author = db.users.find(user => user.id === data.author);
        if (!author) {
          throw new Error(`No user found for ID ${data.author}`);
        }
        const newPost = {
          id: data.id,
          title: data.title,
          body: data.body,
          published: data.published,
          author: data.author
        };
        db.posts.push(newPost);
        return newPost;
      } catch (err) {
        console.log(err);
      }
    },
    createComment(_, { data }) {
      const author = db.users.find(user => user.id === data.author);
      if (!author) {
        throw new Error(`No user found for ID ${data.author}`);
      }
      const post = db.posts.find(post => post.id === data.post);
      if (!post) {
        throw new Error(`No post found for ID ${data.post}`);
      }
      const newComment = {
        id: data.id,
        text: data.text,
        post: data.post,
        author: data.author
      };
      db.comments.push(newComment);
      return newComment;
    }
  },

  User: {
    posts(user) {
      return db.posts.filter(post => post.author === user.id);
    },
    comments(user) {
      return db.comments.filter(comment => comment.author === user.id);
    }
  },

  Post: {
    author(post) {
      return db.users.find(user => user.id === post.author);
    },
    comments(post) {
      return db.comments.filter(comment => comment.post === post.id);
    }
  },

  Comment: {
    post(comment) {
      return db.posts.find(post => post.id === comment.post);
    },
    author(comment) {
      return db.users.find(user => user.id === comment.author);
    }
  }
};

const server = new GraphQLServer({
  typeDefs,
  resolvers
});

server.start(() => {
  console.log("The server is up!");
});
