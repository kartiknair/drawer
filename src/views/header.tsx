/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useRef, useState, useEffect } from 'react'

import Button from '../components/button'

export default function Header({
  revalidate,
}: {
  revalidate: () => Promise<void>
}) {
  const router = useRouter()
  const [dirname, setDirname] = useState('')

  useEffect(() => {
    if (router.query.dirid) {
      ;(async () => {
        const res = await fetch(`/api/dirname/${router.query.dirid}`)
        const json = await res.json()
        if (res.status === 200) {
          setDirname(json.name)
        } else {
          setDirname('Error')
        }
      })()
    }
  }, [router])

  const fileInput = useRef<HTMLInputElement | null>(null)

  const fileInputRef = useCallback((node) => {
    if (node !== null) {
      node.addEventListener('change', (e: Event) => {
        if (!e.target) return
        let fileTarget = e.target as HTMLInputElement
        if (!fileTarget.files) return

        let file = fileTarget.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.addEventListener('load', async () => {
          await fetch(
            `/api/new/image${
              router.query.dirid ? `?dir=${router.query.dirid}` : ''
            }`,
            {
              method: 'POST',
              body: reader.result,
            }
          )
          revalidate()
        })
      })

      fileInput.current = node
    }
  }, [])

  return (
    <header
      css={css`
        display: flex;
        margin-bottom: 5rem;
      `}
    >
      <p
        css={css`
          font-family: var(--font-mono);
          color: var(--grey-3);
          font-size: 1rem;

          a {
            text-decoration: none;
          }

          .name {
            font-size: 0.9rem;
          }
        `}
      >
        <Link href='/'>
          <a>~</a>
        </Link>
        {router.query.dirid && <span className='name'> {dirname}</span>}
      </p>
      <input
        type='file'
        accept='image/*'
        ref={fileInputRef}
        style={{ display: 'none' }}
      />

      <Button
        css={css`
          margin-left: auto;
        `}
        onClick={async () => {
          await fetch(
            `/api/new/note${
              router.query.dirid ? `?dir=${router.query.dirid}` : ''
            }`,
            {
              method: 'POST',
              body: 'Untitled',
            }
          )
          revalidate()
        }}
      >
        + Note
      </Button>

      <Button
        css={css`
          margin-left: 1rem;
        `}
        onClick={async () => {
          await fetch(
            `/api/new/link${
              router.query.dirid ? `?dir=${router.query.dirid}` : ''
            }`,
            {
              method: 'POST',
              body: 'https://example.com',
            }
          )
          revalidate()
        }}
      >
        + Link
      </Button>

      <Button
        css={css`
          margin-left: 1rem;
        `}
        onClick={() => {
          if (fileInput.current === null) return
          fileInput.current.click()
        }}
      >
        + Image
      </Button>

      {router.pathname === '/' && (
        <Button
          css={css`
            margin-left: 1rem;
          `}
          onClick={async () => {
            await fetch('/api/new/dir?name=Untitled')
            revalidate()
          }}
        >
          + Directory
        </Button>
      )}
    </header>
  )
}
