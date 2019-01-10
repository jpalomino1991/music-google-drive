let AWS = require('aws-sdk');

let options = {
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

let client = require('elasticsearch').Client(options);

module.exports.uploadSong = (file, metadata) => {
  return client.index({
    index: 'song',
    type: 'music',
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
    index: 'song'
  });
  if (!exists) {
    return await client.indices.create({
      index: 'song'
    });
  }
};

const setup = async () => {
  try {
    await createIndexIfNotExists('song');
    await createIndexIfNotExists('folders');
  } catch (e) {
    console.log(e);
  }
};

setup();
