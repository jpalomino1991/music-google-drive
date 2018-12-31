const { google } = require('googleapis');

const fetchFiles = require('./fetchFiles');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

module.exports = async () => {
  //TODO get refresh token from db
  const { tokens } = await oauth2Client.refreshToken(
    //'1/kHF4ZA0PtfwNoKccFniwXywtmphk0qUog8Sfo1xWcTU'
    '1/SHOcRlwpR0sk6-W_c_dT74kxqqVo6Zsp-9-esdU-cz4'
  );
  oauth2Client.setCredentials(tokens);
  //const plus = google.plus({
  //version: 'v1',
  //auth: oauth2Client
  //});
  const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
  });
  await fetchFiles({
    driveClient: drive,
    folderId: '1hGQ0slskFhbourYzt1q052vVuH5wKvpR'
  });
  //const gg = await plus.people.get({ userId: 'me' });
  //console.log('gg', gg.data);
  //fetch files and folders in txt items_USERID
  // -> start: update to fetching
  // -> ongoing: update total and fetched (files and folders)
  //extract metadadata from txt items_USERID
  // -> start: update to processing set total files
  // ongoing: update proessing files
  // -> on finish: upload to elastic, delete file, update state to DONE
};
