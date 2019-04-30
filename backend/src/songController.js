const { google } = require('googleapis');
const fs = require('fs');
const mediaServer = require('mediaserver');
const path = require('path');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

createClient = async refreshToken => {
  const { tokens } = await oauth2Client.refreshToken(refreshToken);
  oauth2Client.setCredentials(tokens);
  const drive = google.drive({
    version: 'v2',
    auth: oauth2Client
  });
  return drive;
};
//const drive = require('./tasks/drive');

const SECONDS_CACHE = 24 * 60 * 60;

//TODO remove download file
//TODO look for a way to proxy the file request
const songController = async (req, res) => {
  // if (!userId) throw new Error('You must be signin.');
  const { id } = req.params;
  console.log('hi endopint', id);
  try {
    console.time(`client${id}`);

    const client = await createClient(
      '1/op04JK9buqUQPJQdgstxUAsQiwAGBEaAbZcEgRuZYWY'
    );
    console.timeEnd(`client${id}`);

    const dest = fs.createWriteStream(`./src/temp/${id}.mp3`);

    console.time('download');

    console.time(`d${id}`);
    const response = await client.files.get({ fileId: id });
    console.log(response);
    const parentId = '0B1vzmxkaJSEAM1lRdWZldVZXWEU';
    const gg = await client.files.list({
      q: `'${parentId}' in parents and (fileExtension = 'mp3' or fileExtension = 'flac' or mimeType = 'application/vnd.google-apps.folder')`,
      includeTeamDriveItems: true,
      supportsTeamDrives: true,
      // 'nextPageToken, files(id, name, kind, folderColorRgb, fileExtension, mimeType, parents, downloadUrl, webContentLink)',
      spaces: 'drive',
      pageToken: null,
      pageSize: 20
    });

    res.send(gg.data);
    /*
    const response = await client.files.get(
      { fileId: id, alt: 'media' },
      { responseType: 'stream' }
    );
    console.log('response');
    response.data
      .on('end', () => {
        console.timeEnd(`d${id}`);
        res.setHeader('Cache-Control', `public, max-age=${SECONDS_CACHE}`);
        res.setHeader(
          'Expires',
          new Date(Date.now() + SECONDS_CACHE * 1000).toUTCString()
        );
        mediaServer.pipe(
          req,
          res,
          path.join('./src/temp/', id + '.mp3')
        );
      })
      .on('error', err => {
        console.error('Error downloading file.');
      })
      .pipe(dest);
			*/
  } catch (e) {
    console.log(e);
  }
};

module.exports = songController;
