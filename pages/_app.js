import '../styles/globals.css'
import Head from 'next/head'
import { Analytics } from '@vercel/analytics/react'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>NutriPlay — Learn to Eat Smart</title>
        <meta name="description" content="Learn to Eat Smart — One Bite at a Time! Interactive nutrition trivia game." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🥕</text></svg>" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
