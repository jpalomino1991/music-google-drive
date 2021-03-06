const jwt = require('jsonwebtoken');
const { google } = require('googleapis');

const db = require('./db');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

const scopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.readonly',
];

const findUserByProviderId = providerId =>
  db.query.user({
    where: {
      providerId,
    },
  });

module.exports = server => {
  server.express.get('/google/login', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    res.redirect(301, url);
  });

  server.express.get('/callback', async (req, res) => {
    try {
      const { code } = req.query;
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      const {
        data: { user: driveUser },
      } = await drive.about.get({ fields: 'user' });

      let userId;
      let providerId;
      const userFound = await findUserByProviderId(driveUser.permissionId);
      if (userFound) {
        userId = userFound.id;
        providerId = userFound.providerId;
      } else {
        const user = await db.mutation.createUser({
          data: {
            providerId: driveUser.permissionId,
            displayName: driveUser.displayName,
            picture: driveUser.photoLink || 'image not found',
            refreshToken: tokens.refresh_token,
            email: driveUser.emailAddress,
          },
        });
        userId = user.id;
        providerId = user.providerId;
      }
      const token = jwt.sign(
        {
          userId,
          providerId,
        },
        process.env.JWT_SECRET
      );
      res.cookie('token', token, {
        //httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365, //1 year
      });
      res.redirect(301, process.env.FRONTEND_URL);
    } catch (e) {
      console.log(e);
    }
  });
};
