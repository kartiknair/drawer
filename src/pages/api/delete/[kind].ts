import type { NextApiRequest, NextApiResponse } from 'next'

import { join } from 'path'
import { removeSync } from 'fs-extra'

type Response = {
  code: number
  message: string
}

export default function remove(
  req: NextApiRequest,
  res: NextApiResponse<Response>
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

  if (!kind || Array.isArray(kind)) {
    res.status(400).json({
      code: 400,
      message: 'You must provide the type of thing to be deleted.',
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

  let id = req.query.id
  if (!id || Array.isArray(id)) {
    res.status(400).json({
      code: 400,
      message: 'You must provide the id of the thing to be deleted.',
    })
    return
  }

  let path = ''
  if (kind === 'dir') {
    path = join(rootDir, 'directories', id)
  } else {
    let dir = req.query.dir
    if (Array.isArray(dir)) dir = dir.join('')

    path = dir
      ? join(rootDir, 'directories', dir, kind + 's', id)
      : join(rootDir, kind + 's', id)
  }

  try {
    removeSync(path)
    res.status(200).json({ code: 200, message: 'Deleted successfully.' })
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: 'Internal error while removing file/directory. ' + err,
    })
  }
}
