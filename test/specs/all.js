if(process.env['INVERTED_COV']) var inverted = require('../../src-cov/inverted')
else var inverted = require('../../')

var cursor = require('level-cursor'),
    expect = require('chai').expect,
    utils = require('../utils'),
    index = utils.index()

before(function (callback) {
  utils.fill(index, utils.data, callback)
})

test('all', function (callback) {
  var data = {}
  var keys = []
  
  cursor(index.all()).each(function (key, value) {
    data[key] = value
    keys.push(key)
    
    value.forEach(function (page) {
      var words = utils.book[page].toLowerCase().match(/\w+/g)
      expect(words.indexOf(key)).be.at.least(0)
    })
  }, function (e) {
    utils.error(e)
    expect(Object.keys(data).length).to.equal(utils.keys.length)
    expect(keys.length).to.equal(utils.keys.length)
    keys.forEach(function (key) {
      expect(utils.kv[key]).to.eql(data[key])
      expect(utils.keys).to.include(key)
    })
    
    index.close(callback)
  })
})