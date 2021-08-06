import type { Store, Link as Link } from '../lib/store'

import NextLink from 'next/link'
import { useCallback, useRef, useState, useEffect } from 'react'
import * as Popover from '@radix-ui/react-popover'

import useFetch from '../lib/use-fetch'

function EditableLink({
  link,
  revalidate,
}: {
  link: Link
  revalidate: () => Promise<void>
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [newUrl, setNewUrl] = useState('')

  return (
    <div>
      <a target='_blank' href={link.url}>
        {link.url}
      </a>
      <button
        onClick={async () => {
          await fetch(`/api/delete/link?id=${link.id}`)
          revalidate()
        }}
      >
        Delete
      </button>
      <Popover.Root>
        <Popover.Trigger>Edit</Popover.Trigger>
        <Popover.Content>
          <Popover.Close style={{ display: 'none' }} ref={closeButtonRef} />
          <form
            onSubmit={async (e) => {
              e.preventDefault()

              if (closeButtonRef.current !== null) {
                closeButtonRef.current.click()
              }

              await fetch(`/api/new/link?id=${link.id}`, {
                method: 'POST',
                body: newUrl,
              })

              revalidate()
            }}
          >
            <input
              type='url'
              placeholder='new url here...'
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </form>
        </Popover.Content>
      </Popover.Root>
    </div>
  )
}

export default function Home() {
  const fileInput = useRef<HTMLInputElement | null>(null)
  const { data: store, error, revalidate } = useFetch<Store>('/api/store')

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
          const res = await fetch('/api/new/image', {
            method: 'POST',
            body: reader.result,
          })
          const json = await res.json()
          revalidate()
        })
      })

      fileInput.current = node
    }
  }, []) // adjust deps

  if (error) {
    return (
      <main>
        <h2>Oh no! We've had an error:</h2>
        <pre>{error}</pre>
      </main>
    )
  } else if (!store) {
    return <p>Loading...</p>
  }

  return (
    <main>
      <header>
        <input
          type='file'
          accept='image/*'
          ref={fileInputRef}
          style={{ display: 'none' }}
        />

        <button
          onClick={async () => {
            const res = await fetch('/api/new/note', {
              method: 'POST',
              body: 'Woah, a new note!',
            })
            const json = await res.json()
            revalidate()
          }}
        >
          + Note
        </button>

        <button
          onClick={async () => {
            const res = await fetch('/api/new/link', {
              method: 'POST',
              body: 'https://example.com',
            })
            const json = await res.json()
            revalidate()
          }}
        >
          + Link
        </button>

        <button
          onClick={async () => {
            if (fileInput.current === null) return
            fileInput.current.click()
          }}
        >
          + Image
        </button>
      </header>

      <h3>Notes</h3>
      {store.notes.map((note) => (
        <div key={note.id}>
          <h4>{note.title}</h4>
          <p>{note.content.slice(35)}</p>
          <button
            onClick={async () => {
              const res = await fetch(`/api/delete/note?id=${note.id}`)
              const json = await res.json()
              revalidate()
            }}
          >
            Delete
          </button>
          <NextLink href={`/note/${note.id}`}>
            <a>Edit</a>
          </NextLink>
        </div>
      ))}

      <h3>Links</h3>
      {store.links.map((link) => (
        <EditableLink link={link} key={link.id} revalidate={revalidate} />
      ))}

      <h3>Images</h3>
      {store.images.map((image) => (
        <div>
          <img style={{ maxWidth: '400px' }} src={image.src} key={image.id} />
          <button
            onClick={async () => {
              await fetch(`/api/delete/image?id=${image.id}`)
              revalidate()
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </main>
  )
}
