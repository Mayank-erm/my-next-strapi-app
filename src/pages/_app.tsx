import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

// This is the main entry point for your Next.js application.
// It wraps all your pages and allows for global styling and layout.
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Commercial Content Hub</title>
        <meta name="description" content="Commercial Content Hub for Proposals" />
        <link rel="icon" href="/faviconV2.png" /> {/* You might want to update this favicon */}
      </Head>
      <Component {...pageProps} />
    </>
  )
}

