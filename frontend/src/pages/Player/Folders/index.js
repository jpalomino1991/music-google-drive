import React from 'react';

import ParentFolder from '../components/ParentFolder';
import Items from '../components/Items';

const Folders = ({
  match: {
    params: { id },
  },
}) => {
  return (
    <>
      <ParentFolder id={id} />
      <Items id={id} />
    </>
  );
};

export default Folders;
