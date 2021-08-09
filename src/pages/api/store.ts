import type { Store } from '../../lib/store'
import type { NextApiRequest, NextApiResponse } from 'next'

import { parseStore, ensureStore } from '../../lib/store'

export default function getStore(
  _req: NextApiRequest,
  res: NextApiResponse<Store | { code: number; message: string }>
) {
  if (!process.env.STORAGE_DIRECTORY) {
    res.status(400).json({
      code: 400,
      message: 'STORAGE_DIRECTORY environment variable not set.',
    })
    return
  }

  const rootDir = process.env.STORAGE_DIRECTORY
  ensureStore(rootDir)

  try {
    const store = parseStore(rootDir)
    res.status(200).json(store)
  } catch (err) {
    res
      .status(500)
      .json({ code: 500, message: 'Error while parsing store. ' + err })
  }
}
