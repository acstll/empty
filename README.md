# Empty.js

Evented object and array operations with the events library of your choice.

	var Empty = require('empty');
	var EventEmitter2 = require('eventemitter2').EventEmitter2

	Empty.configure({
	  events: EventEmitter2
	});

	var __ = new Empty();

	var collection = __.array([1, 2, 3, 4], 'numbers');

	__.on('push:numbers', function (array, elem) {
		console.log('pushed ' + elem + ' to numbers collection');
	});

	__.push(collection, 5);
	> 5
	> 'pushed 5 to numbers collection'

	collection.length
	> 5