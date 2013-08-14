var EventEmitter = require('wolfy87-eventemitter');

var test = require('tap').test;
var Empty = require('../.');



test('Instanciate with constructor', function (t) {
  t.plan(3);

  Empty.use(EventEmitter);
  var __ = new Empty();

  __.on('testing', function (fired) {
    t.ok(fired, 'event methods are there');
  });

  t.ok(__ instanceof Empty, 'instance of Empty');
  t.ok(__ instanceof EventEmitter, 'instance of EventEmitter');
  
  __.emit('testing', true);
});