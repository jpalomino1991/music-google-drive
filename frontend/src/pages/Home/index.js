import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Redirect } from "react-router-dom";

import FolderPicker from "./components/FolderPicker";

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

const Home = props => {
  return (
    <Query query={FETCH_FOLDERS}>
      {({ loading, data }) => {
        if (loading) return <div>loading</div>;
        if (!data.folders.length) return <FolderPicker />;
        const folder = data.folders[0];
        const hasFolderBeingUploaded =
          folder.states[0].status === "SONGS_UPLOADED";
        if (hasFolderBeingUploaded) {
          return <Redirect to={`/player/${folder.folderId}`} />;
        }
        return <div>wait {folder.name} is loading</div>;
      }}
    </Query>
  );
};

export default Home;
