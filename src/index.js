import React from "react";

import { render } from "react-dom";
import { HashRouter, Switch, Route } from "react-router-dom";

import Home from "./components/Home";
import Convert from "./components/Convert";

const App = () => (
  <main>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/c" component={Convert} />
    </Switch>
  </main>
);

render(
  <HashRouter>
    <App />
  </HashRouter>,
  document.getElementById("root")
);
