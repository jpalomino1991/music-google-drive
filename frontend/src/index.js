import React from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "react-apollo";
import { Router } from "react-router-dom";
import { Provider } from "unstated";

import * as serviceWorker from "./serviceWorker";
import history from "./helpers/history";
import client from "./apolloClient";
import Routes from "./routes";

ReactDOM.render(
  <Provider>
    <ApolloProvider client={client}>
      <Router history={history}>
        <Routes />
      </Router>
    </ApolloProvider>
  </Provider>,
  document.getElementById("root")
);

serviceWorker.register();
