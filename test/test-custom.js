var test = require('tap').test;
var Empty = require('../.');

var EventEmitter = require('wolfy87-eventemitter');
var _ = require('lodash');

Empty.use(EventEmitter);



test('Using custom functions on arrays', function (t) {
  t.plan(9);

  Empty.configure({
    methods: {
      first: _.first,
      lastIndexOf: _.lastIndexOf,
      find: _.find
    }
  });

  var __ = Empty();
  var arr = __.array(['foo', 'bar'], 'name');

  __.on('first:name', function (arr, elem) {
    t.ok(arr, 'custom event fired 1');
    t.equal(elem, 'foo', 'result of operation passed in 1');
  });

  __.on('lastIndexOf:name', function (arr, index) {
    t.ok(arr, 'custom event fired 2');
    t.equal(index, 1, 'result of operation passed in 2');
  });

  __.on('find:name', function (arr, found) {
    t.ok(arr, 'custom event fired 3');
    t.equal(found, 'foo', 'result of operation passed in 3');
  });

  var first = __.first(arr);
  var lastIndex = __.lastIndexOf(arr, 'bar');
  var found = __.find(arr, function (elem) { return elem == 'foo'; });

  t.equal(first, 'foo', 'operation performed ok 1');
  t.equal(lastIndex, 1, 'operation performed ok 2');
  t.equal(found, 'foo', 'operation performed ok 3');
});