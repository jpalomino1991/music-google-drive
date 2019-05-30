import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Box } from 'rebass';

import { useMusicQueue } from '../../../hooks/musicQueueContext';
import Folder from './Folder';
import Song from './Song';

const FETCH_ITEMS = gql`
  query FETCH_ITEMS($id: String) {
    items(parentId: $id) {
      id
      type
      providerId
      title
      parentId
      link
    }
  }
`;

const byTitle = (a, b) => (a.title > b.title ? 1 : -1);

const Items = ({ id }) => {
  const { setSongQueue } = useMusicQueue();

  return (
    <Query query={FETCH_ITEMS} variables={{ id }}>
      {({ loading, data }) => {
        if (loading) return <div>loading</div>;
        return (
          <Box
            py={3}
            css={`
              max-height: 100%;
              overflow: auto;
            `}
          >
            {data.items.sort(byTitle).map((item, i) =>
              item.type === 'folders' ? (
                <Folder {...item} key={item.id} />
              ) : (
                <Song
                  key={item.id}
                  onClick={() => {
                    const songs = data.items.filter(
                      item => item.type !== 'folders'
                    );
                    const songsOrdered = songs
                      .slice(i)
                      .concat(songs.slice(0, i));
                    setSongQueue(songsOrdered);
                  }}
                  {...item}
                />
              )
            )}
          </Box>
        );
      }}
    </Query>
  );
};

export default Items;
