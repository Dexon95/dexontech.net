import Head from 'next/head';

import Layout from '../src/components/Layout';

import '../src/styles/App.css';
import 'antd/dist/antd.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Dexontech.net</title>
        <meta name="theme-color" content="#242424" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}