/*
 * async-glob-events.js
 *
 * Copyright (c) 2014 Maximilian Antoni
 *
 * @license MIT
 */
/*global describe, it, beforeEach*/
'use strict';

var assert = require('assert');
var AsyncEmitter = require('../lib/events').AsyncEmitter;


describe('emit', function () {
  var e;
  var calls;

  function pushArg() {
    e.on('test', function (arg) {
      calls.push(arg);
    });
  }

  beforeEach(function () {
    e = new AsyncEmitter();
    calls = [];
  });

  it('invokes registered callback', function () {
    e.on('test', function () {
      calls.push(true);
    });

    e.emit('test');

    assert.equal(calls.length, 1);
  });

  it('passes args', function () {
    e.on('test', function () {
      calls.push(Array.prototype.slice.call(arguments));
    });

    e.emit('test', 42, 'abc', [true]);

    assert.deepEqual(calls[0], [42, 'abc', [true]]);
  });

  it('adds a function if arity = 1 and args = 0', function () {
    pushArg();

    e.emit('test');

    assert.equal(typeof calls[0], 'function');
  });

  it('adds undefined and a function if arity = 2 and args = 0', function () {
    e.on('test', function (thingy, callback) {
      calls.push(thingy, callback);
    });

    e.emit('test');

    assert.equal(typeof calls[0], 'undefined');
    assert.equal(typeof calls[1], 'function');
  });

  it('adds param and a function if arity = 2 and args = 1', function () {
    e.on('test', function (num, callback) {
      calls.push(num, callback);
    });

    e.emit('test', 42);

    assert.equal(typeof calls[0], 'number');
    assert.equal(typeof calls[1], 'function');
  });

  it('does not add function if arity = 1 and args = 1', function () {
    pushArg();

    e.emit('test', 42);

    assert.equal(typeof calls[0], 'number');
    assert.equal(calls.length, 1);
  });

  it('invokes given callback if no listener', function () {
    e.emit('test', function () {
      calls.push(true);
    });

    assert.equal(calls.length, 1);
  });

  function pushesDone() {
    return function () {
      calls.push('done');
    };
  }

  it('does not invoke callback if listener does not yield', function () {
    pushArg();

    e.emit('test', pushesDone());

    assert.equal(calls.length, 1);
    assert.equal(typeof calls[0], 'function');
  });

  it('invokes callback if listener yields', function () {
    pushArg();

    e.emit('test', pushesDone());
    calls[0]();

    assert.equal(calls.length, 2);
    assert.equal(calls[1], 'done');
  });

  it('does not invoke callback if listener calls this.callback()',
    function () {
      e.on('test', function () {
        this.callback();
      });

      e.emit('test', pushesDone());

      assert.equal(calls.length, 0);
    });

  it('invokes callback if this.callback() result gets invoked', function () {
    var cb;
    e.on('test', function () {
      cb = this.callback();
    });

    e.emit('test', function () {
      calls.push('done');
    });
    cb();

    assert.deepEqual(calls, ['done']);
  });

  it('retains scope if args are passed to a sync listener with one arg',
    function () {
      e.on('test', function (arg) {
        /*jslint unparam: true*/
        calls.push(this.args);
      });

      e.emit('test', 42);

      assert.deepEqual(calls[0], [42]);
    });

  it('retains scope if args are passed to an async listener with one arg',
    function () {
      e.on('test', function (arg, callback) {
        /*jslint unparam: true*/
        calls.push(this.args);
        callback();
      });

      e.emit('test', 42);

      assert.deepEqual(calls[0], [42]);
    });

  it('allows to configure scope for sync listener', function () {
    var scope = {};
    var self;
    e.on({ event : 'test', scope : scope }, function () {
      self = this;
    });

    e.emit('test');

    assert.strictEqual(self, scope);
  });

  it('allows to configure scope for async listener', function () {
    var scope = {};
    var self;
    e.on({ event : 'test', scope : scope }, function (callback) {
      self = this;
      callback();
    });

    e.emit('test');

    assert.strictEqual(self, scope);
  });

  it('allows to configure scope for sync once listener', function () {
    var scope = {};
    var self;
    e.once({ event : 'test', scope : scope }, function () {
      self = this;
    });

    e.emit('test');

    assert.strictEqual(self, scope);
  });

  it('allows to configure scope for async once listener', function () {
    var scope = {};
    var self;
    e.once({ event : 'test', scope : scope }, function (callback) {
      self = this;
      callback();
    });

    e.emit('test');

    assert.strictEqual(self, scope);
  });

  it('exposes emitter on scope', function () {
    var self;
    e.on('test', function () {
      self = this;
    });

    e.emit('test');

    assert.strictEqual(self.emitter, e);
  });

  it('yields callback error from listener', function () {
    var err = new Error();
    e.on('test', function (callback) {
      callback(err);
    });

    e.emit('test', function (e) {
      assert.strictEqual(e, err);
    });
  });

  it('yields callback value from listener', function () {
    e.on('test', function (callback) {
      callback(null, 42);
    });

    e.emit('test', function (err, val) {
      /*jslint unparam: true*/
      assert.equal(val, 42);
    });
  });

  function throws(err) {
    return function (cb) {
      /*jslint unparam: true*/
      throw err;
    };
  }

  it('yields thrown error from listener if no callback', function () {
    var err = new Error();
    e.on('test', throws(err));

    e.emit('test', function (e) {
      assert.strictEqual(e, err);
    });
  });

  it('yields thrown error from listener if callback', function () {
    var err = new Error();
    e.on('test', throws(err));

    e.emit('test', function (e) {
      assert.strictEqual(e, err);
    });
  });

  it('yields thrown error from listener if args, no callback', function () {
    var err = new Error();
    e.on('test', throws(err));

    e.emit('test', 1, function (e) {
      assert.strictEqual(e, err);
    });
  });

  it('emits error event if no callback but error handler', function () {
    var err = new Error();
    var caught;
    e.on('test', throws(err));
    e.on('error', function (e) {
      caught = e;
    });

    e.emit('test');

    assert.strictEqual(caught, err);
  });

  it('throws error event if no callback and no error handler', function () {
    e.on('test', throws(new Error()));

    assert.throws(function () {
      e.emit('test');
    }, Error);
  });

  it('yields return value from listener if no callback', function () {
    e.on('test', function () {
      return 42;
    });

    e.emit('test', function (e, val) {
      /*jslint unparam: true*/
      assert.equal(val, 42);
    });

  });

  it('yields return value from listener if callback', function () {
    e.on('test', function (callback) {
      /*jslint unparam: true*/
      return 42;
    });

    var res;
    e.emit('test', function (e, val) {
      /*jslint unparam: true*/
      res = val;
    });

    assert.equal(res, 42);
  });

  it('yields null return value from listener if no callback', function () {
    e.on('test', function () {
      return null;
    });

    e.emit('test', function (e, val) {
      /*jslint unparam: true*/
      assert.strictEqual(val, null);
    });
  });

  it('yields null return value from listener if callback', function () {
    e.on('test', function (callback) {
      /*jslint unparam: true*/
      return null;
    });

    e.emit('test', function (e, val) {
      assert.ifError(e);
      assert.strictEqual(val, null);
    });
  });

  it('yields last return value by default', function () {
    e.on('test', function () {
      return 1;
    });
    e.on('test', function () {
      return 2;
    });

    e.emit('test', function (e, val) {
      assert.ifError(e);
      assert.equal(val, 2);
    });
  });

  it('yields all return values if configured', function () {
    e.on('test', function () {
      return 1;
    });
    e.on('test', function () {
      return 2;
    });

    e.emit({ event : 'test', allResults : true }, function (e, val) {
      assert.ifError(e);
      assert.deepEqual(val, [1, 2]);
    });
  });

  it('uses last given as callback if fewer args than arity', function () {
    var args;
    e.on('test', function (a, b, cb) {
      args = [a, b, cb];
      cb();
    });

    e.emit('test', 42, function () { return; });

    assert.strictEqual(args[0], 42);
    assert.strictEqual(args[1], undefined);
    assert.equal(typeof args[2], 'function');
  });

  it('does not invoke error handler with callback', function () {
    var f;
    e.on('error', function (err, cb) {
      /*jslint unparam: true*/
      f = cb;
    });
    e.on('test', throws(new Error()));

    e.emit('test');

    assert.strictEqual(f, undefined);
  });

  it('does not invoke once error handler with callback', function () {
    var f;
    e.once('error', function (err, cb) {
      /*jslint unparam: true*/
      f = cb;
    });
    e.on('test', throws(new Error()));

    e.emit('test');

    assert.strictEqual(f, undefined);
  });

  it("invokes error listener with cause on scope", function () {
    var s;
    e.on('error', function (err) {
      /*jslint unparam: true*/
      s = this;
    });
    e.on('test', throws(new Error()));

    e.emit('test', 42, true, { a: 'bc' });

    assert.equal(s.cause.event, 'test');
    assert.deepEqual(s.cause.args, [42, true, { a: 'bc' }]);
    assert.strictEqual(s.emitter, e);
  });

  function noop() { return; }
  noop(); // Coverage

  it('does not invoke newListener handler with callback', function () {
    var f;
    e.on('newListener', function (event, fn, cb) {
      /*jslint unparam: true*/
      f = cb;
    });

    e.addListener('test', noop);

    assert.strictEqual(f, undefined);
  });

  it('does not invoke once newListener handler with callback', function () {
    var f;
    e.once('newListener', function (event, fn, cb) {
      /*jslint unparam: true*/
      f = cb;
    });

    e.addListener('test', noop);

    assert.strictEqual(f, undefined);
  });

  it('does not invoke removeListener handler with callback', function () {
    var f;
    e.on('removeListener', function (event, fn, cb) {
      /*jslint unparam: true*/
      f = cb;
    });

    e.addListener('test', noop);
    e.removeListener('test', noop);

    assert.strictEqual(f, undefined);
  });

  it('does not invoke once removeListener handler with callback', function () {
    var f;
    e.once('removeListener', function (event, fn, cb) {
      /*jslint unparam: true*/
      f = cb;
    });

    e.addListener('test', noop);
    e.removeListener('test', noop);

    assert.strictEqual(f, undefined);
  });

  it('does not invoke configured internal handler with callback', function () {
    e = new AsyncEmitter({
      internalEvents: ['foo']
    });
    var f;
    e.on('foo', function (cb) {
      f = cb;
    });

    e.emit('foo');

    assert.strictEqual(f, undefined);
  });

  it('adds `callback` to scope of internal handler', function () {
    e = new AsyncEmitter({
      internalEvents: ['foo']
    });
    var s;
    e.on('foo', function () {
      s = this;
    });

    e.emit('foo');

    assert.equal(typeof s.callback, 'function');
  });

});
