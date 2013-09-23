var test = require('tape');
var Empty = require('../.');

var EventEmitter = require('wolfy87-eventemitter');

Empty.configure({ events: EventEmitter });



test('Empty array methods initialize arrays if they\'re not', function (t) {
  t.plan(1);

  var __ = new Empty();
  var arr = [];

  __.push(arr, 1);
  t.ok(arr.empty, 'raw array initialized on operation');
});

test('Empty#push', function (t) {
  t.plan(4);

  var __ = new Empty();
  var array = Empty.initialize([1, 2, 3], 'beep');

  __.on('change:' + __.id(array), function (arr, len, type) {
    t.equal(type, 'push', 'change:id event fired');
  });

  __.on('push', function (arr) {
    t.ok(arr, 'push event fired');
  });

  __.on('push:beep', function (arr) {
    t.ok(arr, 'push:id event fired');
    t.equal(arr[3], 4, 'pushed value');
  });

  __.push(array, 4);
});

test('Empty#pop', function (t) {
  t.plan(5);

  var __ = new Empty();
  var array = Empty.initialize([1, 2, 3], 'boop');

  __.on('pop', function (arr) {
    t.ok(arr, 'pop event fired');
  });

  __.on('pop:boop', function (arr, elem) {
    t.ok(arr, 'pop:id event fired');
    t.equal(arr.length, 2, 'popped value');
    t.equal(elem, 3, 'popped element passed in');
  })

  var elem = __.pop(array);

  t.equal(elem, 3, 'popped element returned');
});

test('Empty#unshift', function (t) {
  t.plan(3);

  var __ = new Empty();
  var array = Empty.initialize([1, 2, 3], 'bar');

  __.on('unshift', function (arr) {
    t.ok(arr, 'unshift event fired');
  });

  __.on('unshift:bar', function (arr) {
    t.ok(arr, 'unshift:id event fired');
    t.equal(arr.length, 4, 'value unshifted');
  });

  __.unshift(array, 0);
});

test('Empty#shift', function (t) {
  t.plan(5);

  var __ = new Empty();
  var array = Empty.initialize([1, 2, 3], 'foo');

  __.on('shift', function (arr) {
    t.ok(arr, 'shift event fired');
  });

  __.on('shift:foo', function (arr, elem) {
    t.ok(arr, 'shift:id event fired');
    t.equal(arr.length, 2, 'shifted value');
    t.equal(elem, 1, 'shifted element passed in');
  })

  var elem = __.shift(array);

  t.equal(elem, 1, 'shifted element returned');
});

test('Empty#sort', function (t) {
  t.plan(4);

  var __ = new Empty();
  var array = Empty.initialize([1, 2, 3], 'foo');

  function compare (a, b) {
    return a < b ? 1 : -1;
  }

  __.on('sort', function (arr) {
    t.ok(arr, 'sort event fired');
  });

  __.on('sort:foo', function (arr) {
    t.ok(arr, 'sort:id event fired');
    t.equal(arr[0], 3, 'sorted correctly');
  })

  var returned = __.sort(array, compare);

  t.equal(returned, array, 'returned same array');
});

test('Empty#filter', function (t) {
  t.plan(5);

  var __ = new Empty();
  var array = Empty.initialize([11, 24, 34, 101, 5, 15], 'foo');

  function callback (num) {
    return num > 10;
  }

  __.on('filter', function (arr) {
    t.ok(arr, 'filter event fired');
  });

  __.on('filter:foo', function (original, arr) {
    t.ok(arr, 'filter:id event fired');
    t.equal(arr.length, 5, 'filtered correctly');
    t.equal(original, array, 'original array passed in');
  })

  var returned = __.filter(array, callback);

  t.equal(returned.length, 5, 'returned filtered array');
});