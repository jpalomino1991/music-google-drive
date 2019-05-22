import { useState, useRef, useEffect } from "react";
import { createContainer } from "unstated-next";

const generateRandom = max => Math.round(Math.random() * max);

const usePlaylist = () => {
  const [repeatOne, setRepeatOne] = useState(false);
  const refValue = useRef(repeatOne);
  const [repeatAll, setRepeatAll] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [songQueue, setSongQueue] = useState([]);

  useEffect(() => {
    refValue.current = repeatOne;
  });

  const initialize = ({ songQueue, currentIndex }) => {
    setSongQueue(songQueue);
    setCurrentIndex(currentIndex);
  };

  const randomSong = () => {
    if (songQueue.length === 1) return;
    let nextIndex;
    while (true) {
      nextIndex = generateRandom(songQueue.length - 1);
      if (nextIndex !== currentIndex) break;
    }
    setCurrentIndex(nextIndex);
  };

  const changeRepeatStatus = () => setRepeatOne(repeatOne => !repeatOne);

  const nextQueueSong = () => {
    if (refValue.current) {
      setSongQueue(queue =>
        queue.map((song, i) => {
          if (i === currentIndex) {
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
    let nextIndex = currentIndex + diff;
    if (nextIndex < 0) {
      nextIndex = songQueue.length - 1;
    }
    if (nextIndex === songQueue.length) {
      nextIndex = 0;
    }
    setCurrentIndex(nextIndex);
  };

  const nextSong = () => changeSong(1);

  const previousSong = () => this.changeSong(-1);

  return {
    state: {
      currentIndex,
      repeatOne,
      repeatAll,
      songQueue
    },
    initialize,
    previousSong,
    nextSong,
    nextQueueSong,
    randomSong,
    changeRepeatStatus
  };
};

export default createContainer(usePlaylist);
