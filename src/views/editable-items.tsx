import type { Note, Link, Image } from '../lib/store'

import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useState, useRef } from 'react'

import * as Popover from '@radix-ui/react-popover'

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
  const dirid = router.query.dirid

  return (
    <main>
      <h3>Notes</h3>
      {notes.map((note) => (
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
      {links.map((link) => (
        <EditableLink link={link} key={link.id} revalidate={revalidate} />
      ))}

      <h3>Images</h3>
      {images.map((image) => (
        <div key={image.id}>
          <img style={{ maxWidth: '400px' }} src={image.src} />
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
