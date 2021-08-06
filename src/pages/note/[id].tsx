import type { Store, Note } from '../../lib/store'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/dist/client/router'

import useFetch from '../../lib/use-fetch'
import useDebounce from '../../lib/use-debounce'

const fetcher = (path: string) => fetch(path).then((res) => res.json())

export default function NoteEditor() {
  const router = useRouter()
  const id = router.query.id

  const { data: store, error, revalidate } = useFetch<Store>('/api/store')
  const [note, setNote] = useState<Note>({
    id: '',
    content: '',
    title: '',
    lastModified: 0,
  })

  const [title, setTitle] = useState<string | null>(null)
  const [content, setContent] = useState<string | null>(null)

  const debouncedTitle = useDebounce(title, 600)
  const debouncedContent = useDebounce(content, 600)

  useEffect(() => {
    if (!store) return

    const foundNote = store.notes.find((n) => n.id === id)

    if (foundNote) {
      setNote(foundNote)
      console.log(foundNote)
      // this only happens when we haven't initialized content/title yet
      if (content === null) setContent(foundNote.content)
      if (title === null) setTitle(foundNote.title)
    }
  }, [store])

  useEffect(() => {
    if (
      debouncedContent !== null &&
      debouncedTitle !== null &&
      (note.content !== debouncedContent || note.title !== debouncedTitle)
    ) {
      fetch(`/api/new/note?id=${id}`, {
        method: 'POST',
        body: debouncedTitle + '\n' + debouncedContent,
      }).then(() => {
        console.log('auto saved')
        revalidate()
      })
    }
  }, [debouncedTitle, debouncedContent])

  if (error) {
    return <pre>{JSON.stringify(error)}</pre>
  } else if (!store) {
    return <p>Loading...</p>
  } else if (content === null || title === null) {
    return <p>404, a note with that id was not found</p>
  }

  return (
    <div>
      <input
        type='text'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
        }}
      ></textarea>
    </div>
  )
}
