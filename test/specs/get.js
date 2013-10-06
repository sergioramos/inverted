if(process.env['INVERTED_COV']) var inverted = require('../../src-cov/inverted')
else var inverted = require('../../')

var cursor = require('level-cursor'),
    expect = require('chai').expect,
    utils = require('../utils'),
    async = require('async'),
    index = utils.index()

before(function (callback) {
  utils.fill(index, utils.data, callback)
})

test('get', function (callback) {
  async.forEach(utils.keys, function (word, callback) {
    cursor(index.get(word)).each(function (key, value, data) {
      expect(key).to.equal(word)
      value.forEach(function (page) {
        var words = utils.book[page].toLowerCase().match(/\w+/g)
        expect(words.indexOf(word)).be.at.least(0)
      })
    }, callback)
  }, function (e) {
    utils.error(e)
    index.close(callback)
  })
})