describe('idf-stem-rank-facets', require('./specs/idf-stem-rank-facets.js'))
describe('idf-stem-rank-!facets', require('./specs/idf-stem-rank-!facets.js'))
describe('idf-stem-!rank-facets', require('./specs/idf-stem-!rank-facets.js'))
describe('idf-stem-!rank-!facets', require('./specs/idf-stem-!rank-!facets.js'))
describe('idf-!stem-rank-facets', require('./specs/idf-!stem-rank-facets.js'))
describe('idf-!stem-rank-!facets', require('./specs/idf-!stem-rank-!facets.js'))
describe('idf-!stem-!rank-facets', require('./specs/idf-!stem-!rank-facets.js'))
describe('idf-!stem-!rank-!facets', require('./specs/idf-!stem-!rank-!facets.js'))
describe('!idf-stem-rank-facets', require('./specs/!idf-stem-rank-facets.js'))
describe('!idf-stem-rank-!facets', require('./specs/!idf-stem-rank-!facets.js'))
describe('!idf-stem-!rank-facets', require('./specs/!idf-stem-!rank-facets.js'))
describe('!idf-stem-!rank-!facets', require('./specs/!idf-stem-!rank-!facets.js'))
describe('!idf-!stem-rank-facets', require('./specs/!idf-!stem-rank-facets.js'))
describe('!idf-!stem-rank-!facets', require('./specs/!idf-!stem-rank-!facets.js'))
describe('!idf-!stem-!rank-facets', require('./specs/!idf-!stem-!rank-facets.js'))
describe('!idf-!stem-!rank-!facets', require('./specs/!idf-!stem-!rank-!facets.js'))
// var documents = require('./documents.json')
//
// var options = {
//   idf: false,
//   stem: true,
//   rank: true,
//   facets: true
// }
//
// var timehat = require('timehat')
// var level = require('level')(__dirname + '/dbs/db-' + timehat())
// var async = require('async')
// var assert = require('assert')
//
// var text = require('../')(level, options, function(id, fn){
//   fn(null, documents[id].text)
// })
//
// var index = function(fn){
//   async.forEach(Object.keys(documents), function(id, fn){
//     text.index(documents[id].text, id, documents[id].facets, fn)
//   }, fn)
// }
//
// debugger
// index(function(err){
//   if(err) throw err
//   debugger
//   text.query('Node.js', {
//     limit: 1
//   }, function(err, result){
//     assert(!err)
//     assert(result.results.length === 1)
//     var first = result.results[0]
//     text.query({
//       last: result.last
//     }, {
//       limit: 1
//     }, function(err, result){
//       if(err) throw err
//       assert(result.results[0] !== first)
//       assert(result.results.length === 1)
//       process.exit()
//     })
//   })
// })