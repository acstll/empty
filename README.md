# Empty.js

Evented object and array operations with the events library of your choice.

*This is a work in progress and I don't expect you to use this at all.*

This little library should fits modular, diy MV* architectures where:

- Plain classes for models and plain arrays for collections just suffice.
- You're already working with an EventeEmitter library in your project and don't want every other libray you use having its own implementation of pub/sub.
- You want to listen for changes on regular and/or custom operations.

## Install

Use with [browserify](https://github.com/substack/node-browserify) or [gluejs](https://github.com/mixu/gluejs):

```bash
npm install empty
```

## TODO

- Write API docs.
- Write example.

## Example of possible usage

You *need* an external EventEmitter library. Require it and require Empty.

```js
var Empty = require('empty');
var EventEmitter2 = require('eventemitter2').EventEmitter2
```

Call `Empty.configure` with the EventEmitter library as 'events' in a hash:

```js
Empty.configure({
  events: EventEmitter2
});
```

Make an instance, `new` is optional. I name it `__` but of course you can name it anything you like.

```js
var __ = new Empty();
```

Use it like this:

```js
var collection = __.array([1, 2, 3, 4], 'numbers');

__.on('push:numbers', function (array, elem) {
	console.log('pushed ' + elem + ' to numbers collection');
});

__.push(collection, 5);
> 5
> 'pushed 5 to numbers collection'

collection.length;
> 5
```

## Motivation

I'm writing this for mainly one reason: **to learn JavaScript**.

All kind of feedback is very welcome.