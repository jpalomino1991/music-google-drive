import React from "react";

const Song = ({ id, title, onClick }) => {
  return <div onClick={onClick}>{title}</div>;
};

export default Song;
