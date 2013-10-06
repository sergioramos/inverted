if(process.env['INVERTED_COV']) var inverted = require('../src-cov/inverted')
else var inverted = require('../')

var type = require('type-component'),
    assert = require('chai').assert,
    crypto = require('crypto'),
    level = require('level'),
    async = require('async'),
    path = require('path')

// path for the dbs directory
var dbs = path.join(path.dirname(__filename), 'dbs')

// generate a hash from the current unix timestamp
var hash = function () {
  var timestamp = new Date().getTime().toString()
  return crypto.createHash('md5').update(timestamp, 'utf8').digest('hex')
}

module.exports.error = function (e) {
  assert.equal(e, null || undefined)
}

// create and return a new levelup instance
module.exports.index = function () {
  assert(type(inverted) == 'function')
  return inverted(level(path.join(dbs, hash()), {
    createIfMissing: true,
    valueEncoding: 'json',
    keyEncoding: 'utf8'
  }))
}

module.exports.fill = function (index, data, callback) {
  async.forEach(data, function (page, callback) {
    var words = page.text.toLowerCase().match(/\w+/g)
    index.put(words, page.page, callback)
  }, callback)
}

// require the data
module.exports.data = require('./data/data.json')
module.exports.book = require('./data/book.json')
module.exports.keys = require('./data/keys.json')
module.exports.kv = require('./data/kv.json')

module.exports.pages = Object.keys(module.exports.book)

Object.keys(module.exports.book).forEach(function (page) {
  module.exports[page] = module.exports.book[page].toLowerCase().match(/\w+/g)
})