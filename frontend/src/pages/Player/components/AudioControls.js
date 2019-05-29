import React from "react";
import { Flex, Box } from "rebass";

import useMusicPlayer from "../../../hooks/useMusicPlayer";
import { IconButton } from "../../../components";

const AudioControls = () => {
  const [track, audio, controls] = useMusicPlayer();

  const percentagePlayed = Math.round(
    (audio.currentTime * 100) / audio.duration
  );

  if (!track) return null;

  return (
    <Flex flexDirection="column" pt={4}>
      <div>
        {track.title}- {audio.currentTime} - {audio.duration}
      </div>

      <Box width="100px" style={{ height: "5px" }} bg="gray">
        <Box
          bg="magenta"
          width={`${percentagePlayed}%`}
          style={{ height: "100%" }}
        />
      </Box>
      <Flex justifyContent="center" alignItems="center" pt={3}>
        <IconButton name="random" mx={3} onClick={controls.suffle} />
        <IconButton name="backward" mx={3} onClick={controls.previousSong} />
        <IconButton
          name={audio.isPlaying ? "pause" : "play"}
          mx={3}
          fontSize={5}
          onClick={audio.isPlaying ? controls.pause : controls.play}
        />
        <IconButton name="forward" mx={3} onClick={() => controls.nextSong()} />
        <IconButton
          style={{ position: "relative" }}
          name="redo"
          mx={3}
          onClick={controls.changeRepeatStatus}
        >
          {track.repeat === "ONE" && (
            <div
              style={{
                position: "absolute",
                color: "white",
                top: "20%",
                right: "5px"
              }}
            >
              1
            </div>
          )}
        </IconButton>
      </Flex>
    </Flex>
  );
};

export default AudioControls;
