import React from "react";
import { Button } from "rebass";

const Icon = ({ name, ...props }) => {
  return (
    <Button {...props}>
      <i className={`fas fa-${name}`} />
    </Button>
  );
};

export default Icon;
