import type { Directory, Store } from '../../lib/store'

import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

import useFetch from '../../lib/use-fetch'

import Header from '../../views/header'
import ConveyError from '../../components/error'
import EditableItems from '../../views/editable-items'

export default function DirectoryEditor() {
  const router = useRouter()

  const [dir, setDir] = useState<Directory | null>()
  const { data: store, error, revalidate } = useFetch<Store>('/api/store')

  useEffect(() => {
    if (store !== null)
      setDir(store.directories.find((dir) => dir.id === router.query.dirid))
  }, [router.query.dirid, store])

  return (
    <>
      <Header
        revalidate={revalidate}
        dirid={
          Array.isArray(router.query.dirid)
            ? router.query.dirid.join('')
            : router.query.dirid
        }
      />
      {error ? (
        <ConveyError error={error} />
      ) : !store ? (
        <p>Loading...</p>
      ) : !dir ? (
        <p>A directory with that ID doesn&apos;t exist.</p>
      ) : (
        <EditableItems
          notes={dir.notes}
          links={dir.links}
          images={dir.images}
          revalidate={revalidate}
        />
      )}
    </>
  )
}
