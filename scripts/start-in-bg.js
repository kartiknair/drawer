#!/usr/bin/env node
const { openSync } = require('fs')
const spawn = require('cross-spawn')
const { join, resolve } = require('path')

require('dotenv').config({ path: resolve(process.cwd(), '.env.local') })

if (!process.env.STORAGE_DIRECTORY) {
  console.error('STORAGE_DIRECTORY environment variable not set')
  process.exit(1)
}

const logFile = openSync(
  join(process.env.STORAGE_DIRECTORY, 'bg-process.log'),
  'a'
)

spawn.sync('next', ['build'], { stdio: 'inherit' })

const serverProcess = spawn('node', ['server.js', '-production'], {
  stdio: ['ignore', logFile, logFile],
  detached: true,
})

console.log(`Started server process [PID: ${serverProcess.pid}]`)
serverProcess.unref()
