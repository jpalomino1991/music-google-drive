const fs = require('fs');
const util = require('util');

const elastic = require('./elastic');
const drive = require('./drive');
const extractMetadata = require('./extractMetadata');

const unlink = util.promisify(fs.unlink);

module.exports = async function(job, done) {
  console.log('start', job.data.song.id);
  const { song, refreshToken } = job.data;
  const path = `./src/temp/${song.id}.${song.fileExtension}`;
  try {
    const driveClient = await drive.createClient(refreshToken);
    if (job.attemptsMade > 0) {
      await drive.createFullFile({
        driveClient,
        fileId: song.id,
        path,
      });
    } else {
      await drive.createPartialFile({
        driveClient,
        fileId: song.id,
        path,
      });
    }

    const tags = await extractMetadata({
      path,
      song,
    });

    await unlink(path);

    console.log('-----------', song.title);
    console.log(tags);
    await elastic.bulkUpdateSongs([
      {
        _id: song._id,
        tags,
      },
    ]);
    done(null, tags);
  } catch (e) {
    await unlink(path).catch(() => {});
    //console.log('ERROR', song.title, song.id);
    throw e;
  }
};
