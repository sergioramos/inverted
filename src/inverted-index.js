try {
  require('longjohn')
} catch(err){}

var path = require('level-path')
var sift3 = require('sift3')
var cosine = require('cosine')
var natural = require('natural')
var type = require('type-component')
var uniq = require('lodash.uniq')
var async = require('async')
var bytewise = require('bytewise')
var interpolate = require('util').format
var through = require('through2')
var hex = require('bytewise/hex')
var atomic = require('atomic')
var xtend = require('xtend')
var timehat = require('timehat')
var ttl = require('level-ttl')
var stats = require('stream-statistics')

var tokenizer = new (natural.WordPunctTokenizer)()
var stopwords = natural.stopwords
var stemmer = natural.PorterStemmer

var dbOpts = {
  keyEncoding: 'utf8',
  valueEncoding: 'utf8'
}

var objectMode = {
  objectMode: true
}

var default_options = {
  idf: true,
  stem: true,
  rank: true,
  rank_algorithm: 'cosine',
  facets: true
}

var default_search_options = {
  limit: 100,
  ttl: 1000 * 60 * 60
}

var algorithms = {
  cosine: cosine,
  sift3: sift3
}

var inverted = module.exports = function(db, options, getter){
  if(!(this instanceof inverted)) return new inverted(db, options, getter)

  this.ttl_db = ttl(db)
  this.db = db

  this.put = this.link = this.index
  this.del = this.unlink = this.remove
  this.query = this.search
  this.lock = atomic()

  this.options = xtend(default_options, options)

  this.paths = {
    text: path('text/:id')
  }

  if(this.options.idf){
    this.paths.w_facet = path(':word/:facet/:idf/:id')
    this.paths.wo_facet = path(':word/:idf/:id')
  } else {
    this.paths.w_facet = path(':word/:facet/:id')
    this.paths.wo_facet = path(':word/:id')
  }

  if(this.options.facets){
    this.paths.by_id = path(':id/:word/:idf/:facet')
  } else {
    this.paths.by_id = path(':id/:word/:idf')
  }

  if(type(getter) !== 'function'){
    this.getter = function(id, fn){
      this.db.get(this.paths.text({
        id: id
      }), dbOpts, fn)
    }.bind(this)
  } else {
    this.getter = getter
    this.has_getter = true
  }

  if(this.options.rank_algorithm !== 'cosine'){
    this.algorithm = algorithms[this.options.rank_algorithm];
  } else {
    this.algorithm = function(a, b){
      if(type(a) !== 'array') a = this.parseText(a)
      if(type(b) !== 'array') b = this.parseText(b)
      return algorithms.cosine(a, b)
    }.bind(this)
  }

  this.stats = stats()
}

inverted.prototype.index = function(text, id, facets, fn){
  var self = this

  if(arguments.length < 3){
    throw new Error('text, id and callback arguments required')
  }

  if(type(facets) === 'function'){
    fn = facets
    facets = ['']
  }

  var batch = self.db.batch()
  var words = self.parseText(text, true)
  facets = self.parseFacets(facets)

  self.stats.write(words.length * facets.length)

  function onWord(word, fn){
    async.parallel([wFacet(word), woFacet(word)], fn)
  }

  function wFacet(word){
    return function(fn){
      async.forEach(facets, onFacet(word), fn)
    }
  }

  function onFacet(word){
    return function(facet, fn){
      var stack = [addWFacet(word, facet, self.paths.by_id)]

      if(self.options.facets){
        stack.push(addWFacet(word, facet, self.paths.w_facet))
      }

      async.parallel(stack, fn)
    }
  }

  function woFacet(word){
    return function(fn){
      batch.put(self.paths.wo_facet({
        word: word.word,
        idf: bytewise.encode(word.idf).toString('hex'),
        id: id
      }), id, dbOpts)
      fn()
    }
  }

  function addWFacet(word, facet, path){
    return function(fn){
      var key = path({
        word: word.word,
        idf: bytewise.encode(word.idf).toString('hex'),
        id: id,
        facet: facet
      })

      if(!facet.length && !key.match(/^id\//)) return fn()
      batch.put(key, id, dbOpts)
      fn()
    }
  }

  function write(err){
    if(err) return fn(err)
    batch.write(fn)
  }

  function hasResource(done){
    fn = self.factorFn(done, fn)

    if(!self.has_getter){
      batch.put(self.paths.text({
        id: id
      }), {
        text: text,
        words: words
      }, xtend(dbOpts, {
        valueEncoding: 'json'
      }))
    }

    async.forEach(words, onWord, write)
  }

  function cleared(err){
    if(err) return fn(err)
    self.lock(id, hasResource)
  }

  self.remove(id, cleared)
}

inverted.prototype.remove = function(id, fn){
  var start = interpolate('id/%s', id)
  var end = start + '/\xff'
  var keys, transformer
  var called = false
  var batch = this.db.batch()
  var self = this

  var range = xtend(dbOpts, {
    start: start,
    end: end
  })

  this.lock(id, function(done){
    fn = self.factorFn(done, fn)
    keys = self.db.createKeyStream(range).on('error', onError)
    transformer = through(objectMode, remove, flush).on('error', onError)
    keys.pipe(transformer)
  })

  function onError(err){
    if(err) throw err;
    if(called) return
    called = true
    keys.destroy()
    transformer.end()
    fn(err)
  }

  function flush(){
    if(called) return
    called = true
    batch.write(fn)
  }

  function remove(key, enc, fn){
    var ctx = self.parseKey(key)
    batch.del(key, dbOpts)

    if(!self.has_getter){
      batch.del(self.paths.text({
        id: ctx.id
      }))
    }

    batch.del(self.paths.wo_facet({
      word: ctx.word,
      facet: ctx.facet,
      idf: ctx.idf,
      id: ctx.id
    }), dbOpts)

    if(!self.options.facets){
      return fn()
    }

    batch.del(self.paths.w_facet({
      word: ctx.word,
      facet: ctx.facet,
      idf: ctx.idf,
      id: ctx.id
    }), dbOpts)

    fn()
  }
}

inverted.prototype.search = function(query, facets, options, fn){
  var self = this

  if(arguments.length < 2){
    throw new Error('query and callback arguments required')
  }

  if(!Array.isArray(facets) && (type(facets) === 'object')){
    var mid = options
    options = facets
    fn = mid
    facets = []
  }

  if(type(facets) === 'function'){
    fn = facets
    facets = ['']
    options = {}
  }

  if(type(options) === 'function'){
    fn = options
    options = {}
  }

  if(!self.options.facets){
    facets = ['']
  }

  facets = self.parseFacets(facets)
  options = xtend(default_search_options, options)

  var limit = Math.ceil(self.stats.mean() * facets.length)
  var ranges = []
  var keys = []
  var text = ''
  var last = ''
  var found = 0
  var ids = []


  if(type(query) === 'string'){
    text = query
  }

  if(type(query) === 'object'){
    last = query.last || ''
    text = query.text || ''
  }

  function onFacet(facet, fn){
    async.map(words, onWord(facet), fn)
  }

  function onError(results, transformer, fn){
    return function(err){
      results.destroy()
      transformer.end()
      fn(err)
    }
  }

  function onWord(facet){
    return function(word, fn){
      var start = interpolate('word/%s', word)
      start += facet.length ? interpolate('/facet/%s', facet) : '/idf'
      var end = start + '/\xff'

      onRange(xtend(dbOpts, {
        start: start,
        end: end,
        limit: limit
      }), fn)
    }
  }

  function onRange(range, fn){
    var results = self.db.createKeyStream(range)
    var ended = false
    var last = ''

    function end(fn){
      results.destroy()
      transformer.end()
      fn()
    }

    var transformer = through(objectMode, function(key, enc, fn){
      if(ended){
        return
      }

      last = key
      key = self.parseKey(key, true)

      if(!!~ids.indexOf(key.id)){
        return fn()
      }

      if(found < options.limit){
        ids.push(key.id)
        keys.push(key)
        found += 1
      }

      if(found >= options.limit){
        ended = true
        end(fn)
        return
      }

      fn()
    }, function(){
      range.start = last
      ranges.push(range)
      fn()
    })

    var gotError = onError(results, transformer, fn)
    results.on('error', gotError)
    transformer.on('error', gotError)
    results.pipe(transformer)
  }

  function gather(err){
    if(err) return fn(err)
    var docs = {}

    keys = keys.sort(function(a, b){
      return a.idf - b.idf
    })

    keys.forEach(function(key){
      if(!docs[key.id]) {
        docs[key.id] = {
          collectiveIDF: Infinity,
          results: [],
          id: key.id
        }
      }

      docs[key.id].results.push(key)
    })

    Object.keys(docs).forEach(function(id){
      docs[id].collectiveIDF = docs[id].results.reduce(function(sum, key){
        return sum + key.idf
      }, 0)
    })

    async.parallel({
      results: function(fn){
        self.rank(text, docs, fn)
      },
      last: function(fn){
        var id = timehat()

        self.ttl_db.put(id, {
          ids: ids,
          ranges: ranges
        }, xtend(dbOpts, {
          valueEncoding: 'json',
          ttl: options.ttl
        }),function(err){
          fn(err, id)
        })
      }
    }, fn)
  }

  function onPage(err, page){
    if(err) return fn(err)
    ids = page.ids
    async.map(page.ranges, onRange, gather)
  }

  if(last){
    return self.ttl_db.get(last, xtend(dbOpts, {
      valueEncoding: 'json'
    }), onPage)
  }

  var words = self.parseText(text)
  async.map(facets, onFacet, gather)
}

inverted.prototype.rank = function(query, docs, fn){
  var self = this
  var ids = Object.keys(docs)

  function sort(err, texts){
    if(err) return fn(err)

    fn(err, texts.map(function(text, i){
      if(type(text) === 'object'){
        return [ids[i], self.algorithm(text.words, query)]
      }

      return [ids[i], self.algorithm(text, query)]
    }).sort(function(a, b){
      return b[1] - a[1]
    }).map(function(doc){
      return doc[0]
    }))
  }

  async.map(ids, self.getter.bind(self), sort)
}

inverted.prototype.factorFn = function(done, fn){
  return function(){
    done()
    fn.apply(fn, arguments)
  }
}

inverted.prototype.parseText = function(text, idf){
  var ocurrences = {}
  var idfs = {}

  var words = tokenizer.tokenize(text).map(function(word){
    return word.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()\?]/g, '')
  }).map(function(word){
    return word.replace(/\s/g, '')
  }).map(function(word){
    return word.replace(/^[’—"']$/, '')
  }).map(function(word){
    return word.toLowerCase()
  }).filter(Boolean)

  if(this.options.stem) words = words.map(function(word){
    return stemmer.stem(word)
  })

  if(idf) words.forEach(function(word){
    if(type(ocurrences[word]) === 'undefined') ocurrences[word] = 0
    ocurrences[word] += 1
  })

  if(idf) Object.keys(ocurrences).forEach(function(word, i, arr){
    idfs[word] = Math.log(arr.length / ocurrences[word])
  })

  words = uniq(words).filter(function(word){
    return !stopwords.some(function(stopword){
      return word === stopword
    })
  })

  if(!idf) {
    return words
  }

  return words.map(function(word){
    return {
      word: word,
      idf: idfs[word]
    }
  })
}

inverted.prototype.parseFacets = function(facets){
  if(type(facets) === 'string'){
    facets = [facets]
  }

  if(type(facets) !== 'array'){
    facets = ['']
  }

  if(!facets.length){
    facets.push('')
  }

  return facets.filter(function(facet){
    return type(facet) === 'string'
  }).map(function(facet){
    return facet.toLowerCase()
  })
}

inverted.prototype.parseKey = function(key, toString){
  var last = ''
  var result = {}

  function onPart(part, i){
    if(i%2 === 0){
      last = part
      return
    }

    result[last] = part.replace('\xff', '')
  }

  key.split(/\//).forEach(onPart)

  if(toString && result.idf){
    result.idf = hex.decode(result.idf)
  }

  return result
}