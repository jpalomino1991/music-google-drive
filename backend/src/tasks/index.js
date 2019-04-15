const { google } = require('googleapis');

const db = require('../db');
const drive = require('./drive');
const fetchFiles = require('./fetchFiles');
const uploadElastic = require('./uploadElastic');
//const processMetadata = require('./processMetadata');

module.exports = async ({
  providerId,
  folderDriveId,
  folderId,
  refreshToken
}) => {
  try {
    console.time('fetch drive');
    const counts = await fetchFiles({
      driveClient: await drive.createClient(refreshToken),
      folderId,
      folderDriveId
    });
    console.timeEnd('fetch drive');

    await db.mutation.updateMusicFolder({
      data: {
        totalFiles: counts.files,
        totalFolders: counts.folders
      },
      where: {
        id: folderId
      }
    });

    console.time('upload elastic');
    await uploadElastic({
      providerId,
      folderId,
      folderDriveId,
      counts
    });
    console.timeEnd('upload elastic');
    /*
    await processMetadata({
      providerId,
      refreshToken,
      folderId,
      folderDriveId,
      counts
    });
    */
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
