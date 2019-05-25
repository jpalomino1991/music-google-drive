import React from "react";
import { Flex, Box } from "rebass";

import useMusicPlayer from "../../../hooks/useMusicPlayer";
import { IconButton } from "../../../components";

const AudioControls = () => {
  const [track, audio, controls] = useMusicPlayer();
  /*
  const player = Player.useContainer();
  const song = player.state.songQueue[player.state.currentIndex];
  const song2 = {
    id: "1kYYS9FZ9Vxif5WJM9ZQcY4SR35NMgoIE",
    link:
      "https://doc-0o-28-docs.googleusercontent.com/docs/securesc/bgp95l3eabkkpccn0qi0qopvc4e7d4mq/v77a0tq39cgvqtvt8v68lgf9rkeroare/1558497600000/01732506421897009934/01732506421897009934/1kYYS9FZ9Vxif5WJM9ZQcY4SR35NMgoIE?h=14771753379018855219&e=download&gd=true",
    parentId: "1hGQ0slskFhbourYzt1q052vVuH5wKvpR",
    providerId: "01732506421897009934",
    title: "Kanaku y el Tigre - Lucía  El Chico del Pórtico2",
    type: "songs",
    __typename: "Item"
  };

  const [url, error] = useAudioURL(song && song.link);

  const [audio, controls] = useAudio(url);
	*/

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
        <IconButton name="random" mx={3} />
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
          {audio.repeatOne && (
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
