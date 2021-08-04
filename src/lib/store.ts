import { join, basename, extname } from 'path'
import {
  readFileSync,
  readdirSync,
  ensureDirSync,
  statSync,
  Dir,
  writeFileSync,
} from 'fs-extra'
import { nanoid } from 'nanoid'

export type ID = string

export type Note = {
  id: ID

  title: string
  content: string
  // `lastModified` is of type `number` to make serialization easier. It is meant
  // to represent a unix timestamp (i.e. what you get when you run `Date.now()`).
  lastModified: number
}

export type Link = {
  id: ID

  url: string
  lastModified: number
}

export type Image = {
  id: ID

  src: string
  lastModified: number
}

export type Directory = {
  id: ID

  name: string
  lastModified: number

  notes: Note[]
  links: Link[]
  images: Image[]
}

export type Store = {
  directories: Directory[]
  notes: Note[]
  links: Link[]
  images: Image[]
}

export function parseNoteFromFile(path: string): Note {
  // Notes are stored as plain .txt files, with the first line always being the title.
  const fileInfo = statSync(path)
  const fileName = basename(path)
  const lastModified = fileInfo.mtime.getDate()
  const fileContents = readFileSync(path, 'utf-8')
  const title = fileContents.split('\n')[0]
  const content = fileContents.slice(title.length + 1)
  return {
    id: fileName,
    title,
    content,
    lastModified,
  }
}

export function parseLinkFromFile(path: string): Link {
  // Links are also plain text but the entire file is just the url.
  const fileInfo = statSync(path)
  const fileName = basename(path)
  const lastModified = fileInfo.mtime.getDate()
  const url = readFileSync(path, 'utf-8')
  return { id: fileName, url, lastModified }
}

export function parseImageFromFile(path: string): Image {
  // Images are saved as either .jpg or .png (based on the upload) and
  // then read and sent back as a base64 URL.
  const fileInfo = statSync(path)
  const fileName = basename(path)
  const lastModified = fileInfo.mtime.getDate()
  const src = readFileSync(path, 'base64')
  return {
    id: fileName,
    src: 'data:' + extname(path).slice(1) + ';base64,' + src,
    lastModified,
  }
}

export function parseDirectory(path: string): Directory {
  const dirInfo = statSync(path)

  const id = basename(path)
  const lastModified = dirInfo.mtime.getDate()

  const name = readFileSync(join(path, 'name'), 'utf8')

  const notesRaw = readdirSync(join(path, 'notes'))
  const linksRaw = readdirSync(join(path, 'links'))
  const imagesRaw = readdirSync(join(path, 'images'))

  let notes: Note[] = []
  let links: Link[] = []
  let images: Image[] = []

  notes = notesRaw.map((noteFile) =>
    parseNoteFromFile(join(path, 'notes', noteFile))
  )
  links = linksRaw.map((linkFile) =>
    parseLinkFromFile(join(path, 'links', linkFile))
  )
  images = imagesRaw.map((imageFile) =>
    parseImageFromFile(join(path, 'images', imageFile))
  )

  return { name, id, lastModified, notes, links, images }
}

export function parseStore(path: string): Store {
  const notesRaw = readdirSync(join(path, 'notes'))
  const linksRaw = readdirSync(join(path, 'links'))
  const imagesRaw = readdirSync(join(path, 'images'))
  const dirsRaw = readdirSync(join(path, 'directories'))

  const directories = dirsRaw.map((dir) =>
    parseDirectory(join(path, 'directories', dir))
  )
  const notes = notesRaw.map((noteFile) =>
    parseNoteFromFile(join(path, 'notes', noteFile))
  )
  const links = linksRaw.map((linkFile) =>
    parseLinkFromFile(join(path, 'links', linkFile))
  )
  const images = imagesRaw.map((imageFile) =>
    parseImageFromFile(join(path, 'images', imageFile))
  )

  return { notes, links, images, directories }
}

export function ensureStore(path: string) {
  ensureDirSync(path)
  ensureDirSync(join(path, 'notes'))
  ensureDirSync(join(path, 'links'))
  ensureDirSync(join(path, 'images'))
  ensureDirSync(join(path, 'directories'))
}

export function createDirectory(name: string, rootDir: string): string {
  const dirId = nanoid()
  const dirPath = join(rootDir, dirId)

  ensureDirSync(dirPath)
  ensureDirSync(join(dirPath, 'notes'))
  ensureDirSync(join(dirPath, 'links'))
  ensureDirSync(join(dirPath, 'images'))

  writeFileSync(join(rootDir, dirId, 'name'), name)

  return dirId
}
