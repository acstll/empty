var test = require('tap').test;
var Empty = require('../.');



test('Empty.extend', function (t) {
  t.plan(2);

  var extended = Empty.extend({}, { foo: 'bar' }, { a: 1 });
  Empty.extend(Empty, { foo: 'bar' });

  t.equal(extended.a, 1, 'extends object');
  t.equal(Empty.foo, 'bar', 'extends itself');
});