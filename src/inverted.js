var without = require('lodash').without,
    through = require('through'),
    levelup = require('levelup'),
    async = require('async'),
    path = require('path'),
    put = require('./put')

var inverted = function (engine) {
  this.queue = async.queue(put.bind(this), 1)
  this.engine = engine
}

inverted.prototype.put = function (values, key, callback) {
  this.queue.push({
    keys: values,
    value: key
  }, callback)
}

inverted.prototype.all = function () {
  return this.engine.readStream()
}

inverted.prototype.startsWith = function (key) {
  var stream = this.engine.readStream({start: key})
  
  return stream.pipe(through(function (data) {
    if(data.key.indexOf(key) !== 0) return stream.destroy()
    this.emit('data', data)
  }, function () {
    this.emit('end')
  }))
}

inverted.prototype.get = function (key) {
  return this.engine.readStream({start: key, end: key})
}

inverted.prototype.del = function (values, key, callback) {
  var engine = this.engine
  async.forEach(values, function (value, callback) {
    engine.get(value, function (e, values) {
      if(e && e.name != 'NotFoundError') return callback(e)
      if(!values) return callback()
      values = without(values, key)
      engine.put(value, values, callback)
    })
  }, callback)
}

inverted.prototype.close = function (callback) {
  this.engine.close(callback)
}

module.exports = function (location) {
  var db = levelup(path.normalize(location), {
    createIfMissing: true,
    valueEncoding: 'json',
    keyEncoding: 'utf8'
  })

  return new inverted(db)
}