import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { PrivateRoute, FolderPicker } from '../components';

export const FETCH_FOLDER = gql`
  query {
    folders {
      id
      name
      iconUrl
      states(last: 1) {
        status
        id
        extraData
        errorMessage
      }
    }
  }
`;

class Home extends React.Component {
  render() {
    return (
      <PrivateRoute>
        <Query query={FETCH_FOLDER}>
          {({ data, loading, error }) => {
            if (error) return <div>Error has ocurred</div>;
            if (loading) return <div>Loading</div>;
            if (!data.folders.length) {
              return <FolderPicker />;
            }
            console.log(data.folders[0]);
            return <div>already picked a folder</div>;
          }}
        </Query>
      </PrivateRoute>
    );
  }
}

export default Home;
