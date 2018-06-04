'use strict'

const agent = {
  id: 1,
  uuid: 'asd-asd-asd',
  name: 'fixture',
  username: 'nodedev',
  hostmane: 'test-host',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

const agents = [
  agent,
  extend(agent, { id: 2, uuid: 'wdas-dsa-sd', connected: false, username: 'test' }),
  extend(agent, { id: 3, uuid: 'yusb-dsa-sd' }),
  extend(agent, { id: 4, uuid: 'lkhg-dsa-sd', username: 'test3' })
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: agent,
  all: agents,
  connected: agents.filter(a => a.connected),
  node: agents.filter(a => a.username === 'node'),
  byUuid: id => agents.filter(a => a.uuid === id).shift(),
  byId: id => agents.filter(a => a.id).shift()
}
