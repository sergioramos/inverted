//var Worker = require('webworker-threads').Worker
var level = require('level')(__dirname + '/../test/mytests')
var text = require('../')(level)
var async = require('async')
var stats = require('stats-lite')

var data = require('./data.json')

var max = 10000
var i = 0
var times = []

function doIT(fn){
  var time = process.hrtime()
  async.forEach(Object.keys(data), function(id, fn){
    text.index(data[id], id, fn)
  }, function(err){
    var diff = process.hrtime(time)
    var took = diff[0] * 1e9 + diff[1]
    times.push(took)
    if(((i / 1000) % 2) === 0) console.log('%d', i)
    //console.log('%d', i)
    fn(err)
  })
}

function done(){
  console.log('total: %d', stats.sum(times) * 1e-9)
  console.log('mean: %d', stats.mean(times) * 1e-9)
  console.log('median: %d', stats.median(times) * 1e-9)
  console.log('variance: %d', stats.variance(times) * 1e-9)
  console.log('standard deviation: %d', stats.stdev(times) * 1e-9) // A low standard deviation indicates that the data points tend to be very close to the mean (also called expected value); a high standard deviation indicates that the data points are spread out over a large range of values.
  console.log('50th percentile: %d', stats.percentile(times, 0.50) * 1e-9)
  console.log('60th percentile: %d', stats.percentile(times, 0.60) * 1e-9)
  console.log('70th percentile: %d', stats.percentile(times, 0.70) * 1e-9)
  console.log('80th percentile: %d', stats.percentile(times, 0.80) * 1e-9)
  console.log('90th percentile: %d', stats.percentile(times, 0.90) * 1e-9)
  console.log('99th percentile: %d', stats.percentile(times, 0.99) * 1e-9)
  process.exit()
}

function back(err){
  if(err) throw err
  if(i >= max) return done()
  i += 1
  doIT(back)
}

console.log('starting: INDEX*%d', max)
back()