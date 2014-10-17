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
  var self = this;
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
    } else if (err) {
      emit.apply(self, ['error', err]);
    }
  });
};

function createListener(fn, scope) {
  if (typeof fn !== 'function') {
    throw new TypeError(E_LISTENER);
  }
  return function () {
    var res, args, cb;
    if (fn.length > arguments.length) {
      cb = this.callback();
      args = this.args.slice();
      args[fn.length - 1] = cb;
    } else {
      args = arguments;
    }
    try {
      res = fn.apply(scope || this, args);
    } catch (err) {
      (cb || this.callback.err)(err);
    }
    if (res !== undefined) {
      if (cb) {
        cb(null, res);
      } else {
        this.callback.push(res);
      }
    }
  };
}

AyncEmitter.prototype.addListener = function (event, fn) {
  var o = { orig : fn };
  var s;
  if (typeof event === 'string') {
    o.event = event;
  } else {
    o.event = event.event;
    s = event.scope;
  }
  addListener.call(this, o, createListener(fn, s));
};

AyncEmitter.prototype.once = function (event, fn) {
  var t = this;
  var o = { orig : fn };
  var s;
  if (typeof event === 'string') {
    o.event = event;
  } else {
    o.event = event.event;
    s = event.scope;
  }
  var l = createListener(fn, s);
  addListener.call(this, o, function () {
    t.removeListener(o.event, fn);
    l.apply(this, arguments);
  });
};

AyncEmitter.prototype.on = AyncEmitter.prototype.addListener;


exports.AsyncEmitter = AyncEmitter;
