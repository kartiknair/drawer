/** @jsxImportSource @emotion/react */

import type { Store, Note } from '../../lib/store'

import { css } from '@emotion/react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

import Text from '@tiptap/extension-text'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import { useEditor, EditorContent } from '@tiptap/react'

import Header from '../../views/header'
import ConveyError from '../../components/error'

import useFetch from '../../lib/use-fetch'
import useDebounce from '../../lib/use-debounce'

function convertTextToHTML(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      if (line === '\n') return '<p></p>'
      else return `<p>${line}</p>`
    })
    .join('')
}

function convertHTMLToText(html: string): string {
  return html
    .replaceAll('<p></p>', '\n')
    .replaceAll('<p>', '')
    .replaceAll('</p>', '\n')
}

function Editor({
  title,
  setTitle,
  content,
  setContent,
}: {
  title: string
  setTitle: (newTitle: string) => void
  content: string
  setContent: (newContent: string) => void
}) {
  const titleEditor = useEditor({
    content: convertTextToHTML(title),
    extensions: [
      Document.extend({ content: 'paragraph' }),
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: 'Note title...',
      }),
    ],
    onUpdate: ({ editor: newEditor }) => {
      setTitle(convertHTMLToText(newEditor.getHTML()))
    },
  })

  const contentEditor = useEditor({
    content: convertTextToHTML(content),
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: 'Your thoughts...',
      }),
    ],
    onUpdate: ({ editor: newEditor }) => {
      setContent(convertHTMLToText(newEditor.getHTML()))
    },
  })

  return (
    <>
      <EditorContent
        editor={titleEditor}
        css={css`
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--grey-4);
          margin-bottom: 2.5rem;
        `}
      />
      <EditorContent editor={contentEditor} />
    </>
  )
}

export default function NoteEditor() {
  const router = useRouter()

  const { data: store, error, revalidate } = useFetch<Store>('/api/store')
  const [note, setNote] = useState<Note>({
    id: '',
    content: '',
    title: '',
    lastModified: 0,
  })
  const [dirid, setDirid] = useState<string>('')

  const [title, setTitle] = useState<string | null>(null)
  const [content, setContent] = useState<string | null>(null)

  const debouncedTitle = useDebounce(title, 600)
  const debouncedContent = useDebounce(content, 600)

  useEffect(() => {
    if (content === null || title === null) {
      if (!store) return

      let foundNote = store.notes.find((n) => n.id === router.query.noteid)

      if (!foundNote) {
        for (let dir of store.directories) {
          foundNote = dir.notes.find((n) => n.id === router.query.noteid)
          if (foundNote) {
            setDirid(dir.id)
            break
          }
        }
      }

      if (foundNote) {
        setNote(foundNote)
        // this only happens when we haven't initialized content/title yet
        if (content === null) setContent(foundNote.content)
        if (title === null) setTitle(foundNote.title)
      }
    }
  }, [router.query.noteid, store, content, title])

  useEffect(() => {
    if (
      debouncedContent !== null &&
      debouncedTitle !== null &&
      (note.content !== debouncedContent || note.title !== debouncedTitle)
    ) {
      fetch(
        `/api/new/note?id=${router.query.noteid}${
          dirid ? `&dir=${dirid}` : ''
        }`,
        {
          method: 'POST',
          body: debouncedTitle + '\n' + debouncedContent,
        }
      ).then(() => {
        console.log('auto saved')
        revalidate()
      })
    }
  }, [note, router.query.noteid, dirid, debouncedTitle, debouncedContent])

  return (
    <>
      <Header revalidate={revalidate} dirid={dirid} />

      {error ? (
        <ConveyError error={error} />
      ) : !store ? (
        <p>Loading...</p>
      ) : content === null || title === null ? (
        <p>404, a note with that id was not found</p>
      ) : (
        <Editor
          title={title}
          setTitle={setTitle}
          content={content}
          setContent={setContent}
        />
      )}
    </>
  )
}
