var test = require('tape');
var Empty = require('../.');

var EventEmitter = require('eventemitter3').EventEmitter;
if (!Empty.config.events) Empty.configure({ events: EventEmitter });



test('Empty#bind', function (t) {
  t.plan(5);

  var array = [1, 2, 3];
  var __ = new Empty();

  var collection = __.bind(array);

  __.on('push', function (array, length) {
    t.ok(array, 'events fire');
  });

  var length = collection.push(4);

  t.equal(length, 4, 'method returns');
  t.equal(array[3], 4, 'method works');
  t.ok(collection.id(), 'Empty#id works on uninitialized objects');
  t.ok(collection instanceof Empty, 'bound object is instance of Empty');
});

test('Empty#wrap', function (t) {
  t.plan(9);

  var array = [1, 2, 3];
  var collection = Empty.wrap(array);

  var Model = function (name, age) {
    this.name = name;
    this.age = age;
  }

  collection.on('pop', function (array, last) {
    t.ok(array, 'events fire');
  });

  var last = collection.pop();
  var model = Empty.wrap(Model, 'John Doe', 34);

  t.equal(last, 3, 'method returns');
  t.equal(array.length, 2, 'method works');
  t.ok(collection.id(), 'Empty#id works on uninitialized objects');
  t.deepEqual(collection.origin, array, 'Empty.wrap instance\'s origin has original object');
  t.ok(model.origin instanceof Model, 'model.origin is instanceof Model');
  t.equal(model.get('name'), 'John Doe', 'Empty.wrap with constructor passed in (1)');
  t.equal(model.get('age'), 34, 'Empty.wrap with constructor passed in (2)');
  t.equal(JSON.stringify(model), '{"name":"John Doe","age":34}', 'JSON.stringify(model) works');
});