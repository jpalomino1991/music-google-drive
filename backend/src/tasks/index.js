const LineReader = require('line-by-line');

const db = require('../db');
const drive = require('./drive');
const fetchFiles = require('./fetchFiles');
const uploadElastic = require('./uploadElastic');
const processMetadata = require('./processMetadata');
const queue = require('./queue');

const gg = async () => {
  console.log('hi');
  const folderDriveId = '13ov24loNOhJTgLdeobhJUbQn9hw-dGzg';
  const refreshToken = '1/op04JK9buqUQPJQdgstxUAsQiwAGBEaAbZcEgRuZYWY';
  //const lineReader = new LineReader(`./src/temp/songs_${folderDriveId}`);
  const lineReader = new LineReader(`./src/temp/ggwp`);

  let lineCount = 0;
  console.time('PROCESS');
  lineReader.on('line', async line => {
    queue.add({ song: JSON.parse(line), refreshToken, folderDriveId });
    lineCount++;
  });
  lineReader.on('end', () => {
    console.log('END LINES PROCESSED', lineCount);
  });
};

//gg();

module.exports = async ({
  providerId,
  folderDriveId,
  folderId,
  refreshToken,
}) => {
  try {
    console.time('fetch drive');
    const counts = await fetchFiles({
      providerId,
      driveClient: await drive.createClient(refreshToken),
      folderId,
      folderDriveId,
    });
    console.timeEnd('fetch drive');

    await db.mutation.updateMusicFolder({
      data: {
        totalFiles: counts.files,
        totalFolders: counts.folders,
      },
      where: {
        id: folderId,
      },
    });

    console.time('upload elastic');
    await uploadElastic({
      providerId,
      folderId,
      folderDriveId,
      counts,
    });
    console.timeEnd('upload elastic');
    await processMetadata({
      providerId,
      refreshToken,
      folderId,
      folderDriveId,
      counts,
    });
  } catch (e) {
    console.log('err', e);
  }
};

// try {
// processMetadata({
//       providerId: '01732506421897009934',
//       refreshToken: '1/M9252qKFjlyOZPyRnkmYqvW8_rvkV95KQf6sKY0u3Qyu9iyZ2nrC3debf34COgot',
//       folderId: 'cjtuolw4y43fo0b33oivstep0',
//       folderDriveId: '13ov24loNOhJTgLdeobhJUbQn9hw-dGzg',
//       counts: 3083
//     })
// } catch(e) {
//   console.log('global', e)
// }
