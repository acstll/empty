var test = require('tape');
var Empty = require('../.');

var EventEmitter = require('eventemitter3').EventEmitter;
if (!Empty.config.events) Empty.configure({ events: EventEmitter });



test('Empty#initialize, #id, #state', function (t) {
  t.plan(11);

  var __ = new Empty();
  var existent = {
    foo: 'bar',
    origin: { beep: 'boop' }
  };

  var object = Empty.initialize();
  var eobject = Empty.initialize(existent);
  var idobject = Empty.initialize({}, 'custom');

  t.ok(object, 'new object created');
  t.ok(object.empty, 'new object initialized')
  t.ok(object.empty.state, 'state prop present');

  t.equal(eobject.foo, 'bar', 'object from existent object');
  t.ok(eobject.empty, 'object from existent object initialized');
  t.deepEqual(eobject, existent, 'object from existent remains the same object');

  __.id(object, 'newId');

  t.equal(idobject.empty.id, 'custom', 'custom id set');
  t.equal(object.empty.id, 'newId', 'id set with Empty#id');
  t.equal(__.id(object), 'newId', 'Empty#id works as getter');

  __.state(object, 'persisted', 1);

  t.equal(object.empty.state.persisted, 1, 'Empty#state sets correcty');
  t.equal(__.state(object, 'persisted'), 1, 'Empty#state gets correcty');
});

test('Empty#set', function (t) {
  t.plan(7);

  var __ = new Empty();
  var object = Empty.initialize({ hello: 'dlroW' });
  var returned;

  __.on('change:hello:' + __.id(object), function (obj) {
    t.ok(obj, 'change:key:id event fire');
  });

  __.on('change:hello', function (obj) {
    t.ok(obj, 'specific handler change:key fired');
    t.equal(obj.hello, 'World', 'property changed correctly');
    t.equal(obj.empty.previous.hello, 'dlroW', 'previous property stored');
  });

  __.once('change', function (obj) {
    t.ok(obj, 'general change handler got fired')
  });
  
  returned = __.set(object, 'hello', 'World');
  
  t.deepEqual(object, returned, 'object remains the same object after set');
  t.ok(object.empty, 'object got initialized');
});

test('Empty#set with object passed in', function (t) {
  t.plan(8);

  var __ = new Empty();
  var object = {
    id: 'beep',
    foo: 'bar',
    baz: 1
  };
  var called = 0;

  __.on('change:foo:beep', function (obj) {
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

  var returned = __.set(object, {
    foo: 'BAR',
    baz: 2
  });

  t.deepEqual(object, returned, 'object remains the same object after set');
  
  setTimeout(function () {
    t.equal(called, 1, 'general change event fired once');
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

  var returned = __.set(object, 'foo', 'bar');

  t.deepEqual(object, returned, 'object remains the same object after set');
});

test('Empty#set push, pop, concat, inc, toggle operations', function (t) {
  t.plan(7);

  var __ = new Empty();

  var object = Empty.initialize({
    beep: 'boop',
    numbers: [1, 2, 3],
    count: 0,
    bool: true
  });

  __.once('change:numbers', function (obj) {
    t.equal(obj.numbers.length, 4, 'new value pushed to key');
    // return true;
  });

  __.set(object, 'numbers', 4, 'push');

  __.set(object, 'numbers', ['five', 'six'], 'concat');
  t.equal(object.numbers.length, 6, 'concat works');

  __.set(object, 'numbers', null, 'pop');
  t.equal(object.numbers.length, 5, 'pop works');

  __.set(object, 'count', null, 'inc');
  t.equal(object.count, 1, 'inc works');

  __.set(object, 'count', -1, 'inc');
  t.equal(object.count, 0, 'inc works with negative value');

  __.set(object, 'bool', null, 'toggle');
  t.equal(object.bool, false, 'toggle works (1)');

  __.set(object, 'bool', null, 'toggle');
  t.equal(object.bool, true, 'toggle works (2)');
});

test('Empty#unset', function (t) {
  t.plan(3);

  var __ = new Empty();
  var object = Empty.initialize({
    foo: 'bar'
  });
  var returned;

  __.on('change:foo', function (obj) {
    t.ok(obj, 'specific handler change:key fired');
    t.notOk(obj.foo, 'property unset (1)');
  });
  
  returned = __.unset(object, 'foo');
  
  t.equal(returned, object, 'returned object is the same object');
});