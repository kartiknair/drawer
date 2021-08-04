import type { Store } from '../lib/store'

import { useState, useEffect } from 'react'

export default function Home() {
  const [error, setError] = useState<string | null>(null)
  const [store, setStore] = useState<Store>({
    directories: [],
    notes: [],
    links: [],
    images: [],
  })

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/store')
      const json = await res.json()

      if (res.status !== 200) {
        setError(json.message)
        return
      }

      setStore(json as Store)
    })()
  }, [])

  if (error !== null) {
    return (
      <main>
        <h2>Oh no! We've had an error:</h2>
        <pre>{error}</pre>
      </main>
    )
  }

  return (
    <main>
      <pre>{JSON.stringify(store, null, 2)}</pre>
    </main>
  )
}
