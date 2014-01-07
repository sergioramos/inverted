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

## license