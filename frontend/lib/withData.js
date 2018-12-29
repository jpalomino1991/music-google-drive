import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';

import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

function createClient({ headers }) {
  return new ApolloClient({
    uri: publicRuntimeConfig.BACKEND_URL,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include'
        },
        headers
      });
    }
  });
}

export default withApollo(createClient);
