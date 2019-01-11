const util = require('util');
const nodeID3 = require('node-id3');
const musicMetadata = require('music-metadata');
const R = require('ramda');

const nodeID3Promise = util.promisify(nodeID3.read.bind(nodeID3));

const keys = ['title', 'artist', 'album', 'year', 'genre'];
const defaults = {
  title: undefined,
  artist: undefined,
  album: undefined,
  year: undefined,
  genre: undefined,
  image: undefined
};

const extractMedata = async ({ path, song }) => {
  const formatMetadata = R.compose(
    R.merge({ ...defaults, title: song.name }),
    R.pick(keys)
  );
  if (song.fileExtension.toLowerCase() === 'mp3') {
    //sample output
    //{album: 'DRAG-ON DRAGOON 3 Original Soundtrack',
    //encodingTechnology: 'Lame3.99',
    //genre: 'Game',
    //title: 'Better End',
    //trackNumber: '1/19',
    //partOfSet: '1/2',
    //year: '2014',
    //performerInfo: 'Square Enix',
    //composer: 'Keigo Hoashi',
    //image:
    //{ mime: 'jpeg',
    //type: { id: 3, name: 'front cover' },
    //description: undefined,}, ...more }
    return formatMetadata(await nodeID3Promise(path));
  }
  //sample output
  //{common:
  //{ track: { no: 1, of: 19 },
  //disk: { no: 1, of: 2 },
  //album: 'DRAG-ON DRAGOON 3 Original Soundtrack',
  //encodersettings: 'Lame3.99',
  //genre: [ 'Game' ],
  //title: 'Better End',
  //year: 2014,
  //albumartist: 'Square Enix',
  //composer: [ 'Keigo Hoashi' ],
  //picture: [ [Object] ] } },...more }
  const rawMedatata = await musicMetadata.parseFile(path, { native: true });
  return formatMetadata(R.prop('common')(rawMedatata));
};

module.exports = extractMedata;
