/** @jsxImportSource @emotion/react */
import Link from 'next/link'
import { css } from '@emotion/react'
import useSWR, { mutate } from 'swr'

import type { Store } from '../lib/store'

import Header from '../views/header'
import { Cross } from '../components/icons'
import ConveyError from '../components/error'
import EditableItems from '../views/editable-items'

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

                    position: absolute;
                    top: 1rem;
                    right: 1rem;
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
                >
                  <Cross />
                </button>

                <Link href={`/dir/${dir.id}`}>
                  <a style={{ textDecoration: 'none' }}>
                    <h4>{dir.name}</h4>
                  </a>
                </Link>

                <p className='mono'>
                  {dir.links.length + dir.notes.length + dir.images.length}{' '}
                  items
                </p>
              </div>
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
