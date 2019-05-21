import React, { useEffect, useState } from "react";
import { Flex } from "rebass";
import { Subscribe } from "unstated";

import PlayerContainer from "../container";
import { IconButton } from "../../../components";

const getUrl = (id, token) => `${id}&access_token=${token}`;

let audio = new Audio();

const AudioControlsContainer = () => {
  return (
    <Subscribe to={[PlayerContainer]}>
      {player => <AudioControls player={player} />}
    </Subscribe>
  );
};

const AudioControls = ({ player }) => {
  const song = player.state.songQueue[player.state.currentIndex];
  if (!song) return null;

  const [playing, togglePlaying] = useState(false);
  const [duration, updateDuration] = useState(undefined);

  useEffect(() => {
    if (!song) return;
    const loadSong = async () => {
      audio.pause();
      const res = await fetch(process.env.REACT_APP_BACKEND_URL + "/tokens", {
        credentials: "include"
      });
      const { access_token } = await res.json();
      audio.src = getUrl(song.link, access_token);
      audio.onloadedmetadata = _ => updateDuration(audio.duration);
      audio.onended = _ => player.nextQueueSong();
      audio.play().then(() => togglePlaying(true));
    };
    loadSong();
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
        <IconButton name="random" mx={3} onClick={player.randomSong} />
        <IconButton name="backward" mx={3} onClick={player.previousSong} />
        <IconButton
          name={playing ? "pause" : "play"}
          mx={3}
          fontSize={5}
          onClick={playing ? pause : play}
        />
        <IconButton name="forward" mx={3} onClick={player.nextSong} />
        <IconButton name="redo" mx={3} onClick={player.changeRepeatStatus} />
      </Flex>
    </Flex>
  );
};

export default AudioControlsContainer;
