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

client.ping(
  {
    requestTimeout: 30000
  },
  function(error) {
    if (error) {
      console.trace('elasticsearch cluster is down!', error);
    } else {
      console.log('All is well');
    }
  }
);

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
