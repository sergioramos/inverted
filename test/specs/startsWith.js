if(process.env['INVERTED_COV']) var inverted = require('../../src-cov/inverted')
else var inverted = require('../../')

var difference = require('lodash').difference,
    cursor = require('level-cursor'),
    expect = require('chai').expect,
    utils = require('../utils'),
    async = require('async'),
    index = utils.index()

before(function (callback) {
  utils.fill(index, utils.data, callback)
})

test('startsWith', function (callback) {
  async.forEachSeries(utils.keys, function (_word, callback) {
    var word = ''
    async.forEachSeries(_word.split(''), function (ch, callback) {
      word = word + ch
      cursor(index.startsWith(word)).each(function (key, value) {
        expect(key.indexOf(word)).to.equal(0)
      }, callback)
    }, callback)
  }, function (e) {
    utils.error(e)
    index.close(callback)
  })
})