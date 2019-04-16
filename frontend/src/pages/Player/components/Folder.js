import React from "react";
import { Link } from "react-router-dom";

const Folder = ({ id, title }) => {
  return <Link to={`/player/${id}`}>{title}</Link>;
};

export default Folder;
