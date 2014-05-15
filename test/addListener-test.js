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


function noop() { return; }
noop(); // Coverage


describe('addListener', function () {
  var e;

  beforeEach(function () {
    e = new AsyncEmitter();
  });

  it('emits newListener event with correct function', function () {
    var arg;
    e.addListener('newListener', function (event, fn) {
      /*jslint unparam: true*/
      arg = fn;
    });

    e.addListener('test', noop);

    assert.strictEqual(arg, noop);
  });

  it('passes callback to once listener', function () {
    var callback;
    e.once('test', function (cb) {
      callback = cb;
    });

    e.emit('test');

    assert.equal(typeof callback, 'function');
  });

  it('emits newListener event with correct function for once', function () {
    var arg;
    e.addListener('newListener', function (event, fn) {
      /*jslint unparam: true*/
      arg = fn;
    });

    e.once('test', noop);

    assert.strictEqual(arg, noop);
  });

  it('does not invoke once listener without callback twice', function () {
    var calls = 0;

    e.once('test', function () {
      calls++;
    });
    e.emit('test');
    e.emit('test');

    assert.equal(calls, 1);
  });

  it('does not invoke once listener with callback twice', function () {
    var calls = 0;

    e.once('test', function (callback) {
      calls++;
      callback();
    });
    e.emit('test');
    e.emit('test');

    assert.equal(calls, 1);
  });

  it('throws TypeError if listener is not a function', function () {
    assert.throws(function () {
      e.addListener('test', {});
    }, TypeError);
  });

  it('throws TypeError in once if listener is not a function', function () {
    assert.throws(function () {
      e.once('test', {});
    }, TypeError);
  });

});
