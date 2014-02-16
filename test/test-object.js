var test = require('tape');
var Empty = require('../.');

var EventEmitter = require('eventemitter3').EventEmitter;
if (!Empty.config.events) Empty.configure({ events: EventEmitter });



test('Empty#id', function (t) {
  t.plan(2);
  
  var w = Empty({
    foo: 'bar',
    id: 0
  });
  var o = Empty({
    foo: 'baz'
  });

  t.equal(w.id(), 0, 'works with id set');
  t.equal(o.id(), undefined, 'returns undefined if not');
});

test('Empty#initialize', function (t) {
  t.plan(3);

  var counter = 0;
  
  Empty.prototype.initialize = function () {
    this.origin[this.idKey] = ++counter;
  };

  var i1 = Empty({});
  var i2 = Empty({});
  var i3 = Empty({});

  t.equal(i1.id(), 1, 'gets called on Empty#bind');
  t.equal(i2.id(), 2, 'gets called on Empty#bind');
  t.equal(i3.id(), 3, 'gets called on Empty#bind');
});

return;

test('Empty#set', function (t) {
  t.plan(4);

  var __ = new Empty();
  var object = { hello: 'dlroW' };
  var returned;

  __.on('change:hello', function (obj) {
    t.ok(obj, 'specific handler change:key fired');
    t.equal(obj.hello, 'World', 'property changed correctly');
  });

  __.once('change', function (obj) {
    t.ok(obj, 'general change handler got fired')
  });
  
  returned = __.set(object, { hello: 'World' });
  
  t.deepEqual(object, returned, 'object remains the same object after set');
});

test('Empty#set, with many properties', function (t) {
  t.plan(8);

  var __ = new Empty();
  var object = {
    id: '123',
    foo: 'bar',
    baz: 1,
    beep: 'boop'
  };
  var called = 0;

  __.on('change:foo:123', function (obj) {
    t.ok(obj, 'change:key:id event fired');
  });

  __.on('change', function (obj) {
    called++;

    t.ok(obj, 'general change handler fired');
  });

  __.on('change:foo', function (obj) {
    t.ok(obj, 'specific handler change:key fired 1');
    t.equal(obj.foo, 'BAR', 'property 1 set');
  });

  __.on('change:baz', function (obj) {
    t.ok(obj, 'specific handler change:key fired 2');
    t.equal(obj.baz, 2, 'property 2 set');
  });

  __.on('change:beep', function () {
    t.skip('specific handler change:key didn\'t fire for unchanged value');
  });

  var returned = __.set(object, {
    foo: 'BAR',
    baz: 2,
    beep: 'boop'
  });

  t.deepEqual(object, returned, 'object remains the same object after set');
  
  setTimeout(function () {
    t.equal(called, 1, 'general change event fired just once');
  }, 0);
});

test('Empty#set shouldn\'t fire `change` when setting the same value', function (t) {
  t.plan(1);

  var __ = new Empty();
  var object = { 
    foo: 'bar'
  };

  __.once('change', function () {
    t.skip('general change event doesn\'t fire');
  });

  __.on('change:foo', function () {
    t.skip('specific change:key event doesn\'t fire');
  });

  var returned = __.set(object, { foo: 'bar' });

  t.deepEqual(object, returned, 'object remains the same object after set');
});

test('Empty#set push, pop, concat, inc, toggle operations', function (t) {
  t.plan(8);

  var __ = new Empty();

  var object = {
    beep: 'boop',
    numbers: [1, 2, 3],
    count: 0,
    bool: true
  };

  __.once('change:numbers', function (obj) {
    t.equal(obj.numbers.length, 4, 'new value pushed to key');
    t.deepEqual(obj.numbers[3], 4, 'new value pushed to key');
  });

  __.set(object, { 'numbers': 4 }, 'push');

  __.set(object, { 'numbers': ['five', 'six'] }, 'concat');
  t.equal(object.numbers.length, 6, 'concat works');

  __.set(object, { 'numbers': null }, 'pop');
  t.equal(object.numbers.length, 5, 'pop works');

  __.set(object, { 'count': null }, 'inc');
  t.equal(object.count, 1, 'inc works');

  __.set(object, { 'count': -1 }, 'inc');
  t.equal(object.count, 0, 'inc works with negative value');

  __.set(object, { 'bool': null }, 'toggle');
  t.equal(object.bool, false, 'toggle works (1)');

  __.set(object, { 'bool': null }, 'toggle');
  t.equal(object.bool, true, 'toggle works (2)');
});

test('Empty#unset', function (t) {
  t.plan(3);

  var __ = new Empty();
  var object = {
    foo: 'bar'
  };
  var returned;

  __.on('change:foo', function (obj) {
    t.ok(obj, 'specific handler change:key fired');
    t.notOk(obj.foo, 'property unset (1)');
  });
  
  returned = __.unset(object, { foo: null });
  // returned = __.set(object, { foo: void 0 });
  
  t.equal(returned, object, 'returned object is the same object');
});
