/** @jsxImportSource @emotion/react */

import type { Metadata } from 'metascraper'
import type { Note, Link, Image } from '../lib/store'

import NextLink from 'next/link'
import { css } from '@emotion/react'
import useSWR, { mutate } from 'swr'
import { useRouter } from 'next/router'
import * as Dialog from '@radix-ui/react-dialog'
import * as Popover from '@radix-ui/react-popover'
import { useEffect, useState, useRef } from 'react'

import { truncate, truncateWords } from '../lib/utils'
import Input from '../components/input'
import { Pencil, Cross } from '../components/icons'

const smallLightGreyItalicText = css`
  font-style: italic;
  font-size: 0.8rem;
  color: var(--grey-3);
`

function EditableLink({ link }: { link: Link }) {
  const router = useRouter()
  const dirid = router.query.dirid

  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const [newUrl, setNewUrl] = useState('')
  const { data: metadata } = useSWR<Metadata>(
    `/api/meta?url=${encodeURIComponent(link.url)}`
  )

  return (
    <div
      css={css`
        position: relative;

        button {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 0.25rem;

          display: flex;
          justify-content: center;
          align-items: center;

          opacity: 0;
          transition: all 200ms ease;
          background: var(--grey-1);
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
          mutate('/api/store')
        }}
      >
        <Cross />
      </button>

      <div
        css={css`
          padding: ${metadata?.image ? '0' : '1.5rem'};
          height: 12.5rem;
          overflow: hidden;

          background-image: ${metadata?.image
            ? `url(${metadata.image})`
            : 'none'};
          background-repeat: no-repeat;
          background-size: auto 12.5rem;
          background-position: center;

          img {
            justify-self: center;
            height: 12.5rem;
          }

          p {
            ${smallLightGreyItalicText}
            margin-top: 0.5rem;
          }
        `}
      >
        {metadata && !metadata.image && (
          <>
            <h4>{metadata.title}</h4>
            <p className='mono'>{metadata.description}</p>
          </>
        )}
      </div>

      <div
        css={css`
          height: 2.5rem;
          border-top: 1px solid var(--grey-2);

          display: flex;
          align-items: center;
          padding: 0 1rem;

          a {
            ${smallLightGreyItalicText}
            text-decoration: none;
          }
        `}
      >
        <a className='mono' target='_blank' href={link.url}>
          {truncate(link.url, 25)}
        </a>
        <Popover.Root>
          <Popover.Trigger
            css={css`
              position: absolute;
              bottom: 0.5rem;
              right: 0.5rem;
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

                mutate('/api/store')
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
}: {
  notes: Note[]
  links: Link[]
  images: Image[]
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
          return <EditableLink link={link} key={link.id} />
        } else if (item.hasOwnProperty('src')) {
          let image = item as Image
          return (
            <div
              key={image.id}
              css={css`
                overflow: hidden;
                position: relative;

                &:focus-within {
                  box-shadow: 0 0 0 0.25rem rgba(0, 0, 0, 0.05);
                }

                &:hover .close-button {
                  opacity: 1;
                }
              `}
            >
              <Dialog.Root>
                <Dialog.Trigger
                  css={css`
                    display: block;
                    width: 100%;
                    height: 100%;
                    border: none;
                    padding: none;

                    &:focus {
                      outline: none;
                    }

                    img {
                      height: 100%;
                    }
                  `}
                >
                  <img src={image.src} />
                </Dialog.Trigger>
                <Dialog.Overlay
                  css={css`
                    background: rgba(0, 0, 0, 0.1);
                    backdrop-filter: blur(0.2rem);
                    position: fixed;
                    inset: 0;
                  `}
                ></Dialog.Overlay>
                <Dialog.Content
                  css={css`
                    border-radius: 0.5rem;

                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);

                    img {
                      height: 80vh;
                    }
                  `}
                >
                  <img src={image.src} />
                  <Dialog.Close
                    css={css`
                      border: none;
                      padding: 0;

                      width: 1.5rem;
                      height: 1.5rem;
                      border-radius: 0.25rem;
                      display: flex;
                      justify-content: center;
                      align-items: center;

                      position: absolute;
                      top: 1rem;
                      right: 1rem;
                      background: none;
                      color: var(--grey-3);

                      &:focus {
                        outline: none;
                      }

                      &:hover,
                      &:focus {
                        background: var(--grey-1);
                      }
                    `}
                  >
                    <Cross />
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Root>

              <button
                className='close-button'
                css={css`
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

                  &:focus {
                    opacity: 1;
                  }
                `}
                onClick={async () => {
                  await fetch(
                    `/api/delete/image?id=${image.id}${
                      dirid ? `&dir=${dirid}` : ''
                    }`
                  )
                  mutate('/api/store')
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
                  ${smallLightGreyItalicText}
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
                  <p className='mono'>{truncateWords(note.content, 25)}</p>
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
                  mutate('/api/store')
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
