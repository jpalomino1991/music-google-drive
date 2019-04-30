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

const songHeader = _id => ({
  index: {
    _index: 'songs',
    _type: '_doc',
    _id
  }
});

const removeFileExtension = fileName => fileName.replace(/\.[^\.]+$/, '');

const folderHeader = _id => ({
  index: {
    _index: 'folders',
    _type: '_doc',
    _id
  }
});

module.exports.bulkUploadFolders = (folders, providerId) =>
  client.bulk({
    body: R.compose(
      R.flatten,
      R.map(({ id, title, parents }) => [
        folderHeader(id),
        {
          providerId,
          title,
          parentId: parents[0].id
        }
      ])
    )(folders)
  });

module.exports.bulkUploadSongs = (songs, providerId) =>
  client.bulk({
    body: R.compose(
      R.flatten,
      R.map(({ id, title, parents, downloadUrl, tags = {} }) => [
        songHeader(id),
        {
          parentId: parents[0].id,
          providerId,
          file: title,
          title: tags.title || removeFileExtension(title),
          artist: tags.artist,
          album: tags.album,
          year: tags.year,
          genre: tags.genre,
          link: downloadUrl,
          image: ''
        }
      ])
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

const parseItem = ({ _index: type, _id: id, _source }) => ({
  type,
  id,
  ..._source
});

module.exports.getItem = async id => {
  try {
    const response = await client.search({
      index: '_all',
      body: {
        query: {
          match: {
            _id: id
          }
        }
      }
    });
    return parseItem(response.hits.hits[0]);
  } catch (e) {
    return undefined;
  }
};

module.exports.getChildren = async parentId => {
  const response = await client.search({
    index: '_all',
    body: {
      query: {
        match: {
          parentId
        }
      }
    }
  });

  return R.map(parseItem)(response.hits.hits);
};

module.exports.setup = async () => {
  /*
  await client.indices.delete({
    index: '_all'
  });
  console.log('deleted');
  return;

   */

  try {
    await createIndexIfNotExists('songs');
    await createIndexIfNotExists('folders');
  } catch (e) {
    console.log(e);
  }
};
