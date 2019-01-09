import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import GooglePicker from 'react-google-picker';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

var scope = 'https://www.googleapis.com/auth/drive.readonly';

const CREATE_FOLDER = gql`
  mutation createFolder($folderId: String!, $name: String!, $iconUrl: String) {
    createFolder(folderId: $folderId, name: $name, iconUrl: $iconUrl) {
      id
      name
    }
  }
`;

class FolderPicker extends React.Component {
  onCallback = createFolder => data => {
    if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
      const { id, name, lastEditedUtc, iconUrl } = data[
        google.picker.Response.DOCUMENTS
      ][0];
      createFolder({
        variables: {
          folderId: id,
          name,
          iconUrl
        }
      });
    }
  };
  render() {
    return (
      <Mutation mutation={CREATE_FOLDER}>
        {(createFolder, { data, loading, error }) => {
          if (data) return <div>Success come back later</div>;
          if (loading) return <div>loading</div>;
          if (error)
            return (
              <div>
                {error.graphQLErrors
                  ? error.graphQLErrors[0].message
                  : error.message}
              </div>
            );
          return (
            <div>
              <GooglePicker
                clientId={publicRuntimeConfig.GOOGLE_CLIENT_ID}
                scope={[scope]}
                onAuthenticate={token => console.log('oauth token:', token)}
                onAuthFailed={data => console.log('on auth failed:', data)}
                createPicker={(google, oauthToken) => {
                  const googleViewId = google.picker.ViewId.FOLDERS;
                  const docsView = new google.picker.DocsView(googleViewId)
                    .setIncludeFolders(true)
                    .setMimeTypes('application/vnd.google-apps.folder')
                    .setSelectFolderEnabled(true);

                  const picker = new window.google.picker.PickerBuilder()
                    .addView(docsView)
                    .setOAuthToken(oauthToken)
                    .setDeveloperKey(publicRuntimeConfig.GOOGLE_DEVELOPER_KEY)
                    .setCallback(this.onCallback(createFolder));

                  picker.build().setVisible(true);
                }}
              >
                <button>Pick a folder</button>
              </GooglePicker>
            </div>
          );
        }}
      </Mutation>
    );
  }
}

export default FolderPicker;
