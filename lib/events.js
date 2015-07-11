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
var events   = require('glob-events');

var emit        = events.Emitter.prototype.emit;
var invoke      = events.Emitter.prototype.invoke;
var addListener = events.Emitter.prototype.addListener;

function AsyncEmitter() {
  events.Emitter.call(this);
}

inherits(AsyncEmitter, events.Emitter);

AsyncEmitter.prototype.emit = function () {
  var scope = events.toScope(arguments, this);
  var event = scope.event;
  var i = this.iterator(event, scope);
  if (event === 'newListener' || event === 'removeListener') {
    invoke.call(this, i, scope);
    return;
  }
  var args = scope.args;
  this.invoke(i, scope, (typeof args[args.length - 1] === 'function')
    ? args.pop()
    : null);
};

function createListener(fn, scope) {
  if (typeof fn !== 'function') {
    throw new TypeError('Listener must be function');
  }
  return function () {
    var res, args = this.args, cb;
    if (fn.length > args.length) {
      cb = this.callback();
      args = args.slice();
      args[fn.length - 1] = cb;
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

AsyncEmitter.prototype.addListener = function (event, fn) {
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

AsyncEmitter.prototype.once = function (event, fn) {
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

AsyncEmitter.prototype.on = AsyncEmitter.prototype.addListener;

AsyncEmitter.prototype.invoke = function (iterator, scope, callback) {
  var l = listen();
  scope.callback = l;
  invoke.call(this, iterator, scope);
  var self = this;
  l.then(function (err, vals) {
    if (callback) {
      if (err) {
        callback(err);
      } else {
        callback(null, scope.allResults
          ? vals
          : vals[vals.length - 1]);
      }
    } else if (err) {
      emit.apply(self, ['error', err]);
    }
  });
};

exports.toScope = events.toScope;
exports.AsyncEmitter = AsyncEmitter;
