## API

### object([object], [id])

- object `Object` Object to get initialized as an "empty" object
- id `String` Custom id for the object

Initializing an object means adding an `_empty` property that keeps the previous state of the object after `change` events, and a `toJSON` function. This function proxies to the `clean` method and is there so that when you use `JSON.stringify(object)` the object stringified is the original (with no `_empty` property).

If called without arguments, the function returns a new object. 

```js
// Empty model with custom id
var model = __.object({}, 'foo');
```

### array([array], [id])

- array `Array` Array to get initialized as an "empty" array
- id `String` Custom id for the object

The same as `object()` but for arrays.

### bind(object)

- object `Object | Array` The object to bind the Empty methods to
- Returns: `Object` Object with instance methods

This function binds an object (or array) to an Empty instance and returns an object with its methods.

```js
var array = [1, 2, 3];

var bound = __.bind(array);

bound.push(4);
bound.shift();
```

### clean(object)

- object `Object | Array`
- Returns: `Object | Array` Clean copy of the object or array

This method is used internally by `toJSON`. It removes the `_empty` property and `toJSON`function added to the object when initialized.

### set(object, key, [value], [operation])

#### 'push'
#### 'pop'
#### 'concat'
#### 'inc'
#### 'toggle'

### unset(object, key)

Events: the same for set and unset

### get(object, key)

### Native array methods

### Custom methods

Events: …

### Static methods

#### configure
#### use
#### extend
#### mixin

```js

```