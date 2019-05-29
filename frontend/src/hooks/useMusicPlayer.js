import { useRef, useEffect, useState } from "react";

import { useMusicQueue } from "./musicQueueContext";
import useAudioURL from "./useAudioURL";
import useAudio from "./useAudio";

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const suffleArray = arr => {
  let temp;
  let iterationsSuffle = 20;
  while (iterationsSuffle--) {
    const x1 = getRandomInt(0, arr.length);
    const x2 = getRandomInt(0, arr.length);
    temp = arr[x1];
    arr[x1] = arr[x2];
    arr[x2] = temp;
  }
  return arr;
};

const useMusicPlayer = () => {
  const { songQueue, setSongQueue } = useMusicQueue();
  const [state, setState] = useState({
    repeat: "ALL",
    currentIndex: 0
  });

  const repeatRef = useRef("ALL");

  useEffect(() => {
    repeatRef.current = state.repeat;
  }, [state.repeat]);

  const initialize = ({ songQueue, currentIndex }) =>
    setState(state => ({ ...state, songQueue, currentIndex }));

  const song = songQueue[state.currentIndex];
  const [url] = useAudioURL(song && song.link);
  const [audio, setAudio, audioControls] = useAudio(url, {
    onEnded: () => nextQueueSong()
  });

  const suffle = () => {
    setSongQueue(
      songQueue
        .slice(0, state.currentIndex + 1)
        .concat(suffleArray(songQueue.slice(state.currentIndex + 1)))
    );
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
      console.log("next", nextRepeatState);
      return {
        ...prevState,
        repeat: nextRepeatState
      };
    });

  const nextQueueSong = () => {
    if (repeatRef.current === "ONE") {
      audioControls.seek(0);
      return audioControls.play();
    }
    nextSong();
  };

  const changeSong = diff => {
    let nextIndex = state.currentIndex + diff;
    if (nextIndex < 0) {
      nextIndex = songQueue.length - 1;
    }
    if (nextIndex === songQueue.length) {
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
    suffle,
    changeRepeatStatus
  };

  return [{ ...song, ...state }, audio, { ...audioControls, ...controls }];
};

export default useMusicPlayer;
