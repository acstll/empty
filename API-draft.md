## API

### Static methods

#### configure
#### wrap (Constructor)

```js

```

### id
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

### set(object, values, [operation])

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