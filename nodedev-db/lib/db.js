'use strict'

const Sequelize = require('sequelize')
const Op = Sequelize.Op

let sequelize = null

module.exports = function setupDatabase (config) {
  if (!sequelize) {
    config.operatorsAliases = Op // agregado para nao ter mesagem de deprecated
    sequelize = new Sequelize(config)
  }
  return sequelize
}
