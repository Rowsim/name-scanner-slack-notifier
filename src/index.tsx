import React from 'react';
import ReactDOM from 'react-dom';
import MainRouter from './main';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<MainRouter />, document.getElementById('root'));
serviceWorker.register();
