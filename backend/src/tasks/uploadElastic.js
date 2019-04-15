const LineReader = require('line-by-line');
const Promise = require('bluebird');

const elastic = require('./elastic');
const db = require('../db');

const createState = ({ extraData, status, folderId }) =>
  db.mutation.createState({
    data: {
      status,
      extraData,
      folder: {
        connect: {
          id: folderId
        }
      }
    }
  });

const getLines = async ({ blockSize, filePath, callback }) => {
  const lineReader = new LineReader(filePath);

  let lines = [];
  lineReader.on('line', async line => {
    lines.push(line);
    if (lines.length < blockSize) {
      return;
    }
    callback(lines);
    lines = [];
  });
  return new Promise((resolve, reject) => {
    lineReader.on('end', async () => {
      if (lines.length) {
        lineReader.pause();
        await callback(lines);
      }
      resolve();
    });
  });
};

const uploadElastic = async ({
  counts,
  providerId,
  folderId,
  folderDriveId
}) => {
  const uploadingNewState = await createState({
    extraData: {
      files: 0,
      folders: 0
    },
    status: 'UPLOADING_ELASTIC',
    folderId
  });

  await getLines({
    blockSize: 100,
    filePath: `./src/temp/songs_${folderDriveId}`,
    callback: songs => {
      elastic.bulkUploadSongs(songs.map(JSON.parse), providerId);
    }
  });

  await getLines({
    blockSize: 100,
    filePath: `./src/temp/folders_${folderDriveId}`,
    callback: folders => {
      elastic.bulkUploadFolders(folders.map(JSON.parse), providerId);
    }
  });

  return await createState({
    extraData: counts,
    status: 'SONGS_UPLOADED',
    folderId
  });
};

module.exports = uploadElastic;
