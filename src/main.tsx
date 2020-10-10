import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import asyncComponent from './components/util/AsyncComponent'
import './main.scss';

const AsyncHome = asyncComponent(() =>
  import("./pages/home/home")
);

const MainRouter =() => {
  return (
    <Router>
      <Switch>
        <Route component={AsyncHome} />
      </Switch>
    </Router>
  );
}

export default MainRouter;
