import React, { Component } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Switch, Route } from 'react-router-dom';
import Loadable from 'react-loadable';

import { PrivateRoute } from './components';
import Login from './pages/Login';
import Home from './pages/Home';

const Container = styled.div`
  height: 100vh;
`;

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Muli', sans-serif;
    background: ${props => props.theme.colors.background};
  }
  * {
    box-sizing: border-box;
  }
`;

const Loading = () => <div> Loading ...</div>;

const Player = Loadable({
  loader: () => import('./pages/Player'),
  loading: Loading,
});

class App extends Component {
  render() {
    return (
      <Container>
        <GlobalStyle />
        <Switch>
          <PrivateRoute exact path="/" component={Home} />
          <PrivateRoute path="/player" component={Player} />
          <Route path="/login" component={Login} />
        </Switch>
      </Container>
    );
  }
}

export default App;
