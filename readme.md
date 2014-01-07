WIP

# inverted-index

[![NPM version](https://badge.fury.io/js/inverted-index.png)](http://badge.fury.io/js/inverted-index)
[![Build Status](https://secure.travis-ci.org/kordon/inverted-index.png)](http://travis-ci.org/kordon/inverted-index)
[![Dependency Status](https://gemnasium.com/kordon/inverted-index.png)](https://gemnasium.com/kordon/inverted-index)
[![Coverage Status](https://coveralls.io/repos/kordon/inverted-index/badge.png?branch=master)](https://coveralls.io/r/kordon/inverted-index?branch=master)

## install

```bash
npm install [--save/--save-dev] inverted-index
```

## api

```js
var inverted = require('inverted')
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

When `idf` is flagged as true, for each token indexed an `idf` ([term frequency–inverse document frequency](http://en.wikipedia.org/wiki/Tf%E2%80%93idf)) is calculated. When querying, the index, the terms with lowest `idf` are fetched first. Example:

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

## license