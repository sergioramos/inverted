# inverted-index

[![NPM version](https://badge.fury.io/js/inverted-index.png)](http://badge.fury.io/js/inverted-index)
[![Build Status](https://travis-ci.org/ramitos/inverted.png?branch=master)](https://travis-ci.org/ramitos/inverted)
[![Dependency Status](https://gemnasium.com/ramitos/inverted.png)](https://gemnasium.com/ramitos/inverted)
[![Coverage Status](https://coveralls.io/repos/ramitos/inverted/badge.png?branch=master)](https://coveralls.io/r/ramitos/inverted?branch=master)

## install

```bash
npm install [--save/--save-dev] inverted-index
```

## api

```js
var inverted = require('inverted-index')
```

### inverted(db[, options[, getter]])

```js
var level = require('level')('/path/to/my/db')
var sublevel = require('sublevel')

var index = inverted(sublevel(db, 'index'), {
  idf: true,
  stem: true,
  rank: true,
  rank_algorithm: 'cosine',
  facets: true
}, function(id, options, fn){
  level.get(id, options, fn)
})
```

#### db

Any [level](https://github.com/rvagg/node-levelup/) API-compatible instance is accepted.

#### options

*The exemplified options is the default configuration.*

##### idf

When `idf` is flagged as true, for each token indexed an `idf` ([term frequency–inverse document frequency](http://en.wikipedia.org/wiki/Tf%E2%80%93idf)) is calculated. When querying the index, the terms with lowest `idf` are fetched first. Example:

```js
"Julie loves me more than Linda loves me"
```
```json
[
  {
    "word": "julie",
    "idf": 1.791759469228055
  },
  {
    "word": "linda",
    "idf": 1.791759469228055
  },
  {
    "word": "loves",
    "idf": 1.0986122886681098
  }
]
```

Notice that *"me"*, *"more"* and *"than"* are not indexed, because those are considered `stopwords`.

##### stem

Whether the text should be [stemmed](http://en.wikipedia.org/wiki/Stemming) or not. When true, the text is stemmed with [the Porter stemming algorithm](http://snowball.tartarus.org/algorithms/porter/stemmer.html) using [NaturalNode/natural](https://github.com/NaturalNode/natural#stemmers). Example:

```js
"Fishing is a way of catching cats, he argued in his arguments"
```
is tokenized into:
```json
["fishing", "is", "a", "way", "of", "catching", "cats", "he", "argued", "in", "his", "arguments"]
```
and stemmed into:
```json
["fish", "is", "a", "wai", "of", "catch", "cat", "he", "argued", "in", "his", "argum"]
```

##### rank

With ranking enabled, when querying it ranks the results based on a defined algorithm. The rank is done AFTER the fetch, so it only ranks using the result set (that can be parcial depending on the size of matching results) comparing the query with the original indexed text, to the tokens.

So, `idf` is used to fetch tokens ordered by `idf` and then ranking is done with the original text of each token's correspondent document comparing with the query text. The "problem" with ranking is that if you have 100000 tokens that match the query tokens, only `100` (can be set on the query options) are fetched for each page and THEN the rank is done. Example:

```json
{
  "1": "Fishing is a way of catching cats, Julie argued in her arguments",
  "2": "Julie loves me more than Linda loves me"
}
```
querying `Julie loves` would fetch:
```json
[
  {
    "word": "loves",
    "idf": 1.0986122886681098,
    "id": "2"
  },
  {
    "word": "julie",
    "idf": 1.791759469228055,
    "id": "2"
  },
  {
    "word": "julie",
    "idf": 2.4849066497880004,
    "id": "1"
  }
]
```
and then rank them:
```json
["2", "1"]
```

##### rank_algorithm

Only takes effect when `rank` is set to true. Valid options are `cosine` or `sift3` using [ramitos/cosine](https://github.com/ramitos/cosine) and [ramitos/sift3](https://github.com/ramitos/sift3).

Haven't made any benchmarks on that, but `sift3` _should_ be faster. Will get data on that soon.

##### facets

Enabling `facets` is useful to query based on types of models. Example:
```json
{
  "1": {
    "text": "Hank Green",
    "facets": ["user"]
  },
  "2": {
    "text": "John Green",
    "facets": ["user"]
  },
  "3": {
    "text": "Johnnie Walker",
    "facets": ["user"]
  },
  "b": {
    "text": "Johnnie Walker",
    "facets": ["brand"]
  }
}
```
You can then query "Johnnie" with `facets` `["brand"]` and only get:
```json
["b"]
```
Notice how the result don't include the user `3` because it doesn't have the *brand* `facet`.

You can also combine `facets` with `id`'s to provide property based queries:
```json
{
  "3": {
    "text": "Johnnie Walker johnnie@walker.com",
    "facets": ["user"]
  },
  "3-name": {
    "text": "Johnnie Walker",
    "facets": ["user-name"]
  },
  "3-email": {
    "text": "johnnie@walker.com",
    "facets": ["user-email"]
  }
}
```
And then query the `facets` `["user-name"]` with the text *"johnnie"* and get:
```json
["3-name"]
```
And with that you can just split the results to get the `id`'s.

#### getter

For ranking results, we need to store the original text. When indexing large amounts of data this can have an impact on disk usage. To prevent that, a function can be passed that receives `id`, `options`, and `callback` as the arguments to fetch the original indexed text for that `id`.

### index(text, id[, facets], callback)
### put(text, id[, facets], callback)
### link(text, id[, facets], callback)
```js
index.index('john green', 1, ['user'], function(err){
  assert(!err)
})
```
```js
index.put('Fishing is a way of catching cats, he argued in his arguments', 'b', function(err){
  assert(!err)
})
```
```js
index.link('Julie loves me more than Linda loves me', '1436ebc684b-c1039c76bdb2b054670f3a1256c98650', ['message'], function(err){
  assert(!err)
})
```

### remove(id, callback)
### del(id, callback)
### unlink(id, callback)
```js
index.remove(1, function(err){
  assert(!err)
})
```
```js
index.del('b', function(err){
  assert(!err)
})
```
```js
index.unlink('1436ebc684b-c1039c76bdb2b054670f3a1256c98650', function(err){
  assert(!err)
})
```

### index.search(query[, facets[, options]], callback)
### index.query(query[, facets[, options]], callback)
```js
index.search('Fishing', function(err, result){
  assert(!err)
  assert(result.last)
  assert(result.results)
})
```
```js
index.query('Green', ['user'], function(err, result){
  assert(!err)
  assert(result.last)
  assert(result.results)
})
```
```js
index.search('Green', 'user', function(err, result){
  assert(!err)
  assert(result.last)
  assert(result.results)
})
```
```js
index.search('Green', {
  limit: 100, 
  ttl: 1000 * 60 * 60
}, function(err, result){
  assert(!err)
  assert(result.last)
  assert(result.results)
})
```
```js
index.search({
  last: '1436ec2e069-bf55e1ed64540b925e13d6bfd21a543c'
}, function(err, result){
  assert(!err)
  assert(result.last)
  assert(result.results)
})
```

#### pagination

Every query returns a last parameter. That can be passed to the `query`/`search` function to get the next results. When you pass `last`, you don't need to pass the search query again, because it is saved in the db.

Note that pagination expires in `1h`, so if you do a query now, and 2 hours later you want to retrieve the next page, you'll get an error.

The `ttl` can, however, be tuned in the `query` options.

## license

MIT