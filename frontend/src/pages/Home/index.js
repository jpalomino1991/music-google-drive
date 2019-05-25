import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Redirect } from "react-router-dom";

import FolderPicker from "./components/FolderPicker";

//TODO: add query get only one folder: 'query folder'
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
        const currentStatus = folder.states[0].status;
        if (currentStatus === "SONGS_UPLOADED") {
          return <Redirect to={`/player/${folder.folderId}`} />;
        }
        return <div>wait {folder.name} is loading</div>;
      }}
    </Query>
  );
};

export default Home;
