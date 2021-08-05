import { useState, useEffect } from 'react'

/**
 * Allows you to use a value and observe it changes at a specific delay instead
 * of immediately. Sourced from: https://usehooks.com/useDebounce/.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(
    () => {
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)
      // Cancel the timeout if value changes (also on delay change or unmount)
      return () => {
        clearTimeout(handler)
      }
    },
    [value, delay] // Only re-call effect if value or delay changes
  )
  return debouncedValue
}
