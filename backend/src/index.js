const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const elastic = require('./tasks/elastic');
const createServer = require('./createServer');
const auth = require('./auth');

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
