var options = {
  idf: true,
  stem: true,
  rank: true,
  facets: true
}

var documents = require('../documents.json')
var timehat = require('timehat')
var level = require('level')(__dirname + '/../dbs/db-' + timehat())
var async = require('async')
var assert = require('assert')
var text = require('../../')(level, options, function(id, fn){
  fn(null, documents[id])
})

function query(err){
  if (err) throw err
  var time = process.hrtime()
  text.query('webos', function(err, results){
    var diff = process.hrtime(time)
    var took = diff[0] * 1e9 + diff[1]
    console.log(documents[results.results[0]])
    console.log('took: %d', took*1e-9)
    process.exit()
  })
}

function indexed(err){
  assert(!err)

  // level.createKeyStream()
  // .on('error', indexed)
  // .on('data', console.log)
  // .on('end', query)
}

async.forEach(Object.keys(documents), function(id, fn){
  text.index(documents[id], id, fn)
}, query)