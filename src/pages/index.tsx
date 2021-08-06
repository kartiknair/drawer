import Link from 'next/link'

import type { Store } from '../lib/store'

import useFetch from '../lib/use-fetch'

import Header from '../views/header'
import EditableItems from '../views/editable-items'

export default function Home() {
  const { data: store, error, revalidate } = useFetch<Store>('/api/store')
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
      <Header revalidate={revalidate} />

      <h3>Directories</h3>
      {store.directories.map((dir) => (
        <div key={dir.id}>
          <h4>{dir.name}</h4>
          <p>{dir.links.length + dir.notes.length + dir.images.length} items</p>
          <Link href={`/dir/${dir.id}`}>
            <a>Open</a>
          </Link>
          <button
            onClick={async () => {
              await fetch(`/api/delete/dir?id=${dir.id}`)
              revalidate()
            }}
          >
            Delete
          </button>
        </div>
      ))}

      <EditableItems
        notes={store.notes}
        links={store.links}
        images={store.images}
        revalidate={revalidate}
      />
    </main>
  )
}
