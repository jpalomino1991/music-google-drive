import React from "react";
import { Redirect } from "react-router-dom";

import ParentFolder from "./components/ParentFolder";
import Items from "./components/Items";
import AudioControls from "./components/AudioControls";

const Player = ({
  match: {
    params: { id }
  }
}) => {
  if (!id) return <Redirect to="/" />;
  return (
    <div>
      <ParentFolder id={id} />
      <Items id={id} />
      <AudioControls />
    </div>
  );
};

export default Player;
