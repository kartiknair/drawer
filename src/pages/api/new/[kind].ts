import type { NextApiRequest, NextApiResponse } from 'next'

import { join } from 'path'
import { nanoid } from 'nanoid'
import { writeFileSync } from 'fs-extra'

import { createDirectory, renameDirectory } from '../../../lib/store'

type Error = {
  code: number
  message: string
}

type Success = {
  id: string
}

export default function create(
  req: NextApiRequest,
  res: NextApiResponse<Success | Error>
) {
  if (!process.env.STORAGE_DIRECTORY) {
    res.status(400).json({
      code: 400,
      message: 'STORAGE_DIRECTORY environment variable not set.',
    })
    return
  }

  const rootDir = process.env.STORAGE_DIRECTORY

  let kind = req.query.kind

  if (!kind) kind = ''

  if (Array.isArray(kind)) {
    kind = kind.join('')
  } else if (kind === '') {
    res.status(400).json({
      code: 400,
      message: 'You must provide the type of thing to be created.',
    })
    return
  } else if (!['dir', 'note', 'link', 'image'].includes(kind)) {
    res.status(400).json({
      code: 400,
      message:
        'Provided type is unknown. Supported types are: `dir`, `note`, `link`, `image`.',
    })
    return
  }

  if (kind === 'dir') {
    let name = req.query.name
    if (Array.isArray(name)) name = name.join('')

    let existingId = req.query.id
    if (Array.isArray(existingId)) existingId = existingId.join('')

    if (!existingId && !name) {
      res.status(400).json({
        code: 400,
        message: 'Must provide either name or ID to create/rename directory.',
      })
    } else if (existingId && !name) {
      res.status(400).json({
        code: 400,
        message: 'Require query parameter name when renaming directory.',
      })
    } else if (!existingId && name) {
      try {
        const dirid = createDirectory(name, rootDir)
        res.status(200).json({ id: dirid })
      } catch (err) {
        res.status(500).json({
          code: 500,
          message: 'Internal error while creating directory: ' + err,
        })
      }
    } else {
      try {
        renameDirectory(existingId, name, rootDir)
        res.status(200).json({ id: existingId })
      } catch (err) {
        res.status(500).json({
          code: 500,
          message: 'Internal error while renaming directory: ' + err,
        })
      }
    }
  } else {
    let dir = req.query.dir

    if (Array.isArray(dir)) dir = dir.join('')

    let existingId = req.query.id
    if (Array.isArray(existingId)) existingId = existingId.join('')

    const newId = existingId || nanoid()
    let newFilesPath = ''
    let encoding: BufferEncoding = 'utf8'

    if (kind === 'note') {
      newFilesPath = !dir
        ? join(rootDir, 'notes', newId)
        : join(rootDir, 'directories', dir, 'notes', newId)
    } else if (kind === 'link') {
      newFilesPath = !dir
        ? join(rootDir, 'links', newId)
        : join(rootDir, 'directories', dir, 'links', newId)
    } else if (kind === 'image') {
      // e.g.
      //     data:image/png;base64,some/arbitrary/data/here
      //          ^^^^^^^^^
      const contentType = req.body.substring(
        req.body.indexOf(':') + 1,
        req.body.indexOf(';')
      )

      req.body = req.body.slice(req.body.indexOf(';') + 'base64'.length + 2)
      encoding = 'base64'

      const ext = contentType.split('/')[1]
      newFilesPath = !dir
        ? join(rootDir, 'images', newId + `.${ext}`)
        : join(rootDir, 'directories', dir, 'images', newId + `.${ext}`)
    }

    try {
      writeFileSync(newFilesPath, req.body, encoding)
      res.status(200).json({ id: newId })
    } catch (err) {
      res.status(500).json({
        code: 500,
        message: 'Internal error while writing to file:  ' + err,
      })
    }
  }
}

export const config = {
  api: {
    bodyParser: {
      // This is arbitrarily large since drawer is meant to be hosted
      // locally, network bandwidth doesn't really matter to us.
      sizeLimit: '1gb',
    },
  },
}
