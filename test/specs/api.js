if(process.env['INVERTED_COV']) var inverted = require('../../src-cov/inverted')
else var inverted = require('../../')

var type = require('type-component'),
    utils = require('../utils'),
    chai = require('chai'),
    index = utils.index()

var assert = chai.assert
var expect = chai.expect

test('api', function () {
  assert.ok(inverted)
  assert.ok(index)
  
  assert.ok(index.startsWith)
  assert.ok(index.engine)
  assert.ok(index.put)
  assert.ok(index.get)
  assert.ok(index.all)

  expect(type(inverted)).to.equal('function')
  expect(type(index.startsWith)).to.equal('function')
  expect(type(index.engine)).to.equal('object')
  expect(type(index.put)).to.equal('function')
  expect(type(index.get)).to.equal('function')
  expect(type(index.all)).to.equal('function')
  
  index.close()
})