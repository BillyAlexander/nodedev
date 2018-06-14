'use strict'

const debug = require('debug')('nodedev:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const argv = require('yargs').argv
const db = require('./')

const prompt = inquirer.createPromptModule()
async function setup () {
  if (!argv.y) {
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy your databsae, are you sure?'
      }
    ])
    if (!answer.setup) {
      returnconsole.log('Nothing happened :)')
    }
  }

  const config = {
    database: process.env.DB_NAME || 'nodedev',
    username: process.env.DB_USER || 'node',
    password: process.env.DB_PASS || 'nodedev',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
    // operatorsAliases: false
  }
  await db(config).catch(handleFatalError)

  console.log('Create BD Succes!')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
