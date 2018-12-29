import React from 'react';

import { PrivateRoute } from '../components';

class Home extends React.Component {
  render() {
    return (
      <PrivateRoute>
        <div>hi</div>
      </PrivateRoute>
    );
  }
}

export default Home;
