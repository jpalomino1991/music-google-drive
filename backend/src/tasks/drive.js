const { google } = require('googleapis');
const fs = require('fs');

const PAGE_SIZE = 100;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

const generateTokens = async refreshToken => {
  const { tokens } = await oauth2Client.refreshToken(refreshToken);
  return tokens;
};

module.exports.generateTokens = generateTokens;

module.exports.createClient = async refreshToken => {
  const tokens = await generateTokens(refreshToken);
  oauth2Client.setCredentials(tokens);
  const drive = google.drive({
    version: 'v2',
    auth: oauth2Client
  });
  return drive;
};

module.exports.createPartialFile = async ({ driveClient, fileId, path }) => {
  const dest = fs.createWriteStream(path);
  return new Promise((resolve, reject) => {
    driveClient.files.get(
      {
        headers: { Range: 'bytes=0-8192' },
        fileId,
        alt: 'media'
      },
      { responseType: 'stream' },

      (err, res) => {
        if (err) return reject(err);
        res.data
          .on('end', () => {
            dest.end();
            resolve();
          })
          .on('UnhandledPromiseRejection', function(reason, promise) {
            console.log('Unhandled Rejection at:', reason.stack || reason);
            reject(reason);
          })
          .on('error', err => {
            dest.end();
            console.log('Error', 'ERRORRR', err);
            reject(err);
          })
          .pipe(dest);
      }
    );
  });
};

const isType = matchType => type => type.indexOf(matchType) > -1;

module.exports.isFolder = ({ mimeType }) => isType('folder')(mimeType);

module.exports.fetchFolderContent = async ({
  driveClient,
  parentId,
  pageToken
}) =>
  (await driveClient.files.list({
    q: `'${parentId}' in parents and (fileExtension = 'mp3' or fileExtension = 'flac' or mimeType = 'application/vnd.google-apps.folder')`,
    includeTeamDriveItems: true,
    supportsTeamDrives: true,
    spaces: 'drive',
    pageToken,
    pageSize: PAGE_SIZE
  })).data;
