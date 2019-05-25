import { useState, useEffect } from "react";

const audio = new Audio();

const useAudio = src => {
  const [state, setState] = useState({
    isPlaying: false,
    currentTime: 0,
    loaded: false,
    duration: 0,
    volume: 0
  });

  useEffect(() => {
    if (!src || state.currentTime !== 0) return;
    setState(state => ({ ...state, loaded: false }));
    audio.autoplay = true;
    audio.src = src;
    audio.ontimeupdate = onTimeUpdate;
    audio.onloadedmetadata = onLoadedMetadata;
  }, [src, state.currentTime]);

  const onLoadedMetadata = () => {
    setState(state => ({
      ...state,
      loaded: true,
      duration: audio.duration
    }));
  };

  const onTimeUpdate = () =>
    setState(state => ({
      ...state,
      currentTime: Math.round(audio.currentTime)
    }));

  const play = () => {
    try {
      if (!state.isPlaying) {
        var promise = audio.play();
        if (promise !== undefined) {
          promise
            .then(_ => {
              console.log("ok");

              setState(state => ({
                ...state,
                isPlaying: true
              }));
            })
            .catch(error => {
              console.log(error);
              // Autoplay was prevented.
              // Show a "Play" button so that user can start playback.
            });
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  const pause = () => {
    if (state.isPlaying) {
      audio.pause();
      var promise = audio.pause();
      if (promise !== undefined) {
        promise
          .then(_ => {
            setState(state => ({
              ...state,
              isPlaying: false
            }));
          })
          .catch(error => {
            console.log(error);
          });
      }
    }
  };
  const setVolume = newVolume => {
    audio.volume = newVolume;
    setState(state => ({
      ...state,
      volume: newVolume
    }));
  };
  const seek = () => {};
  const mute = () => {};
  const unmute = () => {};

  const controls = { play, pause, seek, setVolume, mute, unmute };

  return [state, setState, controls];
};

export default useAudio;
