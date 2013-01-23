var type = require('type-component'),
    unique = require('lodash').uniq,
    async = require('async')

module.exports = function (task, callback) {
  var self = this
  
  var queue = async.queue(function (task, callback) {
    self.engine.get(task.key, function (e, value) {
        if(e && e.name != 'NotFoundError') return callback(e)
      
        value = value || []
        value.push(task.value)
        value = unique(value)
      
        self.engine.put(task.key, value, callback)
      })
  }, 1)

  async.forEach(task.keys, function (key, callback) {
    if(type(key) == 'string') key = key.toLowerCase()
    queue.push({key: key, value: task.value}, callback)
  }, callback)
}