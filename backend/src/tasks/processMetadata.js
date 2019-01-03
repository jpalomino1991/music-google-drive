const fs = require('fs');
const LineReader = require('line-by-line');
const NodeID3 = require('node-id3');
const Promise = require('bluebird');

const fileWriteStream = require('./fileWriteStream');

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}

const db = require('../db');

const processFile = async (errorStream, driveClient, song) => {
  const { id, parent, name } = song;
  const path = `./src/temp/${id}`;
  const dest = fs.createWriteStream(path);
  try {
    await new Promise((resolve, reject) => {
      driveClient.files.get(
        {
          headers: { Range: 'bytes=0-1024' },
          fileId: id,
          alt: 'media',
          Range: (bytes = 0 - 1024)
        },
        { responseType: 'stream' },

        (err, res) => {
          if (err) return reject(err);
          res.data
            .on('end', resolve)
            .on('UnhandledPromiseRejection', function(reason, promise) {
              console.log(
                'Unhandled Rejection at:',
                'ERRORRR',
                reason.stack || reason
              );
              reject(reason);
            })
            .on('error', err => {
              console.log('Error', 'ERRORRR', err);
              reject(err);
            })
            .pipe(dest);
        }
      );
    });

    const tags = await new Promise((resolve, reject) => {
      NodeID3.read(path, function(err, tags) {
        if (err) return console.log('ERRORRR', err) || reject(err);
        resolve(tags);
      });
    });

    await new Promise((resolve, reject) => {
      fs.unlink(path, err => {
        if (err) return console.log('ERRORRR', err) || reject(err);
        resolve();
      });
    });
    console.log('-----------', name);
  } catch (e) {
    errorStream.write({ ...song, error: e.message ? e.message : e });
    console.log('ERROR ---', name, id);
  }
};

const MAX_LINES = 10;

module.exports = async ({ driveClient, folderDriveId, folderId, counts }) => {
  const errorStream = fileWriteStream(`./src/temp/error_${folderDriveId}`);
  const newState = await db.mutation.createState({
    data: {
      status: 'DOWNLOADING',
      extraData: {
        total: counts.files,
        processed: 0
      },
      folder: {
        connect: {
          id: folderId
        }
      }
    }
  });
  const lineReader = new LineReader(`./src/temp/songs_${folderDriveId}`);
  let songs = [];
  let processedSongs = 0;
  lineReader.on('line', async line => {
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
      await db.mutation.updateState({
        data: {
          extraData: {
            total: counts.files,
            processed: processedSongs
          }
        },
        where: {
          id: newState.id
        }
      });
      songs = [];
      await sleep(1500);
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
    errorStream.end();
    await db.mutation.updateState({
      data: {
        extraData: {
          total: counts.files,
          processed: processedSongs
        }
      },
      where: {
        id: newState.id
      }
    });
    console.log('close file');
  });
};
