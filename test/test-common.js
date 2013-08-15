var test = require('tape');
var Empty = require('../.');

var EventEmitter2 = require('eventemitter2').EventEmitter2;

Empty.use(EventEmitter2);



test('Empty#raw', function (t) {
  t.plan(8);

  var __ = new Empty();
  
  var object = __.object({
    foo: 'bar',
    beep: 'boop'
  });

  var array = __.array([1, 2, 3], 'custom');

  t.deepEqual(JSON.stringify(array), '[1,2,3]', 'JSON.stringify works with arrays');
  t.deepEqual(JSON.stringify(object), '{\"foo\":\"bar\",\"beep\":\"boop\"}', 'JSON.stringify works with objects');

  var rawObj = __.raw(object);

  t.ok(object._empty, '_empty object initialized');
  t.deepEqual(rawObj, { foo: 'bar', beep: 'boop' }, 'raw object is clean');
  t.notDeepEqual(rawObj, object, 'raw object is not the same object');

  var rawArr = __.raw(array);

  t.equal(__.id(array), 'custom', '__ array initialized');
  t.deepEqual(rawArr, [1, 2, 3], 'raw array is clean');
  t.notDeepEqual(rawArr, array, 'raw array is not same object');
});