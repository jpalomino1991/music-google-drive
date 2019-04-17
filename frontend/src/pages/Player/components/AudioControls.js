import React, { useEffect, useState } from "react";
import { Flex } from "rebass";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";

import { IconButton } from "../../../components";

const SONG = gql`
  query player {
    currentIndexSong @client
    songQueue @client {
      id
      title
      link
    }
  }
`;

const NEXT_SONG = gql`
  mutation nextSong {
    nextSong @client
  }
`;

const PREVIOUS_SONG = gql`
  mutation previousSong {
    previousSong @client
  }
`;

let audio;

const AudioControls = ({
  data: { songQueue, currentIndexSong },
  nextSong,
  previousSong
}) => {
  const song = songQueue[currentIndexSong];
  if (!song) return null;
  const [playing, togglePlaying] = useState(false);
  const [duration, updateDuration] = useState(undefined);

  useEffect(() => {
    if (!audio) audio = new Audio();
    if (!song) return;
    if (audio) pause();
    audio.onloadedmetadata = e => updateDuration(audio.duration);
    audio.src = song.link;
    audio.play().then(() => togglePlaying(true));
  }, [song]);
  const pause = () => {
    if (playing) {
      audio.pause();
      togglePlaying(false);
    }
  };
  const play = () => {
    if (!playing) {
      audio.play();
      togglePlaying(true);
    }
  };
  return (
    <Flex flexDirection="column" pt={4}>
      <div>
        {song.title} {duration}
      </div>
      <Flex justifyContent="center" alignItems="center" pt={3}>
        <IconButton name="random" mx={3} />
        <IconButton
          name="backward"
          mx={3}
          onClick={currentIndexSong !== 0 ? previousSong : () => null}
        />
        <IconButton
          name={playing ? "pause" : "play"}
          mx={3}
          fontSize={5}
          onClick={playing ? pause : play}
        />
        <IconButton
          name="forward"
          mx={3}
          onClick={
            currentIndexSong + 1 !== songQueue.length ? nextSong : () => null
          }
        />
        <IconButton name="redo" mx={3} />
      </Flex>
    </Flex>
  );
};

export default compose(
  graphql(SONG),
  graphql(NEXT_SONG, { name: "nextSong" }),
  graphql(PREVIOUS_SONG, { name: "previousSong" })
)(AudioControls);
