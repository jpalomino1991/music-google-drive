import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

const cache = new InMemoryCache();

function createClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_BACKEND_URL,
      credentials: "include"
    }),
    cache
  });
}

const client = createClient();
export default client;
