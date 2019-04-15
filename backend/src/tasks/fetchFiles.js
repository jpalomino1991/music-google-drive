const fs = require('fs');
const Promise = require('bluebird');

const drive = require('./drive');
const utils = require('../utils');
const db = require('../db');
const fileWriteStream = require('./fileWriteStream');

const fetchDrive = async (
  { songsStream, foldersStream },
  driveClient,
  id,
  pageToken
) => {
  await utils.sleep(1000);
  const { token, files = [] } = await drive.fetchFolderContent({
    driveClient,
    parentId: id,
    pageToken
  });
  if (token) {
    return await fetchDrive(
      {
        songsStream,
        foldersStream
      },
      driveClient,
      id,
      token
    );
  }
  return await Promise.each(files, async item => {
    const isFolderType = drive.isFolder(item);
    if (isFolderType) {
      foldersStream.write({ ...item, parent: id });
      console.log('folder', item);
      return await fetchDrive(
        {
          songsStream,
          foldersStream
        },
        driveClient,
        item.id
      );
    }
    console.log('file', item);
    songsStream.write({ ...item, parent: id });
  });
};

module.exports = async ({ driveClient, folderDriveId, folderId }) => {
  const songsStream = fileWriteStream(`./src/temp/songs_${folderDriveId}`);
  const foldersStream = fileWriteStream(`./src/temp/folders_${folderDriveId}`);
  const newState = await db.mutation.createState({
    data: {
      status: 'FETCHING_DRIVE',
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
