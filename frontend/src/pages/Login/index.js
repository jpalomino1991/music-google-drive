import React from "react";

const Login = () => {
  return (
    <a href={`${process.env.REACT_APP_BACKEND_URL}/google/login`}>
      {JSON.stringify(process.env)} login
    </a>
  );
};

export default Login;
