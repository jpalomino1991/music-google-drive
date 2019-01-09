const fs = require('fs');
const util = require('util');
const LineReader = require('line-by-line');
const NodeID3 = require('node-id3');
const Promise = require('bluebird');

const utils = require('../utils');
const drive = require('./drive');
const fileWriteStream = require('./fileWriteStream');
const extractMetadata = require('./extractMetadata');
const db = require('../db');

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
    console.log(tags);

    console.log('-----------', name);
  } catch (e) {
    fs.unlink(path, err => {});
    console.log('ERROR ---', name, id, e);
    errorStream.write({ ...song });
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

module.exports = async ({
  driveClient,
  folderDriveId,
  folderId,
  counts,
  newStateId,
  start,
  end
}) => {
  const errorStream = fileWriteStream(`./src/temp/error_${folderDriveId}`);

  const lineReader = new LineReader(`./src/temp/songs_${folderDriveId}`);
  let songs = [];
  let lines = -1;
  let processedSongs = 0;
  lineReader.on('line', async line => {
    lines++;
    if (lines < start || lines > end) {
      return;
    }
    songs.push(line);
    if (songs.length === MAX_LINES) {
      lineReader.pause();
      await Promise.all(
        songs.map(
          async song =>
            await processFile(errorStream, driveClient, JSON.parse(song))
        )
      );
      processedSongs += MAX_LINES;
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
  lineReader.on('end', async () => {
    if (songs.length) {
      await Promise.all(
        songs.map(
          async song =>
            await processFile(errorStream, driveClient, JSON.parse(song))
        )
      );
    }
    processedSongs += songs.length;
    await updateState({
      counts,
      processedSongs,
      newStateId
    });
    errorStream.end();
    console.log('close file');
  });
};
