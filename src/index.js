import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import { Helmet } from 'react-helmet';

import { config as fontawesomeConfig } from '@fortawesome/fontawesome-svg-core';

import 'antd/dist/antd.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import './styles/App.css';

import Layout from './components/Layout';

import Home from './pages/Home';

fontawesomeConfig.autoAddCss = false;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Helmet>
      <meta name="viewport" content="user-scalable=no,initial-scale=1,maximum-scale=1,minimum-scale=0.2,width=device-width" />
      <link rel="shortcut icon" type="image/png" href="/avatar.png" />
    </Helmet>
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Layout>
  </BrowserRouter>
);