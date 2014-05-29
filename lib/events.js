/*
 * async-glob-events.js
 *
 * Copyright (c) 2014 Maximilian Antoni
 *
 * @license MIT
 */
'use strict';

var inherits = require('inherits');
var listen   = require('listen');
var Emitter  = require('glob-events').Emitter;

var slice       = Array.prototype.slice;
var emit        = Emitter.prototype.emit;
var addListener = Emitter.prototype.addListener;

var E_LISTENER = 'Listener must be function';

function AyncEmitter() {
  Emitter.call(this);
}

inherits(AyncEmitter, Emitter);

AyncEmitter.prototype.emit = function (event) {
  if (event.event === 'newListener' || event.event === 'removeListener') {
    emit.apply(this, arguments);
    return;
  }
  var args = arguments;
  if (typeof event === 'string') {
    args[0] = {
      event : event
    };
  }
  var callback;
  if (typeof args[args.length - 1] === 'function') {
    args = slice.call(arguments);
    callback = args.pop();
  }
  var l = listen();
  args[0].callback = l;
  emit.apply(this, args);
  l.then(function (err, vals) {
    if (callback) {
      if (err) {
        callback(err);
      } else {
        var v = args[0].allResults
          ? vals
          : vals[vals.length - 1];
        callback(null, v);
      }
    }
  });
};

function createListener(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError(E_LISTENER);
  }
  return function () {
    var res;
    if (fn.length > arguments.length) {
      var args = this.args.slice();
      var cb = this.callback();
      args[fn.length - 1] = cb;
      try {
        res = fn.apply(this, args);
        if (res !== undefined) {
          cb(null, res);
        }
      } catch (err) {
        cb(err);
      }
    } else {
      try {
        res = fn.apply(this, arguments);
        if (res !== undefined) {
          this.callback.push(res);
        }
      } catch (err) {
        this.callback.err(err);
      }
    }
  };
}

AyncEmitter.prototype.addListener = function (event, fn) {
  var l = createListener(fn);
  l._once = fn;
  addListener.call(this, event, l);
};

AyncEmitter.prototype.once = function (event, fn) {
  var l = createListener(fn);
  var s = this._store;
  var f = function () {
    s.remove(event, f);
    l.apply(this, arguments);
  };
  f._once = fn;
  addListener.call(this, event, f);
};

AyncEmitter.prototype.on = AyncEmitter.prototype.addListener;


exports.AsyncEmitter = AyncEmitter;
