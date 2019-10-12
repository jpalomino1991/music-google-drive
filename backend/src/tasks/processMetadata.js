const LineReader = require('line-by-line');

const metadataProcessQueue = require('./queue');
const db = require('../db');

module.exports = async ({
  providerId,
  refreshToken,
  folderId,
  folderDriveId,
  counts,
}) => {
  const newState = await db.mutation.createState({
    data: {
      status: 'DOWNLOADING',
      extraData: {
        counts: 0,
      },
      folder: {
        connect: {
          id: folderId,
        },
      },
    },
  });
  const lineReader = new LineReader(
    `./src/temp/uploaded_elastic_songs_${folderDriveId}_${providerId}`
  );

  let lineCount = 0;

  lineReader.on('line', async line => {
    metadataProcessQueue.add({
      song: JSON.parse(line),
      refreshToken,
      folderDriveId,
      stateId: newState.id,
    });
    lineCount++;
  });

  lineReader.on('end', () => {
    console.log('END LINES PROCESSED', lineCount);
  });
};
