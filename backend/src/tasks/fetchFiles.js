const fs = require('fs');
const Promise = require('bluebird');

const db = require('../db');
const fileWriteStream = require('./fileWriteStream');

const isType = matchType => type => type.indexOf(matchType) > -1;

const isFolder = ({ mimeType }) => isType('folder')(mimeType);

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}

const fetchFolderContent = async (drive, id, pageToken) => {
  await sleep(1000);
  const { data } = await drive.files.list({
    q: `'${id}' in parents`,
    includeTeamDriveItems: true,
    supportsTeamDrives: true,
    fields:
      'nextPageToken, files(id, name, kind, folderColorRgb, fileExtension, mimeType, parents, webContentLink)',
    spaces: 'drive',
    pageToken,
    pageSize: 100
  });
  return data;
};

const fetchDrive = async (
  { songsStream, foldersStream },
  drive,
  id,
  pageToken
) => {
  const { token, files = [] } = await fetchFolderContent(drive, id, pageToken);
  if (token) {
    return await fetchDrive(
      {
        songsStream,
        foldersStream
      },
      drive,
      id,
      token
    );
  }
  return await Promise.each(files, async item => {
    const isFolderType = isFolder(item);
    if (isFolderType) {
      foldersStream.write({ ...item, parent: id });
      console.log('folder', item);
      return await fetchDrive(
        {
          songsStream,
          foldersStream
        },
        drive,
        item.id
      );
    }
    if (['mp3', 'flac'].includes(item.fileExtension)) {
      console.log('file', item);
      songsStream.write({ ...item, parent: id });
    }
  });
};

module.exports = async ({ driveClient, folderDriveId, folderId }) => {
  const songsStream = fileWriteStream(`./src/temp/songs_${folderDriveId}`);
  const foldersStream = fileWriteStream(`./src/temp/folders_${folderDriveId}`);
  const newState = await db.mutation.createState({
    data: {
      status: 'FETCHING',
      folder: {
        connect: {
          id: folderId
        }
      }
    }
  });
  await fetchDrive(
    {
      songsStream,
      foldersStream
    },
    driveClient,
    folderDriveId
  );
  songsStream.end();
  foldersStream.end();
  const counts = {
    folders: foldersStream.lines(),
    files: songsStream.lines()
  };
  await db.mutation.updateState({
    data: {
      extraData: counts
    },
    where: {
      id: newState.id
    }
  });
  return counts;
};
