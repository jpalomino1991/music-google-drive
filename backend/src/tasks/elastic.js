const AWS = require('aws-sdk');
const R = require('ramda');

const options = {
  host: process.env.ELASTIC_URL,
  connectionClass: require('http-aws-es'),
  awsConfig: new AWS.Config({
    credentials: new AWS.Credentials(
      process.env.ELASTIC_ACCESS_KEY_ID,
      process.env.ELASTIC_ACCESS_KEY_SECRET
    ),
    region: process.env.ELASTIC_REGION
  })
};

const client = require('elasticsearch').Client(options);

const header = {
  index: {
    _index: 'music',
    _type: 'song'
  }
};

module.exports.bulkUploadSongs = (songs, providerId) =>
  client.bulk({
    body: R.compose(
      R.insert(0, header),
      R.intersperse(header),
      R.map(({ file, tags }) => ({
        parentId: file.parent,
        providerId,
        file: file.name,
        title: tags.title || file.name,
        artist: tags.artist,
        album: tags.album,
        year: tags.year,
        genre: tags.genre,
        link: file.webContentLink,
        image: ''
      }))
    )(songs)
  });

module.exports.uploadSong = (file, metadata) => {
  return client.index({
    index: 'music',
    type: 'song',
    body: {
      file: file.name,
      title: metadata.title,
      artist: metadata.artist,
      album: metadata.album,
      year: metadata.year,
      genre: metadata.genre,
      link: file.webContentLink,
      image: ''
    }
  });
};

const createIndexIfNotExists = async index => {
  const exists = await client.indices.exists({
    index
  });
  if (!exists) {
    return await client.indices.create({
      index
    });
  }
};

const setup = async () => {
  try {
    await createIndexIfNotExists('music');
  } catch (e) {
    console.log(e);
  }
};

setup();
