'use strict'

const chalk = require('chalk')
const db = require('../')

async function run() {
    const config = {
        database: process.env.DB_NAME || 'nodedev',
        username: process.env.DB_USER || 'node',
        password: process.env.DB_PASS || 'nodedev',
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres'
      }
    const { agent, metric } = await db(config).catch(handleFatalError)

    const newagent = await agent.createOrUpdate ({
        uuid: 'asd-asd-asd',
        name: 'fixture',
        username: 'nodedev',
        hostname: 'test',
        pid: 1,
        connected: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).catch(handleFatalError)

    console.log('newagent') 
    console.log(newagent)

    const agents = await agent.findAll().catch(handleFatalError)
    console.log('agents') 
    console.log(agents)

    const metrics = await metric.findByAgentUuid().catch(handleFatalError)
    console.log('metrics') 
    console.log(metrics)

    const newmetric = await metric.create(newagent.uuid, {
        type: 'memory',
        value: '300'
    }).catch(handleFatalError)
    console.log('newmetric') 
    console.log(newmetric)

    const metricsByType = await metric.findByTypeAgentUuid( 'memory', newagent.uuid).catch(handleFatalError)
    console.log('metrics') 
    console.log(metricsByType)    
}

function handleFatalError(err) {
    console.error(`${chalk.red('[fatal error]')} ${err.message}`)
    console.error(err.stack)
    process.exit(1)
}

run()