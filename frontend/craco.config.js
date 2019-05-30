const CracoWorkboxPlugin = require('craco-workbox');
//const BabelRcPlugin = require('@jackwilsdon/craco-use-babelrc');

module.exports = {
  babel: {
    plugins: ['babel-plugin-styled-components'],
  },
  plugins: [
    {
      plugin: CracoWorkboxPlugin,
    },
  ],
};
