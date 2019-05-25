import { useRef, useEffect, useState } from "react";

import { useMusicQueue } from "./musicQueueContext";
import useAudioURL from "./useAudioURL";
import useAudio from "./useAudio";

const useMusicPlayer = () => {
  const { songQueue } = useMusicQueue();
  const [state, setState] = useState({
    repeat: "ALL",
    currentIndex: 0
  });

  const initialize = ({ songQueue, currentIndex }) =>
    setState(state => ({ ...state, songQueue, currentIndex }));

  const refValue = useRef(state.repeat);
  useEffect(() => {
    refValue.current = state.repeat;
  });

  const song = songQueue[state.currentIndex];
  const [url] = useAudioURL(song && song.link);
  const [audio, setAudio, audioControls] = useAudio(url);

  const randomSong = () => {
    console.log("yet");
  };

  const changeRepeatStatus = () =>
    setState(prevState => {
      let nextRepeatState;
      switch (prevState.repeat) {
        case "NONE":
          nextRepeatState = "ALL";
          break;
        case "ALL":
          nextRepeatState = "ONE";
          break;
        default:
          nextRepeatState = "NONE";
      }
      return {
        ...prevState,
        repeat: nextRepeatState
      };
    });

  const setSongQueue = () => {};
  const nextQueueSong = () => {
    if (refValue.current) {
      setSongQueue(queue =>
        queue.map((song, i) => {
          if (i === state.currentIndex) {
            return { ...song, flag: new Date().getTime() };
          }
          return song;
        })
      );
      return changeSong(0);
    }
    nextSong();
  };

  const changeSong = diff => {
    let nextIndex = state.currentIndex + diff;
    if (nextIndex < 0) {
      nextIndex = state.songQueue.length - 1;
    }
    if (nextIndex === state.songQueue.length) {
      nextIndex = 0;
    }
    setState(state => ({
      ...state,
      currentIndex: nextIndex
    }));
    setAudio(state => ({
      ...state,
      duration: false,
      loaded: false,
      currentTime: 0,
      isPlaying: false
    }));
  };

  const nextSong = () => changeSong(1);

  const previousSong = () => changeSong(-1);

  const controls = {
    initialize,
    previousSong,
    nextSong,
    nextQueueSong,
    randomSong,
    changeRepeatStatus
  };

  return [song, audio, { ...audioControls, ...controls }];
};

export default useMusicPlayer;
