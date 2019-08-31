import React from "react";

import { render } from "react-dom";
import { HashRouter, Switch, Route } from "react-router-dom";

import 'materialize-css/dist/css/materialize.min.css';

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./components/Home";
import Convert from "./components/Convert";
import Vanitygen from "./components/Vanitygen";
import AIPong from "./components/AIPong";

const App = () => (
  <main>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/c" component={Convert} />
      <Route exact path="/vanitygen" component={Vanitygen} />
      <Route exact path="/aipong" component={AIPong} />
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
