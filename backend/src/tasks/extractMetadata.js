const util = require('util');
const nodeID3 = require('node-id3');
const musicMetadata = require('music-metadata');

const nodeID3Promise = util.promisify(nodeID3.read.bind(nodeID3));

module.exports = async ({ path, song }) => {
  //TODO format metadata in a plain object before returning
  if (song.fileExtension === 'mp3') {
    return await nodeID3Promise(path);
  }
  return await musicMetadata.parseFile(path, { native: true });
};
