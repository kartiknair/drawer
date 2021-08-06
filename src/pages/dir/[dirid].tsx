import type { Directory, Store } from '../../lib/store'

import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

import useFetch from '../../lib/use-fetch'

import Header from '../../views/header'
import EditableItems from '../../views/editable-items'

export default function DirectoryEditor() {
  const router = useRouter()

  const [dir, setDir] = useState<Directory | null>()
  const { data: store, error, revalidate } = useFetch<Store>('/api/store')

  useEffect(() => {
    if (store !== null)
      setDir(store.directories.find((dir) => dir.id === router.query.dirid))
  }, [store])

  if (error) {
    return (
      <main>
        <h2>Oh no! We've had an error:</h2>
        <pre>{error}</pre>
      </main>
    )
  } else if (!store) {
    return <p>Loading...</p>
  } else if (!dir) {
    return <p>A directory with that ID doesn't exist.</p>
  }

  return (
    <main>
      <Header revalidate={revalidate} />
      <EditableItems
        notes={dir.notes}
        links={dir.links}
        images={dir.images}
        revalidate={revalidate}
      />
    </main>
  )
}
