const { google } = require('googleapis');

const db = require('../db');
const drive = require('./drive');
const fetchFiles = require('./fetchFiles');
const processMetadata = require('./processMetadata');

module.exports = async ({
  providerId,
  folderDriveId,
  folderId,
  refreshToken
}) => {
  try {
    const counts = await fetchFiles({
      driveClient: await drive.createClient(refreshToken),
      folderId,
      folderDriveId
    });

    await processMetadata({
      providerId,
      refreshToken,
      folderId,
      folderDriveId,
      counts
    });
  } catch (e) {
    console.log('err', e);
  }
};
