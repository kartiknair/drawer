/** @jsxImportSource @emotion/react */

import type { Note, Link, Image } from '../lib/store'

import NextLink from 'next/link'
import { css } from '@emotion/react'
import { useRouter } from 'next/router'
import * as Popover from '@radix-ui/react-popover'
import { useEffect, useState, useRef } from 'react'

import { truncate } from '../lib/utils'
import Input from '../components/input'
import { Pencil, Cross } from '../components/icons'

function EditableLink({
  link,
  revalidate,
}: {
  link: Link
  revalidate: () => Promise<void>
}) {
  const router = useRouter()
  const dirid = router.query.dirid

  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [newUrl, setNewUrl] = useState('')

  return (
    <div
      css={css`
        position: relative;

        button {
          opacity: 0;
          transition: all 200ms ease;
          background: none;
          border: none;
        }

        &:hover button,
        button:focus {
          opacity: 1;
        }
      `}
    >
      <button
        css={css`
          position: absolute;
          top: 1rem;
          right: 1rem;
        `}
        onClick={async () => {
          await fetch(
            `/api/delete/link?id=${link.id}${dirid ? `&dir=${dirid}` : ''}`
          )
          revalidate()
        }}
      >
        <Cross />
      </button>

      <div
        css={css`
          height: 2.5rem;
          margin-top: auto;
          border-top: 1px solid var(--grey-2);

          display: flex;
          align-items: center;
          padding: 0 1rem;

          a {
            font-style: italic;
            font-size: 0.8rem;
            color: var(--grey-3);
            text-decoration: none;
          }
        `}
      >
        <a className='mono' target='_blank' href={link.url}>
          {link.url}
        </a>
        <Popover.Root>
          <Popover.Trigger
            css={css`
              margin-left: auto;
            `}
          >
            <Pencil />
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
            <Popover.Arrow
              css={css`
                fill: var(--grey-1);
              `}
            />
            <Popover.Close style={{ display: 'none' }} ref={closeButtonRef} />
            <form
              onSubmit={async (e) => {
                e.preventDefault()

                if (closeButtonRef.current !== null) {
                  closeButtonRef.current.click()
                }

                await fetch(
                  `/api/new/link?id=${link.id}${dirid ? `&dir=${dirid}` : ''}`,
                  {
                    method: 'POST',
                    body: newUrl,
                  }
                )

                revalidate()
              }}
            >
              <Input
                type='url'
                placeholder='https://example.com'
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </form>
          </Popover.Content>
        </Popover.Root>
      </div>
    </div>
  )
}

export default function EditableItems({
  notes,
  links,
  images,
  revalidate,
}: {
  notes: Note[]
  links: Link[]
  images: Image[]
  revalidate: () => Promise<void>
}) {
  const router = useRouter()
  const [items, setItems] = useState<(Note | Link | Image)[]>([])

  useEffect(() => {
    let newItems = [...notes, ...links, ...images]
    setItems(newItems.sort((a, b) => b.lastModified - a.lastModified))
  }, [notes, links, images])

  const dirid = router.query.dirid

  return (
    <div
      css={css`
        display: grid;
        grid-template-columns: repeat(auto-fill, 15rem);
        grid-gap: 1rem;
        justify-content: space-between;

        & > div {
          width: 15rem;
          height: 15rem;
          border-radius: 0.25rem;
          border: 1px solid var(--grey-2);
          display: flex;
          flex-direction: column;
        }
      `}
    >
      {items.map((item) => {
        if (item.hasOwnProperty('url')) {
          let link = item as Link
          return (
            <EditableLink link={link} key={link.id} revalidate={revalidate} />
          )
        } else if (item.hasOwnProperty('src')) {
          let image = item as Image
          return (
            <div
              key={image.id}
              css={css`
                overflow: hidden;
                position: relative;

                button {
                  width: 1.5rem;
                  height: 1.5rem;
                  border-radius: 0.25rem;
                  display: flex;
                  justify-content: center;
                  align-items: center;

                  background: var(--grey-1);
                  color: var(--grey-3);
                  border: none;

                  position: absolute;
                  top: 1rem;
                  right: 1rem;
                  opacity: 0;
                  transition: all 200ms ease;
                }

                &:hover button,
                button:focus {
                  opacity: 1;
                }

                img {
                  height: 100%;
                }
              `}
            >
              <img style={{ maxWidth: '400px' }} src={image.src} />
              <button
                onClick={async () => {
                  await fetch(
                    `/api/delete/image?id=${image.id}${
                      dirid ? `&dir=${dirid}` : ''
                    }`
                  )
                  revalidate()
                }}
              >
                <Cross />
              </button>
            </div>
          )
        } else {
          let note = item as Note
          return (
            <div
              key={note.id}
              css={css`
                position: relative;

                a {
                  margin: 1.5rem;
                  text-decoration: none;
                }

                p {
                  font-style: italic;
                  color: var(--grey-3);
                  font-size: 0.8rem;
                  margin-top: 0.5rem;
                }

                button {
                  border: none;
                  background: none;
                  position: absolute;
                  top: 1rem;
                  right: 1rem;

                  opacity: 0;
                  transition: all 200ms ease;
                }

                &:hover button,
                button:focus {
                  opacity: 1;
                }
              `}
            >
              <NextLink href={`/note/${note.id}`}>
                <a>
                  <h4>{note.title}</h4>
                  <p className='mono'>{truncate(note.content, 35)}</p>
                </a>
              </NextLink>
              <button
                onClick={async () => {
                  const res = await fetch(
                    `/api/delete/note?id=${note.id}${
                      dirid ? `&dir=${dirid}` : ''
                    }`
                  )
                  const json = await res.json()
                  revalidate()
                }}
              >
                <Cross />
              </button>
            </div>
          )
        }
      })}
    </div>
  )
}
