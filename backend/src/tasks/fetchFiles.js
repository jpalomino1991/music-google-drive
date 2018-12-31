const fs = require('fs');
const Promise = require('bluebird');

const db = require('../db');

let writeStream;

const isType = matchType => type => type.indexOf(matchType) > -1;

const isFolder = ({ mimeType }) => isType('folder')(mimeType);

const fetchFolderContent = async (drive, id, pageToken) => {
  const { data } = await drive.files.list({
    q: `'${id}' in parents`,
    includeTeamDriveItems: true,
    supportsTeamDrives: true,
    fields:
      'nextPageToken, files(id, name, kind, folderColorRgb, fileExtension, mimeType, parents)',
    spaces: 'drive',
    pageToken,
    pageSize: 100
  });
  return data;
};

const fetchDrive = async (drive, id, pageToken) => {
  const { token, files = [] } = await fetchFolderContent(drive, id, pageToken);
  if (token) {
    return await fetchDrive(drive, id, token);
  }
  return await Promise.all(
    files.map(async item => {
      const isFolderType = isFolder(item);
      writeStream.write(
        `
				${JSON.stringify({
          ...item,
          type: isFolderType ? 'folder' : 'file'
        })}\n`
      );
      console.log('file', item);
      if (isFolderType) {
        console.log('folder', item);
        return await fetchDrive(drive, item.id);
      }
    })
  );
};

module.exports = async ({ driveClient, userId, folderId }) => {
  writeStream = fs.createWriteStream(`items_${userId}`);
  await fetchDrive(driveClient, folderId);
  writeStream.end();
};
