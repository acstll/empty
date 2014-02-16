var test = require('tape');
var Empty = require('../.');

var _ = require('lodash');
var EventEmitter = require('eventemitter3').EventEmitter;
if (!Empty.config.events) Empty.configure({ events: EventEmitter });



test('Using custom functions on arrays', function (t) {
  t.plan(10);

  Empty.configure({
    methods: {
      first: _.first,
      lastIndexOf: _.lastIndexOf,
      find: _.find
    }
  });

  var bound = Empty(['foo', 'bar'], 'name');

  bound.once('change:name', function (arr, elem, type) {
    t.equal(type, 'first', 'change:id event fired');
  });

  bound.on('first:name', function (arr, elem) {
    t.ok(arr, 'custom event fired 1');
    t.equal(elem, 'foo', 'result of operation passed in 1');
  });

  bound.on('lastIndexOf:name', function (arr, index) {
    t.ok(arr, 'custom event fired 2');
    t.equal(index, 1, 'result of operation passed in 2');
  });

  bound.on('find:name', function (arr, found) {
    t.ok(arr, 'custom event fired 3');
    t.equal(found, 'foo', 'result of operation passed in 3');
  });

  var first = bound.first();
  var lastIndex = bound.lastIndexOf('bar');
  var found = bound.find(function (elem) { return elem == 'foo'; });

  t.equal(first, 'foo', 'operation performed ok 1');
  t.equal(lastIndex, 1, 'operation performed ok 2');
  t.equal(found, 'foo', 'operation performed ok 3');
});
