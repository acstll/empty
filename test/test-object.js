var test = require('tape');
var Empty = require('../.');

var EventEmitter2 = require('eventemitter2').EventEmitter2;

Empty.use(EventEmitter2);



test('Empty#object', function (t) {
  t.plan(9);

  var __ = new Empty();
  var existent = {
    foo: 'bar'
  };

  var object = __.object();
  var eobject = __.object(existent);
  var idobject = __.object({}, 'custom');

  t.ok(object, 'new object created');
  t.equal(object._empty.persisted, false, 'new object initialized');
  t.ok(object.toJSON, 'toJSON function present');

  t.equal(eobject.foo, 'bar', 'object from existent object');
  t.equal(eobject._empty.persisted, false, 'object from existent object initialized');
  t.ok(eobject.toJSON, 'toJSON function present on existent');
  t.deepEqual(eobject, existent, 'object from existent remains the same object');

  __.id(object, 'newId');

  t.equal(idobject._empty.id, 'custom', 'custom id set');
  t.equal(object._empty.id, 'newId', 'id set with Empty#id');
});

test('Empty#set', function (t) {
  t.plan(9);

  var __ = new Empty();
  var object = __.object({ hello: 'dlroW' });
  var returned;

  __.on('change:hello:' + __.id(object), function (obj) {
    t.ok(obj, 'change:key:id event fire');
  });

  __.on('change:hello', function (obj) {
    t.ok(obj, 'specific handler change:key fired');
    t.equal(obj.hello, 'World', 'property changed correctly');
    t.equal(obj._empty.previous.hello, 'dlroW', 'previous property stored');
  });

  __.once('change', function (obj) {
    t.ok(obj, 'general change handler got fired')
  });
  
  returned = __.set(object, 'hello', 'World');
  
  t.deepEqual(object, returned, 'object remains the same object after set');
  t.ok(object._empty, 'object got initialized');

  __.once('change:a.b.c', function (obj) {
    t.ok(obj, 'dot notation change event fired');
  });

  __.set(object, 'a.b.c', 'foo');

  t.equal(object.a.b.c, 'foo', 'dot notation set');
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
    foo: 'bar',
    a: {
      b: {
        c: 'foo'
      }
    }
  };

  __.once('change', function () {
    t.skip('general change event doesn\'t fire');
  });

  __.on('change:foo', function () {
    t.skip('specific change:key event doesn\'t fire');
  });

  __.on('change:a.b.c', function () {
    t.skip('specific change:key with dotted notation doesn\'t fire');
  });

  var returned = __.set(object, 'foo', 'bar');

  t.deepEqual(object, returned, 'object remains the same object after set');

  __.set(object, 'a.b.c', 'foo');
});

test('Empty#set push, pop, concat, inc, toggle operations', function (t) {
  t.plan(7);

  var __ = new Empty();

  var object = __.object({
    beep: 'boop',
    level: {
      numbers: [1, 2, 3],
      count: 0
    },
    bool: true
  });

  __.once('change:level.numbers', function (obj) {
    t.equal(obj.level.numbers.length, 4, 'new value pushed to key');
    // return true;
  });

  __.set(object, 'level.numbers', 4, 'push');

  __.set(object, 'level.numbers', ['five', 'six'], 'concat');
  t.equal(object.level.numbers.length, 6, 'concat works');

  __.set(object, 'level.numbers', null, 'pop');
  t.equal(object.level.numbers.length, 5, 'pop works');

  __.set(object, 'level.count', null, 'inc');
  t.equal(object.level.count, 1, 'inc works');

  __.set(object, 'level.count', -1, 'inc');
  t.equal(object.level.count, 0, 'inc works with negative value');

  __.set(object, 'bool', null, 'toggle');
  t.equal(object.bool, false, 'toggle works (1)');

  __.set(object, 'bool', null, 'toggle');
  t.equal(object.bool, true, 'toggle works (2)');
});

test('Empty#unset', function (t) {
  t.plan(5);

  var __ = new Empty();
  var object = __.object({
    foo: 'bar',
    beep: {
      boop: 1
    }
  });
  var returned;

  __.on('change:foo', function (obj) {
    t.ok(obj, 'specific handler change:key fired');
    t.notOk(obj.foo, 'property unset (1)');
  });
  
  __.on('change:beep.boop', function (obj) {
    t.ok(obj, 'specific handler change:key.key.key fired');
    t.notOk(obj.beep.boop, 'property unset (2)');
  })

  __.unset(object, 'foo');
  
  returned = __.unset(object, 'beep.boop');

  t.equal(returned, object, 'returned object is the same object');
});