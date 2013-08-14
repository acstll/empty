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

This little library fits DIY MV* arquitectures where:

- Plain classes for models and plain arrays for collections just suffice.
- You're already working with an EventeEmitter library in your project and don't want every other libray you use having its own implementation of pub/sub.
- You want to listen for changes on regular and/or custom operations.

## Motivation

I'm writing this for mainly one reason: **to learn JavaScript**.

This is a work in progress!