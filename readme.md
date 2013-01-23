# inverted

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

var index = inverted(__dirname)
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

## test [![Build Status](https://travis-ci.org/kordon/inverted.png)](https://travis-ci.org/kordon/inverted)

```bash
npm test
```

## license

MIT