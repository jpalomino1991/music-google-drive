import { useState, useEffect } from "react";

const audio = new Audio();

const useAudio = (src, opts) => {
  const [state, setState] = useState({
    isPlaying: false,
    currentTime: 0,
    loaded: false,
    duration: 0,
    volume: 0
  });

  useEffect(() => {
    if (!src) return;
    pause();
    setState(state => ({ ...state, loaded: false }));
    audio.autoplay = true;
    audio.src = src;
    audio.ontimeupdate = onTimeUpdate;
    audio.onloadedmetadata = onLoadedMetadata;
    if (opts.onEnded) {
      audio.onended = opts.onEnded;
    }
  }, [src]);

  const onLoadedMetadata = () => {
    setState(state => ({
      ...state,
      loaded: true,
      isPlaying: true,
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
              setState(state => ({
                ...state,
                isPlaying: true
              }));
            })
            .catch(error => {
              console.log(error);
            });
        } else {
          setState(state => ({
            ...state,
            isPlaying: true
          }));
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
      } else {
        setState(state => ({
          ...state,
          isPlaying: false
        }));
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
  const seek = time => {
    audio.currentTime = time;
  };
  const mute = () => {};
  const unmute = () => {};

  const controls = { play, pause, seek, setVolume, mute, unmute };

  return [state, setState, controls];
};

export default useAudio;
