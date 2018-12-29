import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const USER_QUERY = gql`
  query {
    me {
      id
      providerId
      displayName
      picture
    }
  }
`;

const User = props => (
  <Query {...props} query={USER_QUERY}>
    {payload => props.children(payload)}
  </Query>
);

export default User;
