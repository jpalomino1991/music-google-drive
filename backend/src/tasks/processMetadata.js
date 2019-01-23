const fs = require('fs');
const util = require('util');
const LineReader = require('line-by-line');
const Promise = require('bluebird');

const utils = require('../utils');
const drive = require('./drive');
const fileWriteStream = require('./fileWriteStream');
const extractMetadata = require('./extractMetadata');
const db = require('../db');

const BLOCK_SIZE = 2000;

const unlink = util.promisify(fs.unlink);

const processFile = async (errorStream, driveClient, song) => {
  const { id, parent, name } = song;
  const path = `./src/temp/${id}.${song.fileExtension}`;
  try {
    await drive.createPartialFile({
      driveClient,
      fileId: id,
      path
    });

    const tags = await extractMetadata({
      path,
      song
    });

    await unlink(path);

    return tags;
    console.log('-----------', name);
  } catch (e) {
    fs.unlink(path, err => {});
    console.log('ERROR ---', name, id, e);
    errorStream.write({ ...song });
    return null;
  }
};

const MAX_LINES = 10;

const updateState = async ({ counts, processedSongs, newStateId }) =>
  db.mutation.updateState({
    data: {
      extraData: {
        total: counts.files,
        processed: processedSongs
      }
    },
    where: {
      id: newStateId
    }
  });

const startProcess = async ({
  refreshToken,
  folderDriveId,
  folderId,
  counts,
  newStateId,
  start = 0,
  end,
  previousProcessedSongs = 0
}) => {
  const driveClient = await drive.createClient(refreshToken);
  const errorStream = fileWriteStream(`./src/temp/error_${folderDriveId}`);

  const lineReader = new LineReader(`./src/temp/songs_${folderDriveId}`);
  let songs = [];
  let lines = -1;
  let processedSongs = previousProcessedSongs;
  lineReader.on('line', async line => {
    lines++;
    if (lines < start || lines > end) {
      return;
    }
    songs.push(line);
    if (songs.length === MAX_LINES) {
      lineReader.pause();
      const tags = (await Promise.all(
        songs.map(
          async song =>
            await processFile(errorStream, driveClient, JSON.parse(song))
        )
      )).filter(t => t);
      processedSongs += tags.length; //MAX_LINES;
      await updateState({
        counts,
        processedSongs,
        newStateId
      });

      songs = [];
      await utils.sleep(1500);
      lineReader.resume();
    }
  });
  return new Promise(resolve => {
    lineReader.on('end', async () => {
      if (songs.length) {
        const tags = await Promise.all(
          songs.map(
            async song =>
              await processFile(errorStream, driveClient, JSON.parse(song))
          )
        );
        console.log(tags);
      }
      processedSongs += songs.length;
      await updateState({
        counts,
        processedSongs,
        newStateId
      });
      errorStream.end();
      console.log('close file');
      resolve();
    });
  });
};

const generateRange = (end, blockSize) => {
  let pastEnd = 0;
  const ranges = [];
  while (pastEnd < end) {
    ranges.push({
      start: pastEnd,
      end: pastEnd + blockSize
    });
    pastEnd += blockSize + 1;
  }
  return ranges;
};

module.exports = async ({ refreshToken, folderId, folderDriveId, counts }) => {
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
  const ranges = generateRange(counts.files, BLOCK_SIZE);
  await Promise.each(ranges, ({ start, end }, i) =>
    startProcess({
      refreshToken,
      folderDriveId,
      folderId,
      counts,
      newStateId: newState.id,
      start,
      end,
      previousProcessedSongs: i * BLOCK_SIZE
    })
  );
};
