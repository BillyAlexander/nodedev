'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const agentFixtures = require('./fixtures/agent')

let config = {
  logging: function () { }
}

let metricStub = {
  belongsTo: sinon.spy()
}

let single = Object.assign({}, agentFixtures.single)
let id = 1
let uuid = 'asd-asd-asd'
let agentStup = null
let db = null
let sandbox = null

let connectedArgs = {
  where: {
    connected: true
  }
}

let usernameArgs = {
  where: {
    username: 'nodedev',
    connected: true
  }
}

let uuidArgs = {
  where: {
    uuid
  }
}

let newAgent = {
  uuid: '123-123-123',
  name: 'test22',
  username: 'test22',
  hostname: 'test22',
  pid: 0,
  connected: false
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  agentStup = {
    hasMany: sandbox.spy()
  }

  // model create stub
  agentStup.create = sandbox.stub()
  agentStup.create.withArgs(newAgent).returns(Promise.resolve({ toJSON () { return newAgent } }))

  // model findAll stub
  agentStup.findAll = sandbox.stub()
  agentStup.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  agentStup.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  agentStup.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.nodedev))

  // model findOne Stub
  agentStup.findOne = sandbox.stub()
  agentStup.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // model indById stub
  agentStup.findById = sandbox.stub()
  agentStup.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))

  // model update stub
  agentStup.update = sandbox.stub()
  agentStup.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => agentStup,
    './models/metric': () => metricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test('Agent', t => {
  t.truthy(db.agent, 'Agent service shoul exist')
})

test.serial('Setup', t => {
  t.true(agentStup.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(agentStup.hasMany.calledWith(metricStub), 'Argument should be the metricmodel')
  t.true(metricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(metricStub.belongsTo.calledWith(agentStup), 'Argument should be the agentmodel')
})

test.serial('Agent#findById', async t => {
  let agent = await db.agent.findById(id)

  t.true(agentStup.findById.called, 'findById should be called on model')
  t.true(agentStup.findById.calledOnce, 'findById should be called once')
  t.true(agentStup.findById.calledWith(id), 'findById should be called with specified id')

  t.deepEqual(agent, agentFixtures.byId(id), 'Should be the same')
})

test.serial('Agent#createOrUpdate - exists', async t => {
  let agent = await db.agent.createOrUpdate(single)

  t.true(agentStup.findOne.called, 'findOne should be called on model')
  t.true(agentStup.findOne.calledTwice, 'findOne should be called twice')
  t.true(agentStup.update.calledOnce, 'update should be called once')

  t.deepEqual(agent, single, 'agent should be the same')
})

test.serial('Agent#createOrUpdate - new', async t => {
  let agent = await db.agent.createOrUpdate(newAgent)

  t.true(agentStup.findOne.called, 'findOne should be called on model')
  t.true(agentStup.findOne.calledOnce, 'findOne should be called once')
  t.true(agentStup.findOne.calledWith({
    where: { uuid: newAgent.uuid }
  }), 'findOne should be called with uuid args')
  t.true(agentStup.create.called, 'create should be called on model')
  t.true(agentStup.create.calledOnce, 'create should be called once')
  t.true(agentStup.create.calledWith(newAgent), 'create should be called with newAgent')

  t.deepEqual(agent, newAgent, 'agent should be the same')
})

test.serial('Agent#findConnected', async t => {
  let agents = await db.agent.findConnected()

  t.true(agentStup.findAll.called, 'findAll should be called on model')
  t.true(agentStup.findAll.calledOnce, 'findAll should be called once')
  t.true(agentStup.findAll.calledWith(connectedArgs), 'findAll should be called with connectedArgs')

  t.is(agents.length, agentFixtures.connected.length, 'agents should be the same')
  t.deepEqual(agents, agentFixtures.connected, 'agents shoul be the same')
})

test.serial('Agent#findAll', async t => {
  let agents = await db.agent.findAll()

  t.true(agentStup.findAll.called, 'findAll should be called on model')
  t.true(agentStup.findAll.calledOnce, 'findAll should be called once')
  t.true(agentStup.findAll.calledWith(), 'findAll should be called')

  t.is(agents.length, agentFixtures.all.length, 'agents should be the same ')
  t.deepEqual(agents, agentFixtures.all, 'agents shoul be the same')
})

test.serial('Agent#findByUserName', async t => {
  let agents = await db.agent.findByUserName('nodedev')

  t.true(agentStup.findAll.called, 'findAll should be called on model')
  t.true(agentStup.findAll.calledOnce, 'findAll should be called once')
  t.true(agentStup.findAll.calledWith(usernameArgs), 'findAll should be called withUsername')

  t.is(agents.length, agentFixtures.nodedev.length, 'agents should be the same ')
  t.deepEqual(agents, agentFixtures.nodedev, 'agents shoul be the same')
})
