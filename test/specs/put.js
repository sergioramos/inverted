if(process.env['INVERTED_COV']) var inverted = require('../../src-cov/inverted')
else var inverted = require('../../')

var difference = require('lodash').difference,
    cursor = require('levelup-cursor'),
    expect = require('chai').expect,
    utils = require('../utils'),
    async = require('async')

test('put', function (callback) {
  var page = function (page, index, callback) {
    var words = utils.book[page].toLowerCase().match(/\w+/g)
    index.put(words, page, function (e) {
      utils.error(e)
      var keys = []
      cursor(index.all()).each(function (key, value) {
        expect(value).to.have.length(1)
        expect(words).to.include(key)
        expect(value).to.include(page)
      }, function (e) {
        utils.error(e)
        index.close(callback)
      })
    })
  }
  
  var all = function () {
    var index = utils.index()
    utils.fill(index, utils.data, function (e) {
      utils.error(e)
      cursor(index.all()).each(function (key, value) {
        expect(utils.keys).to.include(key)
        value.forEach(function (page, i) {
          expect(utils[page]).to.include(key)
          value[i] = page.toString()
        })
        var inexistent = difference(utils.pages, value)
        inexistent.forEach(function (page) {
          expect(utils[page]).not.to.include(key)
        })
      }, function (e) {
        utils.error(e)
        index.close(callback)
      })
    })
  }
  
  async.forEachSeries(Object.keys(utils.book), function (n, callback) {
    page(n, utils.index(), callback)
  }, all)
})