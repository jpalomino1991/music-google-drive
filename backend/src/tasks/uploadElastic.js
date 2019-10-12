const LineReader = require('line-by-line');
const Promise = require('bluebird');

const fileWriteStream = require('./fileWriteStream');
const elastic = require('./elastic');
const db = require('../db');

const createState = ({ extraData, status, folderId }) =>
  db.mutation.createState({
    data: {
      status,
      extraData,
      folder: {
        connect: {
          id: folderId,
        },
      },
    },
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
  folderDriveId,
}) => {
  const uploadingNewState = await createState({
    extraData: {
      files: 0,
      folders: 0,
    },
    status: 'UPLOADING_ELASTIC',
    folderId,
  });

  const uploadSongStream = fileWriteStream(
    `./src/temp/uploaded_elastic_songs_${folderDriveId}_${providerId}`
  );

  await getLines({
    blockSize: 100,
    filePath: `./src/temp/songs_${folderDriveId}_${providerId}`,
    callback: async songs => {
      const songsParsed = songs.map(JSON.parse);
      const response = await elastic.bulkUploadSongs(songsParsed, providerId);
      response.items.forEach((item, i) => {
        uploadSongStream.write({
          _id: item.index._id,
          ...songsParsed[i],
        });
      });
    },
  });

  uploadSongStream.end();

  await getLines({
    blockSize: 100,
    filePath: `./src/temp/folders_${folderDriveId}_${providerId}`,
    callback: folders => {
      elastic.bulkUploadFolders(folders.map(JSON.parse), providerId);
    },
  });

  return await createState({
    extraData: counts,
    status: 'SONGS_UPLOADED',
    folderId,
  });
};

module.exports = uploadElastic;
