import React from "react";
import { Button } from "rebass";

const Icon = ({ name, children, ...props }) => {
  return (
    <Button {...props}>
      <i className={`fas fa-${name}`} />
      {children}
    </Button>
  );
};

export default Icon;
