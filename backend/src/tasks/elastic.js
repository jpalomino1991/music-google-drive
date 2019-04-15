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

const songHeader = {
  index: {
    _index: 'songs',
    _type: '_doc'
  }
};

const removeFileExtension = fileName => fileName.replace(/\.[^\.]+$/, '');

const folderHeader = {
  index: {
    _index: 'folders',
    _type: '_doc'
  }
};

module.exports.bulkUploadFolders = (folders, providerId) =>
  client.bulk({
    body: R.compose(
      R.insert(0, folderHeader),
      R.intersperse(folderHeader),
      R.map(({ id, name, parent }) => ({
        providerId,
        driveId: id,
        title: name,
        parentId: parent
      }))
    )(folders)
  });

module.exports.bulkUploadSongs = (songs, providerId) =>
  client.bulk({
    body: R.compose(
      R.insert(0, songHeader),
      R.intersperse(songHeader),
      R.map(({ id, name, parent, webContentLink, tags = {} }) => ({
        driveId: id,
        parentId: parent,
        providerId,
        file: name,
        title: tags.title || removeFileExtension(name),
        artist: tags.artist,
        album: tags.album,
        year: tags.year,
        genre: tags.genre,
        link: webContentLink,
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

const parseItem = ({ _index: type, _source }) => ({
  type,
  id: _source.driveId,
  ..._source
});

module.exports.getItem = async driveId => {
  try {
    const response = await client.search({
      index: '_all',
      body: {
        query: {
          match: {
            driveId
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
