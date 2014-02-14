var test = require('tape');
var Empty = require('../.');



test('Empty.assign', function (t) {
  t.plan(2);

  var extended = Empty.assign({}, { foo: 'bar' }, { a: 1 });
  Empty.assign(Empty, { foo: 'bar' });

  t.equal(extended.a, 1, 'extends object');
  t.equal(Empty.foo, 'bar', 'extends itself');
});