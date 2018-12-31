import React from 'react';

import { PrivateRoute, FolderPicker } from '../components';

class Home extends React.Component {
  render() {
    return (
      <PrivateRoute>
        <FolderPicker />
      </PrivateRoute>
    );
  }
}

export default Home;
