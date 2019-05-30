import React from 'react';
import { Box, Flex, Text } from 'rebass';

const Song = ({ id, title, onClick }) => {
  return (
    <Flex
      onClick={onClick}
      color="text"
      p={2}
      alignItems="center"
      css={`
        border-radius: 5px;
        cursor: pointer;
        &: hover {
          background-color: #443355;
        }
      `}
    >
      <Box mr={3}>
        <i className="fas fa-music" />
      </Box>
      <Text fontWeight="bold">{title}</Text>
    </Flex>
  );
};

export default Song;
