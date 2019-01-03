import React from "react";

import { render } from "react-dom";
import { HashRouter, Switch, Route } from "react-router-dom";

import 'materialize-css/dist/css/materialize.min.css';

import Header from "./components/Header";
import Footer from "./components/Footer";

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
    <div>
      <Header />
      <App />
      <Footer />
    </div>
  </HashRouter>,
  document.querySelector("#app")
);
