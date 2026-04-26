import "../styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Playvo - Play Every Moment</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="แชร์โมเมนต์กับเพื่อน ๆ บน Playvo" />
        <meta name="theme-color" content="#ec4899" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
