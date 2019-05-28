const R = require('ramda');

const options = {
  host: process.env.ELASTIC_URL,
};

const client = require('elasticsearch').Client(options);

const songHeader = {
  index: {
    _index: 'songs',
    _type: '_doc',
  },
};

const removeFileExtension = fileName => fileName.replace(/\.[^\.]+$/, '');

const folderHeader = {
  index: {
    _index: 'folders',
    _type: '_doc',
  },
};

module.exports.bulkUploadFolders = (folders, providerId) =>
  client.bulk({
    body: R.compose(
      R.flatten,
      R.map(({ id, title, parents }) => [
        folderHeader,
        {
          driveId: id,
          providerId,
          title,
          parentId: parents[0].id,
        },
      ])
    )(folders),
  });

module.exports.bulkUploadSongs = (songs, providerId) =>
  client.bulk({
    body: R.compose(
      R.flatten,
      R.map(({ id, title, parents, downloadUrl, tags = {} }) => [
        songHeader,
        {
          parentId: parents[0].id,
          driveId: id,
          providerId,
          file: title,
          title: tags.title || removeFileExtension(title),
          artist: tags.artist,
          album: tags.album,
          year: tags.year,
          genre: tags.genre,
          link: downloadUrl,
          image: '',
        },
      ])
    )(songs),
  });

const createIndexIfNotExists = async index => {
  const exists = await client.indices.exists({
    index,
  });
  if (!exists) {
    return await client.indices.create({
      index,
    });
  }
};

const parseItem = ({ _index: type, _id: id, _source }) => ({
  type,
  id: _source.driveId,
  ..._source,
});

module.exports.getItem = async (id, providerId) => {
  try {
    const response = await client.search({
      index: '_all',
      body: {
        query: {
          bool: {
            must: [
              {
                match: {
                  driveId: id,
                },
              },
              {
                match: {
                  providerId,
                },
              },
            ],
          },
        },
      },
    });
    return parseItem(response.hits.hits[0]);
  } catch (e) {
    return undefined;
  }
};

module.exports.getChildren = async (parentId, providerId) => {
  const response = await client.search({
    index: '_all',
    body: {
      from: 0,
      size: 100,
      query: {
        bool: {
          must: [
            {
              match: {
                parentId,
              },
            },
            {
              match: {
                providerId,
              },
            },
          ],
        },
      },
    },
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
