/** @jsxImportSource @emotion/react */

import type { AppProps } from 'next/app'

import { SWRConfig } from 'swr'
import { Global, css } from '@emotion/react'
import { IdProvider } from '@radix-ui/react-id'

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

            --font-sans: 'Inter', sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
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
            font-family: var(--font-sans);
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

          // Scrollbar
          body::-webkit-scrollbar {
            width: 0.5rem;
          }

          body::-webkit-scrollbar-track {
            background: var(--grey-1);
          }

          body::-webkit-scrollbar-thumb {
            width: 100%;
            background: var(--grey-2);
            border-radius: 1rem;
          }

          // Proesemirror
          .ProseMirror-focused {
            outline: none;
          }
          .ProseMirror .is-editor-empty:first-of-type::before {
            content: attr(data-placeholder);
            float: left;
            color: inherit;
            opacity: 0.5;
            pointer-events: none;
            height: 0;
          }
        `}
      />
      <IdProvider>
        <SWRConfig
          value={{
            fetcher: (url) => fetch(url).then((res) => res.json()),
          }}
        >
          <Container>
            <Component {...pageProps} />
          </Container>
        </SWRConfig>
      </IdProvider>
    </>
  )
}

export default MyApp
