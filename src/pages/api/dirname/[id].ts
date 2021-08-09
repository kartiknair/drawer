import { readFileSync } from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'

import { join } from 'path'

type Error = {
  code: number
  message: string
}

type Success = {
  name: string
}

export default function getDirnameFromDirid(
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

  let id = req.query.id

  if (!id || Array.isArray(id)) {
    res.status(400).json({
      code: 400,
      message: 'You must provide the id of the directory.',
    })
    return
  }

  const rootDir = process.env.STORAGE_DIRECTORY
  const dirPath = join(rootDir, 'directories', id)
  try {
    const name = readFileSync(join(dirPath, 'name'), 'utf-8')
    res.status(200).json({ name })
  } catch (err) {
    if (err.code === 'ENOENT') {
      res
        .status(404)
        .json({ code: 404, message: 'A directory with that id was not found.' })
    } else {
      res.status(500).json({ code: 500, message: 'Internal error. ' + err })
    }
  }
}
