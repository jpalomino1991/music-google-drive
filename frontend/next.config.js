const { parsed: envVariables } = require('dotenv').config({});

module.exports = {
  publicRuntimeConfig: envVariables
};
