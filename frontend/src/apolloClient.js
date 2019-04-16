import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import gql from "graphql-tag";
import merge from "lodash.merge";

import * as player from "./resolvers/player";

const cache = new InMemoryCache();

const typeDefs = gql`
  extend type Query {
    playlistQueue: GG!
  }

  extend type GG {
    queue: String!
    currentSong: Int
  }

  extend type Mutation {
    updateQueue(queue: String!): GG
  }
`;

function createClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_BACKEND_URL,
      credentials: "include"
    }),
    cache,
    resolvers: merge(player.resolvers)
  });
}

cache.writeData({
  data: merge(player.defaults)
});

const client = createClient();
export default client;
