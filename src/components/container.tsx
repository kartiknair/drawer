/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

export default function Container({ children }: { children: JSX.Element }) {
  return (
    <main
      css={css`
        width: 80%;
        margin: 5rem auto;
      `}
    >
      {children}
    </main>
  )
}
