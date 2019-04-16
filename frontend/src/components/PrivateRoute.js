import React from "react";
import { Route, Redirect } from "react-router-dom";
import { Query } from "react-apollo";
import gql from "graphql-tag";

const USER = gql`
  query {
    me {
      id
      providerId
      displayName
      picture
    }
  }
`;

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      <Query query={USER}>
        {({ data, loading, error }) => {
          if (loading) return <div>loading</div>;
          //https://reacttraining.com/react-router-dom/web/example/auth-workflow
          //Redirect to={{pathname: '', state: { from : props.lcation}}}
          if (!data || !data.me) return <Redirect to="/login" />;
          return <Component {...props} />;
        }}
      </Query>
    )}
  />
);

export default PrivateRoute;
