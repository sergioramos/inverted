describe('idf-stem-rank-facets', require('./specs/idf-stem-rank-facets.js'))
describe('idf-stem-rank-!facets', require('./specs/idf-stem-rank-!facets.js'))
describe('idf-stem-!rank-facets', require('./specs/idf-stem-!rank-facets.js'))
describe('idf-stem-!rank-!facets', require('./specs/idf-stem-!rank-!facets.js'))
describe('idf-!stem-rank-facets', require('./specs/idf-!stem-rank-facets.js'))
describe('idf-!stem-rank-!facets', require('./specs/idf-!stem-rank-!facets.js'))
describe('idf-!stem-!rank-facets', require('./specs/idf-!stem-!rank-facets.js'))
//
// var documents = require('./documents.json')
//
// var options = {
//   idf: true,
//   stem: false,
//   rank: false,
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
//   text.query('webos', 'article', function(err, result){
//     assert(!err)
//     assert(result.last.length)
//     console.log(result.results)
//     assert(result.results.length === 2)
//     assert(!!~result.results.indexOf('4'))
//     assert(!!~result.results.indexOf('5'))
//   })
// })