var documents = require('../documents.json')
var expected = require('../data/!idf-stem-rank-facets.json')

var options = {
  idf: false,
  stem: true,
  rank: true,
  facets: true
}

var inverted = process.env.INVERTED_COV ? require('../../lib-cov/inverted-index') : require('../../')
var timehat = require('timehat')
var level = require('level')(__dirname + '/../dbs/db-' + timehat())
var async = require('async')
var assert = require('assert')

var text = inverted(level, options)

var index = function(fn){
  async.forEach(Object.keys(documents), function(id, fn){
    text.index(documents[id].text, id, documents[id].facets, fn)
  }, fn)
}

var getAllKeys = function(fn){
  var keys = []

  level.createKeyStream()
  .on('error', fn)
  .on('data', function(key){
    keys.push([key, text.parseKey(key, true)])
  })
  .on('end', function(){
    fn(null, keys)
  })
}

module.exports = function(){
  before(index)

  after(function(fn){
    level.close(fn)
  })

  // describe('index', function(){
  //   it('should save the right keys', function(fn){
  //     getAllKeys(function(err, keys){
  //       if(err) return fn(err)
  //       assert(expected.keys.length === (keys.length - 10))
  //       assert(keys.filter(function(key){
  //         return expected.keys.indexOf(key[0]) >= 0
  //       }).length === (keys.length - 10))
  //       fn()
  //     })
  //   })
  // })

  describe('query', function(){
    it('with limit', function(fn){
      text.query('Node.js', {
        limit: 1
      }, function(err, result){
        assert(!err)
        assert(result.results.length === 1)
        var first = result.results[0]
        text.query({
          last: result.last
        }, {
          limit: 1
        }, function(err, result){
          if(err) throw err
          assert(result.results[0] !== first)
          assert(result.results.length === 1)
          fn()
        })
      })
    })

    it('with one facet', function(fn){
      text.query('webos', 'article', function(err, result){
        assert(!err)
        assert(result.last.length)
        assert(result.results.length === 2)
        assert(result.results[0] === '6')
        assert(result.results[1] === '7')
        fn()
      })
    })

    it('with more than one facet', function(fn){
      text.query('node.js', ['library', 'comment'], function(err, result){
        assert(!err)
        assert(result.last.length)
        assert(result.results.length === 2)
        assert(result.results[0] === '5')
        assert(result.results[1] === '4')
        fn()
      })
    })

    it('without facets', function(fn){
      text.query('webos', function(err, result){
        assert(!err)
        assert(result.last.length)
        assert(result.results.length === 2)
        assert(result.results[0] === '6')
        assert(result.results[1] === '7')
        fn()
      })
    })

    it('with options and facets', function(fn){
      text.query('webos', 'article', {
        limit: 1,
        ttl: 1
      }, function(err, result){
        assert(!err)
        assert(result.last.length)
        assert(result.results.length === 1)
        assert(result.results[0] === '6')
        fn()
      })
    })
  })

  describe('remove', function(){
    it('should remove', function(fn){
      text.remove('2', fn)
    })

    it('should not have any keys from removed id', function(fn){
      getAllKeys(function(err, keys){
        assert(!err)
        assert(expected.keys.length !== keys.length)
        assert(keys.filter(function(key){
          return key[1].id === '2'
        }).length === 0)

        fn()
      })
    })

    it('should return 0 results', function(fn){
      text.query('vehicula', function(err, result){
        assert(!err)
        assert(!result.results.length)
        fn()
      })
    })
  })
}