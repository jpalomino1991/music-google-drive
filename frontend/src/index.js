import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import './boostrap';
import { MusicQueueProvider } from './hooks/musicQueueContext';
import * as serviceWorker from './serviceWorker';
import history from './helpers/history';
import client from './apolloClient';
import Routes from './routes';

const theme = {
  colors: {
    background: '#0b1220',
    primary: '#00bbdd',
    black: ['#101727', '#172036'],
    text: '#FFFFFF',
    gray: '#3d4354',
  },
};

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <MusicQueueProvider>
      <ApolloProvider client={client}>
        <Router history={history}>
          <Routes />
        </Router>
      </ApolloProvider>
    </MusicQueueProvider>
  </ThemeProvider>,
  document.getElementById('root')
);

serviceWorker.register();
