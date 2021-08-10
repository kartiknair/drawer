import type { NextApiRequest, NextApiResponse } from 'next'

import metascraper, { Metadata } from 'metascraper'
import metascraperTitleRule from 'metascraper-title'
import metascraperDescriptionRule from 'metascraper-description'
import metascraperImageRule from 'metascraper-image'

type Error = {
  code: number
  message: string
}

export default async function getMetadata(
  req: NextApiRequest,
  res: NextApiResponse<Metadata | Error>
) {
  if (Array.isArray(req.query.url) || req.query.url === '') {
    res.status(400).json({
      code: 400,
      message: 'URL not provided, or was in invalid format.',
    })
    return
  }

  const url = decodeURIComponent(req.query.url)

  const scraper = metascraper([
    metascraperTitleRule(),
    metascraperDescriptionRule(),
    metascraperImageRule(),
  ])

  try {
    const fetchResponse = await fetch(url)
    const html = await fetchResponse.text()
    const data = await scraper({ html, url })
    res.status(200).json(data)
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({
        code: 500,
        message: 'Errored while fetching metadata for URL.' + err,
      })
  }
}
