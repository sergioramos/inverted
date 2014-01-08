describe('idf-stem-rank-facets', require('./specs/idf-stem-rank-facets.js'))
// var documents = require('./documents.json')
//
// var options = {
//   idf: true,
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
//   text.remove('2', function(err){
//     assert(!err)
//     text.query('vehicula', function(err, result){
//       assert(!err)
//       console.log(result.results)
//       assert(!result.results.length)
//     })
//   })
// })