import gql from "graphql-tag";

export const defaults = {
  songQueue: [],
  currentIndexSong: -1
};

const changeSong = (cache, diff) => {
  const query = gql`
    query {
      currentIndexSong @client
    }
  `;
  const previous = cache.readQuery({ query });
  cache.writeData({
    data: {
      currentIndexSong: previous.currentIndexSong + diff
    }
  });
};

export const resolvers = {
  Mutation: {
    nextSong: (_root, _, { cache }) => changeSong(cache, 1),
    previousSong: (_root, _, { cache }) => changeSong(cache, -1),
    updateSongQueue: (_root, variables, { cache }) => {
      cache.writeData({
        data: {
          ...Object.keys(variables).reduce(
            (acc, k) => ({
              ...acc,
              ...(variables[k] !== undefined ? { [k]: variables[k] } : {})
            }),
            {}
          )
        }
      });
    }
  }
};
