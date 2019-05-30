import React from 'react';
import { Redirect } from 'react-router-dom';
import { Flex } from 'rebass';

import SideBar from './components/SideBar';
import ParentFolder from './components/ParentFolder';
import Items from './components/Items';
import AudioControls from './components/AudioControls';

const Player = ({
  match: {
    params: { id },
  },
}) => {
  if (!id) return <Redirect to="/" />;
  return (
    <Flex
      flexDirection="column"
      css={`
        height: 100%;
      `}
    >
      <Flex flex="1">
        <SideBar />
        <Flex
          width={3 / 4}
          p={4}
          mt={1}
          flexDirection="column"
          css={`
            height: 100%;
          `}
        >
          <ParentFolder id={id} />
          <Items id={id} />
        </Flex>
      </Flex>
      <AudioControls />
    </Flex>
  );
};

export default Player;
