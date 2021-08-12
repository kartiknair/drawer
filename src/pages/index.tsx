/** @jsxImportSource @emotion/react */
import Link from 'next/link'
import { useState, useRef } from 'react'
import { css } from '@emotion/react'
import useSWR, { mutate } from 'swr'
import * as Popover from '@radix-ui/react-popover'

import type { Directory, Store } from '../lib/store'

import Header from '../views/header'
import Input from '../components/input'
import ConveyError from '../components/error'
import { Pencil, Cross } from '../components/icons'
import EditableItems from '../views/editable-items'

function EditableDirectory({ dir }: { dir: Directory }) {
  const [newName, setNewName] = useState(dir.name)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <div
      key={dir.id}
      css={css`
        display: block;

        width: 15rem;
        height: 5rem;
        border-radius: 0.25rem;
        border: 1px solid var(--grey-2);
        position: relative;

        button {
          cursor: pointer;
          background: none;
          border: none;

          opacity: 0;
          transition: all 200ms ease;
        }

        button:hover {
          background: var(--gray-4);
        }

        h4 {
          margin-top: 1.25rem;
          margin-left: 1.5rem;
          font-size: 0.9rem;
        }

        p {
          margin-top: 0.25rem;
          margin-left: 1.5rem;
          color: var(--grey-3);
          font-style: italic;
          font-size: 0.8rem;
        }

        &:hover button,
        button:focus {
          opacity: 1;
        }
      `}
    >
      <button
        onClick={async () => {
          await fetch(`/api/delete/dir?id=${dir.id}`)
          mutate('/api/store')
        }}
        css={css`
          position: absolute;
          top: 1rem;
          right: 1rem;
        `}
      >
        <Cross />
      </button>

      <Popover.Root>
        <Popover.Trigger
          css={css`
            position: absolute;
            top: 1rem;
            right: 3rem;
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

              await fetch(`/api/new/dir?id=${dir.id}&name=${newName}`)

              mutate('/api/store')
            }}
          >
            <Input
              type='text'
              placeholder='New name...'
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </form>
        </Popover.Content>
      </Popover.Root>

      <Link href={`/dir/${dir.id}`}>
        <a style={{ textDecoration: 'none' }}>
          <h4>{dir.name}</h4>{' '}
        </a>
      </Link>

      <p className='mono'>
        {dir.links.length + dir.notes.length + dir.images.length} items
      </p>
    </div>
  )
}

export default function Home() {
  const { data: store, error } = useSWR<Store>('/api/store')

  return (
    <>
      <Header dirid={undefined} />

      {error ? (
        <ConveyError error={error} />
      ) : !store ? (
        <p>Loading...</p>
      ) : (
        <>
          <div
            css={css`
              display: grid;
              grid-template-columns: repeat(auto-fill, 15rem);
              grid-gap: 1rem;
              justify-content: space-between;
              margin-bottom: 5rem;
            `}
          >
            {store.directories.map((dir) => (
              <EditableDirectory dir={dir} />
            ))}
          </div>

          <EditableItems
            notes={store.notes}
            links={store.links}
            images={store.images}
          />
        </>
      )}
    </>
  )
}
