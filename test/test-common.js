var test = require('tape');
var Empty = require('../.');

var EventEmitter2 = require('eventemitter2').EventEmitter2;

Empty.use(EventEmitter2);



test('Empty#clean', function (t) {
  t.plan(8);

  var __ = new Empty();
  
  var object = __.object({
    foo: 'bar',
    beep: 'boop'
  });

  var array = __.array([1, 2, 3], 'custom');

  t.deepEqual(JSON.stringify(array), '[1,2,3]', 'JSON.stringify works with arrays');
  t.deepEqual(JSON.stringify(object), '{\"foo\":\"bar\",\"beep\":\"boop\"}', 'JSON.stringify works with objects');

  var cleanObj = __.clean(object);

  t.ok(object._empty, '_empty object initialized');
  t.deepEqual(cleanObj, { foo: 'bar', beep: 'boop' }, 'clean object is clean');
  t.notDeepEqual(cleanObj, object, 'clean object is not the same object');

  var cleanArr = __.clean(array);

  t.equal(__.id(array), 'custom', '__ array initialized');
  t.deepEqual(cleanArr, [1, 2, 3], 'clean array is clean');
  t.notDeepEqual(cleanArr, array, 'clean array is not same object');
});