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

let uuidArgs = {
  where: {
    uuid
  }
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  agentStup = {
    hasMany: sandbox.spy()
  }

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
