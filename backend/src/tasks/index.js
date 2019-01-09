const { google } = require('googleapis');

const db = require('../db');
const drive = require('./drive');
const fetchFiles = require('./fetchFiles');
const processMetadata = require('./processMetadata');

module.exports = async ({ folderDriveId, folderId, refreshToken }) => {
  try {
    const counts = await fetchFiles({
      driveClient: await drive.createClient(refreshToken),
      folderId,
      folderDriveId
    });
    const newState = await db.mutation.createState({
      data: {
        status: 'DOWNLOADING',
        extraData: counts,
        folder: {
          connect: {
            id: folderId
          }
        }
      }
    });
    await processMetadata({
      driveClient: await drive.createClient(refreshToken),
      folderId,
      folderDriveId,
      counts,
      newStateId: newState.id,
      start: 0,
      end: 8000
    });
  } catch (e) {
    console.log('err', e);
  }
};
