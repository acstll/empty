var test = require('tape');
var keypath = require('../keypath');

test('keypath gets', function (t) {
  var obj = {
    foo: 'baz',
    bar: {
      baz: {
        beep: 'boop'
      }
    }
  };

  t.equal(keypath(obj, 'foo'), 'baz');
  t.equal(keypath(obj, 'bar.baz.beep'), 'boop');
  t.equal(keypath(obj, 'bar.baz.beep.yep.nope'), undefined);
  t.end();
});

test('keypath sets', function (t) {
  var obj = {
    foo: 'baz',
    bar: {
      baz: {
        beep: 'boop'
      }
    }
  };

  t.equal(keypath(obj, 'foo', 'yep'), 'yep');
  t.equal(obj.foo, 'yep');
  t.equal(keypath(obj, 'bar.baz.beep', 'nope'), 'nope');
  t.equal(obj.bar.baz.beep, 'nope');
  t.end();
});

test('keypath deletes', function (t) {
  var obj = {
    foo: 'baz',
    bar: {
      baz: {
        beep: 'boop'
      }
    }
  };

  t.equal(keypath(obj, 'foo', undefined), undefined);
  t.notOk(obj.foo);
  t.equal(keypath(obj, 'bar.baz', undefined), undefined);
  t.notOk(obj.bar.baz);
  t.equal(keypath(obj, 'bar.baz.beep'), undefined);
  t.end();
});