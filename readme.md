# inverted

[level](https://github.com/level/level) based inverted index

[![NPM version](https://badge.fury.io/js/inverted-index.png)](http://badge.fury.io/js/inverted-index)
[![Build Status](https://secure.travis-ci.org/kordon/inverted.png)](http://travis-ci.org/kordon/inverted)
[![Dependency Status](https://gemnasium.com/kordon/inverted.png)](https://gemnasium.com/kordon/inverted)
[![Coverage Status](https://coveralls.io/repos/kordon/inverted/badge.png?branch=master)](https://coveralls.io/r/kordon/inverted?branch=master)

## install

```bash
npm install [--save/--save-dev] inverted-index
```

## example

### dataset

|  PAGE  |                                TEXT                                |
| :----: | :----------------------------------------------------------------: |
|   `1`  |    Morbi elit est, blandit eu aliquam nec, malesuada ut turpis.    |
|   `2`  | Morbi blandit eros quis erat adipiscing eget vehicula est aliquam. |

### index

|     WORD     |   PAGES   |
| :----------: | :-------: |
| `adipiscing` |    `2`    |
|   `aliquam`  |  `1`, `2` |
|   `blandit`  |  `1`, `2` |
|    `eget`    |    `2`    |
|    `elit`    |    `1`    |
|    `erat`    |    `2`    |
|    `eros`    |    `2`    |
|     `est`    |  `1`, `2` |
|     `eu`     |    `1`    |
|  `malesuada` |    `1`    |
|    `morbi`   |  `1`, `2` |
|     `nec`    |    `1`    |
|    `quis`    |    `2`    |
|   `turpis`   |    `1`    |
|     `ut`     |    `1`    |
|  `vehicula`  |    `2`    |

## api

### `index` inverted(`string`: path)

```js
var inverted = require('inverted-index')
var index = inverted(level(__dirname, {
  createIfMissing: true,
  valueEncoding: 'json',
  keyEncoding: 'utf8'
}))
```

#### `void` put(`array`: values, `int`/`string`: key, `function`: callback)

```js
var text = 'Morbi elit est, blandit eu aliquam nec, malesuada ut turpis.'
var page = 1

index.put(text.toLowerCase().match(/\w+/g), page, function (e) {
  assert(!e)
})
```

#### `stream` get(`int`/`string`: value)

```js
index.get('aliquam').on('data', function (data) {
  console.log('aliquam is included in ', data.value)
  expect(data.key).to.equal('aliquam')
  expect(data.value).to.include(1) //page 1
})
```

#### `stream` all()

```js
index.all('aliquam').on('data', function (data) {
  console.log(data.key, 'is included in ', data.value)
})
```

#### `void` del(`array`: values, `int`/`string`: key, `function`: callback)

```js
var text = 'Morbi elit est, blandit eu aliquam nec, malesuada ut turpis.'
var page = 1

index.del(text.toLowerCase().match(/\w+/g), page, function (e) {
  assert(!e)
})
```

#### `stream` startsWith(`int`/`string`: value)

```js
index.startsWith('e', function (data) {
  console.log(data.key, 'starts with e')
})
```

#### `void` close(`function`: callback)

```js
index.close(function (e) {
  assert(!e)
})
```

## license

MIT