import { useState, useEffect } from 'react'

// The resulting `.data` value is `null` only when the initial fetch is
// happening or when an error was caught (in which case `error` would be
// non-null).
export default function useFetch<T>(url: string): {
  data: T | null
  error: Error | null
  revalidate: () => Promise<void>
} {
  const [error, setError] = useState<Error | null>(null)
  const [value, setValue] = useState<T | null>(null)

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        setValue(json)
      })
      .catch((err) => {
        setError(err)
      })
  }, [url])

  async function revalidate() {
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        setValue(json)
      })
      .catch((err) => {
        setError(err)
      })
  }

  return { data: value, error, revalidate }
}
