'use strict'

const debug = require('debug')('nodedev:mttq')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('nodedev-db')

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

const settings = {
  port: 1883,
  backend
}

const config = {
  database: process.env.DB_NAME || 'nodedev',
  username: process.env.DB_USER || 'node',
  password: process.env.DB_PASS || 'nodedev',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: s => debug(s)
}

let Agent, Metric

const server = new mosca.Server(settings)

server.on('clientConnected', client => {
  debug(`Client Connected: ${client.id}`)
})

server.on('clientDisconnected', client => {
  debug(`Client Disconnected: ${client.id}`)
})

server.on('published', (packet, client) => {
  debug(`Received: ${packet.topic}`) // tipo de mensaje agent, metric
  debug(`Payload: ${packet.payload}`) //
})

server.on('ready', async () => {
  const services = await db(config).catch(handleFatalError)
  Agent = server.agent
  Metric = server.metric

  console.log(`${chalk.green('[nodedev-mttq]')} server is running`)
})

server.on('error', handleFatalError)

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit()
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
