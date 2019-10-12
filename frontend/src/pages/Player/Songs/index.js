import React, { useState } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Box } from 'rebass';
import { useDebouncedCallback } from 'use-debounce';

import { useMusicQueue } from '../../../hooks/musicQueueContext';
import Song from '../components/Song';

const FETCH_SONGS = gql`
  query FETCH_SONGS($query: String) {
    searchSong(query: $query) {
      id
      title
      providerId
      parentId
      link
    }
  }
`;

const SearchInput = ({ onChange, placeholder = 'Search' }) => {
  const [text, setText] = useState('');
  const [debouncedCallback] = useDebouncedCallback(val => onChange(val), 200);
  return (
    <Box
      onChange={e => {
        const value = e.target.value;
        setText(value);
        debouncedCallback(value);
      }}
      value={text}
      placeholder={placeholder}
      as="input"
      py={2}
      px={3}
      bg="black.0"
      fontSize={1}
      color={text ? 'primary' : 'gray'}
      css={`
        font-family: inherit;
        box-sizing: inherit;
        border: 0;
        border-radius: 4px;
      `}
    />
  );
};

const Songs = () => {
  const { setSongQueue } = useMusicQueue();
  const [text, setText] = useState('');

  return (
    <>
      <SearchInput onChange={t => setText(t)} />
      {text.length && (
        <Query query={FETCH_SONGS} variables={{ query: text }}>
          {({ loading, data }) => {
            if (loading) return <div>loading</div>;
            return (
              <Box
                py={3}
                css={`
                  max-height: 79vh;
                  overflow: auto;
                `}
              >
                {data.searchSong.map((item, i) => (
                  <Song
                    key={item.id}
                    onClick={() => {
                      const songs = data.searchSong;
                      const songsOrdered = songs
                        .slice(i)
                        .concat(songs.slice(0, i));
                      setSongQueue(songsOrdered);
                    }}
                    {...item}
                  />
                ))}
              </Box>
            );
          }}
        </Query>
      )}
    </>
  );
};

export default Songs;
