var Backbone = require('backbone');

var test = require('tap').test;
var Empty = require('../.');



test('Instanciate with object (Backbone.Events)', function (t) {
  t.plan(2);

  Empty.configure({
    events: Backbone.Events,
    map: {
      emit: 'trigger'
    }
  });

  var __ = new Empty();

  __.on('testing', function (fired) {
    t.ok(fired, 'event methods are there');
  });

  t.ok(__ instanceof Empty, 'instance of Empty');
  
  __._emit('testing', true);
});