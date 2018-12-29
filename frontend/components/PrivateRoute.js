import React from 'react';

import User from './User';

const PrivateRoute = props => (
  <User>
    {({ data, loading, error }) => {
      if (loading) return <div>loading</div>;
      if (!data.me) return <div>need to sign in</div>;
      return props.children;
    }}
  </User>
);

export default PrivateRoute;
