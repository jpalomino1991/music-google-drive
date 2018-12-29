import React from 'react';
import GooglePicker from 'react-google-picker';

var developerKey = 'AIzaSyD4HA1iofTL6QS2dxi444myJWvzyp-ex9Y';
var clientId =
  '582939706884-6p046rp6aaetu126sa6i9luro0ihsmt6.apps.googleusercontent.com';
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
          clientId={clientId}
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
              .setDeveloperKey(developerKey)
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
