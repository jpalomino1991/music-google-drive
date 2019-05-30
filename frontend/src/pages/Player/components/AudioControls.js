import React from 'react';
import { Flex, Box, Text } from 'rebass';

import useMusicPlayer from '../../../hooks/useMusicPlayer';

const formatTime = (time = 0) =>
  `${Math.round(time / 60)}:${Math.round(time % 60)}`;

const AudioControls = () => {
  const [track, audio, controls] = useMusicPlayer();

  const percentagePlayed = Math.round(
    (audio.currentTime * 100) / audio.duration
  );

  if (!track) return null;

  return (
    <Flex
      color="white"
      py={3}
      px={4}
      css={`
        border-top: 1px solid white;
      `}
      alignItems="center"
    >
      <Box
        css={`
          border-radius: 5px;
          width: 30px;
          height: 30px;
        `}
        bg="#56517e"
        mr={3}
      />
      <Text fontWeight="bold" width="200px">
        {track.title}
      </Text>

      <Flex justifyContent="center" alignItems="center" mx={3}>
        <Box mx={2} onClick={controls.suffle}>
          <i className="fas fa-random" />
        </Box>
        <Box mx={2} onClick={controls.previousSong}>
          <i className="fas fa-backward" />
        </Box>
        <Box
          mx={2}
          fontSize={3}
          onClick={audio.isPlaying ? controls.pause : controls.play}
        >
          <i className={`fas fa-${audio.isPlaying ? 'pause' : 'play'}`} />
        </Box>
        <Box mx={2} onClick={() => controls.nextSong()}>
          <i className="fas fa-forward" />
        </Box>
        <Box
          css={`
            position: relative;
            border-radius: 3px;
          `}
          mx={2}
          onClick={controls.changeRepeatStatus}
        >
          <i className="fas fa-redo" />
          {track.repeat === 'ONE' && (
            <div
              css={`
                font-size: 12px;
                position: absolute;
                color: white;
                top: 20%;
                right: -9px;
              `}
            >
              1
            </div>
          )}
        </Box>
      </Flex>
      <Text color="primary">{formatTime(audio.currentTime)}</Text>
      <Flex
        mx={2}
        flex="1"
        css={`
          border-radius: 5px;
          overflow: hidden;
          height: 5px;
        `}
        bg="gray"
      >
        <Box
          bg="primary"
          width={`${percentagePlayed}%`}
          style={{ height: '100%' }}
        />
      </Flex>
      <Text>{formatTime(audio.duration)}</Text>
    </Flex>
  );
};

export default AudioControls;
