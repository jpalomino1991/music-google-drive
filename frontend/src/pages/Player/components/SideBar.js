import React from 'react';
import { Flex, Text, Box } from 'rebass';

const Item = ({ selected, text, icon }) => (
  <Flex
    color={selected ? 'primary' : 'gray'}
    py={3}
    px={4}
    css={`
      cursor: pointer;
      &:hover {
        background-color: #172036;
      }
    `}
  >
    <Box mr={3}>
      <i className={`fas fa-${icon}`} />
    </Box>
    <Text fontWeight={selected ? 'bold' : 'normal'}>{text}</Text>
  </Flex>
);

const SideBar = () => {
  return (
    <Flex flexDirection="column" flex="1" bg="black.0" width={1 / 4} py={4}>
      <Item icon="folder" text="Folders" selected />
      <Item icon="music" text="Songs" />
      <Item icon="music" text="Albums" />
      <Item icon="users" text="Artists" />
    </Flex>
  );
};

export default SideBar;
