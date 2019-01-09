const elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: process.env.ELASTIC_URL,
  log: 'trace'
});

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
