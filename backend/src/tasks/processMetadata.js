const fs = require('fs');
const util = require('util');
const LineReader = require('line-by-line');
const Promise = require('bluebird');

const utils = require('../utils');
const drive = require('./drive');
const fileWriteStream = require('./fileWriteStream');
const extractMetadata = require('./extractMetadata');
const db = require('../db');
const elastic = require('./elastic');

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

    console.log('-----------', name);
    return tags;
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
  providerId,
  refreshToken,
  folderDriveId,
  folderId,
  counts,
  newStateId,
  start = 0,
  end,
  previousProcessedSongs = 0
}) => {
  try {
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
        const songsWithTags = (await Promise.all(
          songs.map(async song => ({
            file: song,
            tags: await processFile(errorStream, driveClient, JSON.parse(song))
          }))
        )).filter(song => song.tags);
        processedSongs += songsWithTags.length; //MAX_LINES;
        await elastic.bulkUploadSongs(songsWithTags, providerId);
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
          const songsWithTags = (await Promise.all(
            songs.map(async song => ({
              file: song,
              tags: await processFile(
                errorStream,
                driveClient,
                JSON.parse(song)
              )
            }))
          )).filter(song => song.tags);
          processedSongs += songsWithTags.length;
          await elastic.bulkUploadSongs(songsWithTags, providerId);
        }
        processedSongs += songsWithTags.length;
        await updateState({
          counts,
          processedSongs,
          newStateId
        });
        errorStream.end();
        resolve();
      });
    });
  } catch (e) {
    console.log(e);
  }
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

module.exports = async ({
  providerId,
  refreshToken,
  folderId,
  folderDriveId,
  counts
}) => {
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
  return Promise.each(ranges, ({ start, end }, i) =>
    startProcess({
      providerId,
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
