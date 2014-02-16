var test = require('tape');
var Empty = require('../.');

var EventEmitter = require('eventemitter3').EventEmitter;
if (!Empty.config.events) Empty.configure({ events: EventEmitter });



test('Empty.assign', function (t) {
  t.plan(2);

  var extended = Empty.assign({}, { foo: 'bar' }, { a: 1 });
  Empty.assign(Empty, { foo: 'bar' });

  t.equal(extended.a, 1, 'extends object');
  t.equal(Empty.foo, 'bar', 'extends itself');
});

test('Empty.mixin', function (t) {
  t.plan(1);

  var __ = new Empty();

  Empty.mixin(Empty, {
    beep: function () {
      return 'boop';
    }
  });

  t.equal(__.beep(), 'boop', 'works on itself');
});
