## API

### Static methods

#### configure
#### initialize
#### wrap

#### extend
#### mixin

```js

```

### Constructor…

### id
### state

### bind(object)

- object `Object | Array` The object to bind the Empty methods to
- Returns: `Object` Object with instance methods

This function binds an object (or array) to the Empty instance and returns an object with its methods.

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