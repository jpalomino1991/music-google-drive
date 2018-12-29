const jwt = require('jsonwebtoken');
const { google } = require('googleapis');

const db = require('./db');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

const scopes = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/drive.readonly'
];

const findUserByProviderId = providerId =>
  db.query.user({
    where: {
      providerId
    }
  });

module.exports = server => {
  server.express.get('/google/login', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes
    });
    res.redirect(301, url);
  });

  server.express.get('/callback', async (req, res) => {
    try {
      const { code } = req.query;
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const plus = google.plus({
        version: 'v1',
        auth: oauth2Client
      });

      const {
        data: {
          id,
          displayName,
          image,
          name,
          etag,
          kind,
          objectType,
          url,
          language,
          verified,
          isPlusUser
        }
      } = await plus.people.get({ userId: 'me' });

      let userId;
      const userFound = await findUserByProviderId(id);
      if (userFound) {
        userId = userFound.id;
      } else {
        const user = await db.mutation.createUser({
          data: {
            providerId: id,
            displayName,
            picture: (image || {}).url,
            refreshToken: tokens.refresh_token,
            googleInfo: {
              create: {
                etag,
                familyName: (name || {}).familyName,
                givenName: (name || {}).givenName,
                kind,
                objectType,
                url,
                language,
                isPlusUser,
                verified
              }
            }
          }
        });
        userId = user.id;
      }
      const token = jwt.sign(
        {
          userId
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '3h'
        }
      );
      res.cookie('token', token, {
        //httpOnly: true,
        maxAge: 1000 * 60 * 60 * 3 //3 hours
      });
      res.redirect(301, process.env.FRONTEND_SUCCESS_URL);
    } catch (e) {
      console.log(e);
    }
  });
};
