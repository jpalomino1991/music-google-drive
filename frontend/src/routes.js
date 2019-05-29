import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import Loadable from "react-loadable";

import { PrivateRoute } from "./components";
import Login from "./pages/Login";
import Home from "./pages/Home";

const Loading = () => <div> Loading ...</div>;

const Player = Loadable({
  loader: () => import("./pages/Player"),
  loading: Loading
});

class App extends Component {
  render() {
    return (
      <div>
        <Switch>
          <PrivateRoute exact path="/" component={Home} />
          <PrivateRoute path="/player/:id" component={Player} />
          <Route path="/login" component={Login} />
        </Switch>
      </div>
    );
  }
}

export default App;
