/** @jsxImportSource @emotion/react */

import Link from 'next/link'
import { css } from '@emotion/react'
import { useRouter } from 'next/router'
import * as Popover from '@radix-ui/react-popover'
import { useCallback, useRef, useState, useEffect } from 'react'

import Input from '../components/input'
import Button from '../components/button'

export default function Header({
  revalidate,
  dirid,
}: {
  revalidate: () => Promise<void>
  dirid: string | undefined
}) {
  const router = useRouter()
  const [dirname, setDirname] = useState('')
  const [inputUrl, setInputUrl] = useState('')

  useEffect(() => {
    if (dirid) {
      ;(async () => {
        const res = await fetch(`/api/dirname/${dirid}`)
        const json = await res.json()
        if (res.status === 200) {
          setDirname(json.name)
        } else {
          setDirname('Error')
        }
      })()
    }
  }, [dirid])

  const fileInput = useRef<HTMLInputElement | null>(null)
  const urlInputCloseButtonRef = useRef<HTMLButtonElement | null>(null)

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
          await fetch(`/api/new/image${dirid ? `?dir=${dirid}` : ''}`, {
            method: 'POST',
            body: reader.result,
          })
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
            color: inherit;
          }

          .name {
            font-size: 0.9rem;
          }
        `}
      >
        <Link href='/'>
          <a>~</a>
        </Link>
        {dirid && (
          <Link href={`/dir/${dirid}`}>
            <a className='name'> {dirname}</a>
          </Link>
        )}
      </p>

      {!router.pathname.startsWith('/note') && (
        <>
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
              const res = await fetch(
                `/api/new/note${dirid ? `?dir=${dirid}` : ''}`,
                {
                  method: 'POST',
                  body: 'Untitled',
                }
              )
              const json = await res.json()
              if (res.status === 200) {
                router.push(`/note/${json.id}`)
              }
            }}
          >
            + Note
          </Button>

          <Popover.Root>
            <Popover.Trigger
              as={Button}
              css={css`
                margin-left: 1rem;
              `}
            >
              + Link
            </Popover.Trigger>
            <Popover.Content
              css={css`
                border-radius: 0.25rem;
                padding: 0.5rem;
                background: var(--grey-1);
                box-shadow: 0px 0.8rem 2rem -0.8rem rgba(0, 0, 0, 0.35),
                  0px 0.8rem 1.5rem -1rem rgba(0, 0, 0, 0.15);
              `}
            >
              <Popover.Close
                style={{ display: 'none' }}
                ref={urlInputCloseButtonRef}
              />
              <form
                onSubmit={async (e) => {
                  e.preventDefault()

                  if (urlInputCloseButtonRef.current !== null) {
                    urlInputCloseButtonRef.current.click()
                  }

                  await fetch(`/api/new/link${dirid ? `?dir=${dirid}` : ''}`, {
                    method: 'POST',
                    body: inputUrl,
                  })
                  revalidate()
                }}
              >
                <Input
                  type='url'
                  placeholder='https://example.com'
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                />
              </form>
            </Popover.Content>
          </Popover.Root>

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
        </>
      )}
    </header>
  )
}
