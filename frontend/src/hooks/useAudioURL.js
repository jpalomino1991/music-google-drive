import { useState, useEffect } from "react";

const getUrl = (id, token) => `${id}&access_token=${token}`;

const useAudioURL = link => {
  const [url, setUrl] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    if (!link) return;
    const loadSong = async () => {
      const res = await fetch(process.env.REACT_APP_BACKEND_URL + "/tokens", {
        credentials: "include"
      }).catch(e => setError(e));
      const { access_token } = await res.json();
      setUrl(getUrl(link, access_token));
    };
    loadSong();
  }, [link]);

  return [url, error];
};

export default useAudioURL;
