import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import { PrivateRoute } from "./components";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Player from "./pages/Player";

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
