import React, { useState, createContext, useContext } from "react";

const MusicQueueContext = createContext(null);

const MusicQueueProvider = ({ children }) => {
  const [songQueue, setSongQueue] = useState([]);

  return (
    <MusicQueueContext.Provider value={{ songQueue, setSongQueue }}>
      {children}
    </MusicQueueContext.Provider>
  );
};

const useMusicQueue = () => useContext(MusicQueueContext);

export { MusicQueueProvider, useMusicQueue };
