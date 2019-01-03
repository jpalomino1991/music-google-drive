const { google } = require('googleapis');

const fetchFiles = require('./fetchFiles');
const processMetadata = require('./processMetadata');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

module.exports = async ({ folderDriveId, folderId, refreshToken }) => {
  try {
    const { tokens } = await oauth2Client.refreshToken(refreshToken);
    oauth2Client.setCredentials(tokens);
    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client
    });
    const counts = await fetchFiles({
      driveClient: drive,
      folderId,
      folderDriveId
    });
    console.log('end fetch');
    await processMetadata({
      driveClient: drive,
      folderId,
      folderDriveId,
      counts
      //counts: {
      //folders: 880,
      //files: 6317
      //}
    });
  } catch (e) {
    console.log('err', e);
  }
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
