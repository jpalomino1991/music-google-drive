import React from 'react';
import { Route } from 'react-router-dom';
import { Flex } from 'rebass';

import Songs from './Songs';
import RootFolder from './RootFolder';
import Folders from './Folders';
import SideBar from './components/SideBar';
import AudioControls from './components/AudioControls';

const Comp = () => <div>hi</div>;

const Player = ({ match: { path } }) => {
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
          <Route exact path={`${path}/folders`} component={RootFolder} />
          <Route path={`${path}/folders/:id`} component={Folders} />
          <Route path={`${path}/songs`} component={Songs} />
          <Route path={`${path}/artist`} component={Comp} />
        </Flex>
      </Flex>
      <AudioControls />
    </Flex>
  );
};

export default Player;
