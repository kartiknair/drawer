const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { readFile } = require('fs')
const { resolve } = require('path')

if (process.argv[2] && process.argv[2] === '-production') {
  process.env['NODE_ENV'] = 'production'
}

require('dotenv').config({ path: resolve(process.cwd(), '.env.local') })

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // This server is used to host the image files from our storage directory
  createServer((req, res) => {
    readFile(process.env.STORAGE_DIRECTORY + req.url, (err, data) => {
      if (err) {
        res.writeHead(404)
        res.end(JSON.stringify(err))
        return
      }
      res.writeHead(200)
      res.end(data)
    })
  }).listen(8080)

  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`Ready on http://localhost:${port}`)
  })
})
