if(process.env['INVERTED_COV']) var inverted = require('../../src-cov/inverted')
else var inverted = require('../../')

var cursor = require('levelup-cursor'),
    expect = require('chai').expect,
    utils = require('../utils'),
    async = require('async')

test('del', function (callback) {
  var onPage = function (index, words, page, callback) {
    index.del(words, page, function (e) {
      utils.error(e)
      index.all().pipe(cursor.each(function (key, value) {
        expect(value).to.not.include(page)
      }, callback))
    })
  }
  
  async.forEachSeries(Object.keys(utils.book), function (page, callback) {
    var words = utils.book[page].toLowerCase().match(/\w+/g)
    var index = utils.index()
    page = parseInt(page)
    
    utils.fill(index, utils.data, function () {
      onPage(index, words, page, function () {
        index.close(callback)
      })
    })
  }, callback)
})