import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Redirect } from 'react-router-dom';
import { Flex } from 'rebass';

import FolderPicker from './components/FolderPicker';

const FETCH_FOLDERS = gql`
  query {
    folders {
      id
      folderId
      name
      states(last: 1) {
        status
      }
    }
  }
`;

const isReadyToPlay = status =>
  ['STARTING', 'FETCHING_DRIVE'].indexOf(status) === -1;

const Home = props => {
  return (
    <Query query={FETCH_FOLDERS}>
      {({ loading, data }) => {
        if (loading)
          return (
            <Flex color="text" alignItems="center">
              loading
            </Flex>
          );
        if (!data.folders.length) return <FolderPicker />;
        const folder = data.folders[0];
        if (isReadyToPlay(folder.states[0].status)) {
          return <Redirect to="/player/folders" />;
        }
        return <Flex color="text">wait {folder.name} is loading</Flex>;
      }}
    </Query>
  );
};

export default Home;
