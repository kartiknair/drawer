import { useRouter } from 'next/router'
import { useCallback, useRef } from 'react'

export default function Header({
  revalidate,
}: {
  revalidate: () => Promise<void>
}) {
  const router = useRouter()
  let dir = router.query.dirid || ''

  const fileInput = useRef<HTMLInputElement | null>(null)

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
          await fetch(`/api/new/image${dir && `?dir=${dir}`}`, {
            method: 'POST',
            body: reader.result,
          })
          revalidate()
        })
      })

      fileInput.current = node
    }
  }, [])

  return (
    <header>
      <input
        type='file'
        accept='image/*'
        ref={fileInputRef}
        style={{ display: 'none' }}
      />

      <button
        onClick={async () => {
          await fetch(`/api/new/note${dir && `?dir=${dir}`}`, {
            method: 'POST',
            body: 'Woah, a new note!',
          })
          revalidate()
        }}
      >
        + Note
      </button>

      <button
        onClick={async () => {
          await fetch(`/api/new/link${dir && `?dir=${dir}`}`, {
            method: 'POST',
            body: 'https://example.com',
          })
          revalidate()
        }}
      >
        + Link
      </button>

      <button
        onClick={() => {
          if (fileInput.current === null) return
          fileInput.current.click()
        }}
      >
        + Image
      </button>

      {router.pathname === '/' && (
        <button
          onClick={async () => {
            await fetch('/api/new/dir?name=Untitled')
            revalidate()
          }}
        >
          + Directory
        </button>
      )}
    </header>
  )
}
