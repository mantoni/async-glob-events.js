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


describe('removeListener', function () {
  var e;

  beforeEach(function () {
    e = new AsyncEmitter();
  });

  it('emits removeListener event with correct function', function () {
    var arg;
    e.addListener('removeListener', function (event, fn) {
      /*jslint unparam: true*/
      arg = fn;
    });
    e.addListener('test', noop);

    e.removeListener('test', noop);

    assert.strictEqual(arg, noop);
  });

});
