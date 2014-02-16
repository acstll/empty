var test = require('tape');
var Empty = require('../.');

var EventEmitter = require('eventemitter3').EventEmitter;
if (!Empty.config.events) Empty.configure({ events: EventEmitter });



test('Empty#previous', function (t) {
  t.plan(2);

  var model = Empty({
    a: 1,
    b: 2,
    c: 3
  });

  model.set({ b: 3 });
  t.equal(model.previous.b, 2, 'previous object set correctly 1');

  model.set({ a: 2 });
  t.equal(model.previous.a, 1, 'previous object set correctly 2');
});
