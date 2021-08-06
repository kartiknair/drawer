/** @jsxImportSource @emotion/react */

import type { AppProps } from 'next/app'

import { Global, css } from '@emotion/react'

import Container from '../components/container'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Global
        styles={css`
          :root {
            --grey-1: #ffffff;
            --grey-2: #cccccc;
            --grey-3: #888888;
            --grey-4: #333333;
            --grey-5: #111111;
          }

          *,
          *::before,
          *::after {
            margin: 0;
            padding: 0;
          }
          html,
          body {
            width: 100%;
            font-size: 100%;
          }

          body {
            background: var(--grey-1);
            color: var(--grey-3);
            font-family: 'Inter', sans-serif;
          }

          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            font-weight: 400;
            color: var(--grey-4);
          }

          .mono {
            font-family: 'IBM Plex Mono', monospace;
          }
        `}
      />
      <Container>
        <Component {...pageProps} />
      </Container>
    </>
  )
}

export default MyApp
