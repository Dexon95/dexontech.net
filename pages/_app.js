import Head from 'next/head';

import Loading from '../src/components/loading';
import TopBar from '../src/components/topBar';
import BotBar from '../src/components/botBar';

import '../src/styles/App.css';
import 'antd/dist/antd.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Dexontech.net</title>
        <meta name="theme-color" content="#242424" />
      </Head>
      <Loading />
      <TopBar />
      <Component {...pageProps} />
      <BotBar />
    </>
  );
}