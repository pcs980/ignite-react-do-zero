import { AppProps } from 'next/app';
import Head from 'next/head';

import Header from '../components/Header';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
      </Head>
      <Header />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
