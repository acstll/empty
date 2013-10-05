try {
  var deep = require('deep-get-set');
  deep.p = true;
} catch (err) {
  if (!deep) {
    deep = function (obj, path, value) {
      if (arguments.length === 3) obj[path] = value;
      return obj[path];
    };
  }
}

var defaults = {
  idKey: 'id',
  name: 'empty',
  delimiter: ':',  
  events: null,
  map: {
    emit: 'emit'
  },
  methods: {},
  native: [
    'filter',
    'map',
    'push',
    'pop',
    'reverse',
    'shift',
    'sort',
    'splice',
    'unshift',
  ]
};



try { module.exports = Empty; }
catch (err) { if (typeof window !== 'undefined') window.Empty = Empty; }

function Empty () {
  if (!(this instanceof Empty)) return new Empty();

  if (!Empty.config.events)
    throw new Error('You need to call Empty.configure before using Empty');

  // Call EventEmitter's constructor.
  if (typeof Empty.config.events === 'function')
    Empty.config.events.call(this);
}

Empty.configure = function (options) {
  if (typeof options !== 'object')
    throw new Error('Empty.configure requires an options object as first argument');

  var Events = options.events;

  if (Events) {
    mixin(Empty, Events);
    Empty.config.events = Events;
  }

  Empty.config = extend({}, defaults, options);
  
  // Add methods (custom and native) to Empty.prototype
  augment();
};

Empty.wrap = function (object, id) {
  var args, instance;
  
  object = object || {};
  if (!object[Empty.config.name]) initialize(object, id);
  
  if (typeof object === 'function') {
    args = [].slice.call(arguments, 1);
    instance = Object.create(object.prototype);
    object.apply(instance, args);
    return (new Empty()).bind(instance);
  }

  return (new Empty()).bind(object);
};

Empty.initialize = initialize;
Empty.mixin = mixin;
Empty.extend = extend;

Empty.config = defaults;
Empty.VERSION = '0.2.0';



// Proxy method to map to external library API.

Empty.prototype._emit = function () {
  this[Empty.config.map.emit].apply(this, arguments);
};

// Curry-esque method that returns an Empty instance with an object bound to it.

Empty.prototype.bind = function (object) {
  this.origin = object;
  return this;
};

// Id getter/setter.

Empty.prototype.id = apply(function (object, value) {
  ensureId.call(this, object, value);

  if (!value) return object[Empty.config.name].id;
});

Empty.prototype.state = apply(function (object, key, value) {
  if (!object[Empty.config.name]) initialize(object);

  if (typeof value === 'undefined')
    return object[Empty.config.name].state[key];

  object[Empty.config.name].state[key] = value;
});

Empty.prototype.set = apply(function (object, key, value, op) {
  var previous, action, id, _object, _key;
  var d = Empty.config.delimiter;

  if (!object[Empty.config.name]) initialize(object);

  // Handle 'key' argument as object.
  if (typeof key === 'object' && !value) {
    _object = key;
    id = ensureId.call(this, object, key[Empty.config.idKey]);

    for (_key in _object) {
      value = _object[_key];
      previous = object[_key];
      action = value ? set : unset;
      action(object, _key, value);

      if (previous !== _object[_key]) {
        set(object[Empty.config.name].previous, _key, previous);
        
        this._emit(['change', _key, id].join(d), object);
        this._emit(['change', _key].join(d), object);
      }  
    }
    
    this._emit('change', object);
    return object;
  }

  // Handle normal key, value arguments.
  previous = get(object, key);
  id = ensureId.call(this, object, key, value);

  if (typeof op === 'string') {
    set[op](object, key, value);
  } else {
    action = value ? set : unset;
    action(object, key, value);
  }

  if (previous !== value) {
    set(object[Empty.config.name].previous, key + '', previous);

    this._emit(['change', key, id].join(d), object);
    this._emit(['change', key].join(d), object);
    this._emit('change', object);
  }

  return object;
});

// Convenience methods.

Empty.prototype.unset = apply(function (object, key) {
  return this.set(object, key, void 0);
});

Empty.prototype.get = apply(function (object, key) {
  return get(object, key);
});

// For bound objects.

Empty.prototype.toJSON = function () {
  return this.origin;
};



function apply (fn) {
  return function () {
    var args = [].slice.call(arguments);
    if (typeof this.origin === 'object') args.unshift(this.origin);

    return fn.apply(this, args);
  };
}

function set (object, key, value) {
  // Support array bracket notation e.g. array[1] = 'foo'
  // with Empty#set(array, 1, 'foo');
  if (Array.isArray(object) && typeof key === 'number') {
    object[key] = value;
    return value;
  }

  return deep(object, key, value);
}

// Perform array operations directly on object properties.
// e.g. `__.set(object, 'foo', 1, 'push');`
// is the same as `object.foo.push(1)`.  
// `object.foo` being an array.

set.push = function () {
  var args = [].slice.call(arguments);
  args.unshift(operation);
  
  function operation (target, value) {
    target.push(value);
    return target;
  }
  
  return update.apply(null, args);
};

set.pop = function () {
  var args = [].slice.call(arguments);
  args.unshift(operation);
  
  function operation (target, value) {
    target.pop(value);
    return target;
  }
  
  return update.apply(null, args);
};

set.concat = function () {
  var args = [].slice.call(arguments);
  args.unshift(operation);
  
  function operation (target, value) {
    return target.concat(value);
  }
  
  return update.apply(null, args);
};

set.inc = function () {
  var args = [].slice.call(arguments);
  args.unshift(operation);
  
  function operation (target, value) {
    return value ? target + value : target + 1;
  }
  
  return update.apply(null, args);
};

set.toggle = function () {
  var args = [].slice.call(arguments);
  args.unshift(operation);
  
  function operation (target, value) {
    return !target;
  }
  
  return update.apply(null, args);
};

function update (fn, object, key, value) {
  var target;
  var result;

  target = deep(object, key);
  result = fn(target, value);

  return deep(object, key, result);
}

function unset (object, key) {
  return deep(object, key, void 0);
}

function get (object, key) {
  if (Array.isArray(object) && typeof key === 'number') return object[key];
  return deep(object, key);
}



function extend (target) {
  var sources = [].slice.call(arguments, 1);

  sources.forEach(function (source) {
    var key;
    for (key in source) if (source.hasOwnProperty(key)) target[key] = source[key];
  });

  return target;
}

function mixin (target, source) {
  var methods;

  if (typeof source === 'function') {
    // Save a copy of own prototype methods.
    methods = extend({}, target.prototype);

    // Set prototype for correct inheritance.
    target.prototype = Object.create(source.prototype);
    
    // Restore original methods.
    extend(target.prototype, methods);
  } else {
    extend(target.prototype, source);
  }

  return target;
}



function initialize (object, id) {
  object = object || {};

  if (!object[Empty.config.name]) {
    Object.defineProperty(object, Empty.config.name, {
      enumerable: false,
      configurable: false,
      writable: true,
      value: empty(id || object[Empty.config.idKey])
    });
  }
  
  return object;
}

function empty (id) {
  return {
    id: id || generateId(),
    state: {},
    previous: {}
  };
}

function augment () {
  var methods = Empty.config.methods;
  var keys = Object.keys(methods);
  var d = Empty.config.delimiter;
  
  // Add extra methods to Empty prototype.

  keys.forEach(function (key) {

    Empty.prototype[key] = apply(function (object) {
      if (!object[Empty.config.name]) initialize(object);
      
      var result = methods[key].apply(null, arguments);
      var id = object[Empty.config.name].id;

      this._emit(key, object, result);
      this._emit([key, id].join(d), object, result);
      this._emit(['change', id].join(d), object, result, key);

      return result;
    });

  });

  // Add Array native methods to Empty prototype.

  Empty.config.native.forEach(function (method) {

    Empty.prototype[method] = apply(function (array) {
      if (!array[Empty.config.name]) initialize(array);
      
      var args = [].slice.call(arguments, 1);
      var result = Array.prototype[method].apply(array, args);
      var id = array[Empty.config.name].id;

      this._emit(method, array, result);
      this._emit([method, id].join(d), array, result);
      this._emit(['change', id].join(d), array, result, method);

      return result;
    });

  });
}

function generateId () {
  // https://github.com/mkuklis/depot.js/blob/master/depot.js#L207
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

// Make sure empty.id is synced to the objects idKey property.
// So if the property being set is the id itself, the change:key:id event uses the latest id.

function ensureId (object, key, value) {
  if (!object[Empty.config.name]) initialize(object);
  
  var oldId = object[Empty.config.name].id;
  var ownId = object[Empty.config.idKey];

  // Case: Empty#id.
  if (typeof key === 'undefined' 
      && typeof value === 'undefined' 
      && typeof ownId !== 'undefined') {
    
    object[Empty.config.name].id = ownId;

    return object[Empty.config.name].id;
  }

  // Case: Empty#set.
  if (typeof key === 'string' 
      && key === 'id' 
      && typeof value === 'string') {
      
    object[Empty.config.name].id = value;

    return object[Empty.config.name].id;
  }

  // Case: Empty#set with object as key.
  if (typeof key === 'string'
      && key !== oldId 
      && typeof value === 'undefined') {
    
    object[Empty.config.name].id = key;
  }

  return object[Empty.config.name].id;
}