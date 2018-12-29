import React from 'react';
import GooglePicker from 'react-google-picker';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

var scope = 'https://www.googleapis.com/auth/drive.readonly';

class Home extends React.Component {
  componentDidMount() {
    console.log('hit api');
    fetch('http://localhost:3001/ggwp', {
      credentials: 'include'
    })
      .then(res => {
        return res.json();
      })
      .then(a => console.log(a));
  }
  onCallback = data => {
    if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
      const {
        id,
        name,
        lastEditedUtc, //1544309882152
        iconUrl
      } = data[google.picker.Response.DOCUMENTS][0];
      //const url = doc[google.picker.Document.URL];
      console.log('picked', id);
    }
  };
  render() {
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
              //.setIncludeFolders(true)
              //.setMimeTypes('application/vnd.google-apps.folder')
              .setSelectFolderEnabled(true);

            const picker = new window.google.picker.PickerBuilder()
              .addView(docsView)
              .setOAuthToken(oauthToken)
              .setDeveloperKey(publicRuntimeConfig.GOOGLE_DEVELOPER_KEY)
              .setCallback(this.onCallback);

            picker.build().setVisible(true);
          }}
        >
          <span>Click</span>
          <div className="google" />
        </GooglePicker>
      </div>
    );
  }
}

export default Home;
