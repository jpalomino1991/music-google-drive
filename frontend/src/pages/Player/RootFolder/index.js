import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import ParentFolder from '../components/ParentFolder';
import Items from '../components/Items';

const FETCH_FOLDERS = gql`
  query {
    folders {
      folderId
    }
  }
`;

const RootFolder = () => {
  return (
    <Query query={FETCH_FOLDERS}>
      {({ loading, data }) => {
        if (loading) return 'loading';
        const folderId = data.folders[0].folderId;
        return (
          <>
            <ParentFolder id={folderId} />
            <Items id={folderId} />
          </>
        );
      }}
    </Query>
  );
};

export default RootFolder;
