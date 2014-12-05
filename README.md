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

- `emit(event[, ...], callback)` will invoke the given callback once all
  listeners yielded. The callback is called with `(err, value)`.
- `emit({ event : 'name', allResults : true }[, ...], callback)` retrieves an
  array with all non-`undefined` return values of all listeners.
- `invoke(iterator, scope[, callback])` is an async override of the
  [glob-events][] implementation. The given callback is invoked once all
  listeners yielded.
- `this.callback()` in listeners returns a callback which has to be invoked for
  `emit` to yield. `this.callback` is a [listen][] instance.

## License

MIT

[Build Status]: http://img.shields.io/travis/mantoni/async-glob-events.js.svg
[SemVer]: http://img.shields.io/:semver-%E2%9C%93-brightgreen.svg
[License]: http://img.shields.io/npm/l/async-glob-events.svg
[glob-events]: https://github.com/mantoni/glob-events.js
[listen]: https://github.com/mantoni/listen.js
