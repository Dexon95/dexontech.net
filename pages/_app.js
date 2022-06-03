import Head from 'next/head';

import Layout from '../src/components/Layout';

import { config as fontawesomeConfig } from '@fortawesome/fontawesome-svg-core';
import '../src/styles/App.css';
import 'antd/dist/antd.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

fontawesomeConfig.autoAddCss = false;

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Dexontech.net</title>
        <meta name="theme-color" content="#242424" />
        <link rel="shortcut icon" type="image/png" href="/avatar.png" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}