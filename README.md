# async-glob-events.js

[![Build Status]](https://travis-ci.org/mantoni/async-glob-events.js)
[![SemVer]](http://semver.org)
[![License]](https://github.com/mantoni/async-glob-events.js/blob/master/LICENSE)

Event emitter with glob support on event names and asynchronous listeners, for
node and the browser

## Features

- Inherits all features from [glob-events][]
- Pass a callback as the last argument to `emit` and receive asynchronous
  errors and return values from listeners
- 100% test coverage

## Install with npm

```
npm install async-glob-events
```

## Browser support

Use [Browserify](http://browserify.org) to create a standalone file.

## Usage

```js
var AsyncEmitter = require('async-glob-events').AsyncEmitter;
var asyncEmitter = new AsyncEmitter();

asyncEmitter.on('add', function (a, b, callback) {
  setTimeout(function () {
    callback(null, a + b);
  }, 100);
});

asyncEmitter.emit('add', 3, 4, function (err, value) {
  assert.equal(value, 7);
});
```

Listeners may also return value immediately:

```js
asyncEmitter.on('add', function (a, b) {
  return a + b;
});
```

This makes it possible to change an implementation from synchronous to
asynchronous without modifying the caller.

The callback passed to `emit` is only invoked once all invoked listeners
returned.

## AsyncEmitter API

The API is identical to [glob-events][] with these additions:

- `emit({ event : 'name', allResults : true }, ...)` may be used to receive an
  array with all non-`undefined` return values of all listeners
- `this.callback()` may be used in listeners to obtain a callback

## License

MIT

[Build Status]: http://img.shields.io/travis/mantoni/async-glob-events.js.svg
[SemVer]: http://img.shields.io/:semver-%E2%9C%93-brightgreen.svg
[License]: http://img.shields.io/npm/l/async-glob-events.svg
[glob-events]: https://github.com/mantoni/glob-events.js
