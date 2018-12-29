import React from 'react';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

class Login extends React.Component {
  render() {
    return (
      <a href={`${publicRuntimeConfig.BACKEND_URL}/google/login`}>login</a>
    );
  }
}

export default Login;
