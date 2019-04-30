const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
require('dotenv').config();

const drive = require('./tasks/drive');
const elastic = require('./tasks/elastic');
const createServer = require('./createServer');
const auth = require('./auth');
const db = require('./db');

elastic.setup();
const server = createServer();

server.express.use(cookieParser());

server.express.use(async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = userId;
  }
  next();
});

server.express.use(morgan('tiny'));

server.express.get('/tokens', async (req, res) => {
  const user = await db.query.user({
    where: {
      id: req.userId
    }
  });

  const { access_token } = await drive.generateTokens(user.refreshToken);
  res.setHeader('Cache-Control', 'public, max-age=900');
  res.setHeader('Expires', new Date(Date.now() + 900000).toUTCString());
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.json({ access_token });
});

auth(server);

server.start(
  {
    port: process.env.PORT,
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  ({ port }) => {
    console.log(`Server running on port ${port}`);
  }
);
