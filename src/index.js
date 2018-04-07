import React from "react";

import { render } from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import Home from "./components/Home";

const App = () => (
  <main>
    <Switch>
      <Route exact path="/" component={Home} />
    </Switch>
  </main>
);

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);
