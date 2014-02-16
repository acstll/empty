# Empty.js

Evented object and array operations with the events library of your choice. Or a Model class.

*This is a work in progress and I don't expect you to use this at all.*

This little library should fit modular, diy MV* architectures where:

- Plain classes for models and plain arrays for collections just suffice.
- You're already working with an EventeEmitter library in your project and don't want every other libray you use having its own implementation of pub/sub.
- You want to listen for changes on regular and/or custom operations.

## Install

Use with [browserify](https://github.com/substack/node-browserify) or [gluejs](https://github.com/mixu/gluejs). With [npm](https://npmjs.org) do:

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
var EventEmitter3 = require('eventemitter3');
```

Call `Empty.configure` with the EventEmitter library as 'events' in a hash:

```js
Empty.configure({
  events: EventEmitter3
});
```

Make an instance, `new` is optional. Pass in your actual model object.

```js
var collection = new Empty([1, 2, 3, 4]);
```

Use it like this:

```js
collection.on('push', function (array, elem) {
	console.log('pushed ' + elem + ' to numbers collection');
});

collection.push(5);
> 5
> 'pushed 5 to numbers collection'

collection.origin.length;
> 5
```

## Motivation

I'm writing this for mainly one reason: **to learn JavaScript**.

All kind of feedback is very welcome.
