var defaults = {
  idKey: 'id',
  delimiter: ':',  
  events: null,
  map: {
    emit: 'emit'
  },
  methods: {},
  native: ['push', 'pop', 'unshift', 'shift', 'sort', 'filter', 'map', 'reverse']
};

var dotty = {};



function Empty () {
  if (!(this instanceof Empty)) {
    return new Empty();
  }

  if (!Empty.config.events) {
    throw new Error('You need to call Empty.use before using Empty');
  }

  // Add array methods to Empty.prototype.
  augment();

  // Call EventEmitter's constructor.
  if (typeof Empty.config.events === 'function') {
    Empty.config.events.call(this);
  }
}

Empty.config = defaults;



// Set EventEmitter library to work with.
// This must be set before anything else.

Empty.use = function (Events) {
  mixin.call(Empty, Events);

  Empty.config.events = Events;
  return Empty;
};

// Copy options to Empty.config.

Empty.configure = function (options) {
  // Call `use` to inherit EventEmitter behaviour. 
  if (options.events) Empty.use(options.events);

  Empty.config = extend({}, defaults, options);
};

// There if you need them.

Empty.extend = extend;

Empty.mixin = mixin;



// Proxy method to map to external library API.

Empty.prototype._emit = function () {
  this[Empty.config.map.emit].apply(this, arguments);
};

// Curry-esque method that returns an Empty instance with an object or array bound to it.  
//
//     var model = evented.bind(object);
//     model.set('foo', 'bar');

Empty.prototype.bind = function (object) {
  var self = this;
  var bindings = {};
  var objectMethods = ['id', 'set', 'unset', 'get'];
  var arrayMethods = ['id', 'push', 'pop', 'shift', 'unshift', 'sort', 'filter'];
  var methods = Array.isArray(object) ? arrayMethods : objectMethods;

  methods.forEach(function (method) {
    bindings[method] = function () {
      var args = [].slice.call(arguments);
      args.unshift(object);
      return self[method].apply(self, args);
    };
  });
  
  return bindings;
};

// Id getter/setter.

Empty.prototype.id = function (object, value) {
  ensureId.call(this, object, value);

  if (!value) return object._empty.id;
};

// For persisting a "clean" object or array.
// Used by toJSON function.

Empty.prototype.raw = function (object) {
  var copy = Array.isArray(object) ? object.slice() : extend({}, object);

  if (copy._empty) {
    copy._empty = void 0;
    delete copy._empty;
  }

  if (copy.toJSON) {
    copy.toJSON = void 0;
    delete copy.toJSON;
  }

  return copy;
};

// Initialize object with evented meta data.

Empty.prototype.object = function (existent, id) {
  return initialize(existent || {}, id);
};

// Initialize array with evented meta data.

Empty.prototype.array = function (existent, id) {
  return initialize(existent || [], id);
};

Empty.prototype.set = function (object, key, value, op) {
  var previous;
  var obj;
  var _key;
  var id;
  var d = Empty.config.delimiter;

  if (!object._empty) initialize(object);

  // Handle 'key' argument as object.
  if (typeof key === 'object' && !value) {
    obj = key;
    id = ensureId.call(this, object, key[Empty.config.idKey]);

    for (_key in obj) {
      previous = object[_key];
      object[_key] = obj[_key];

      if (typeof previous !== 'undefined' && previous != obj[_key]) {
        object._empty.previous[_key] = previous;
        
        this._emit(['change', _key].join(d), object);
        this._emit(['change', _key, id].join(d), object);
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
    set(object, key, value);
  }

  if (typeof previous !== 'undefined' && previous != value) {
    set(object._empty.previous, key, previous);

    this._emit('change', object);
    this._emit(['change', key].join(d), object);
    this._emit(['change', key, id].join(d), object);
  }

  return object;
};

Empty.prototype.unset = function (object, key) {
  var _key;
  var previous;
  var id;
  var d = Empty.config.delimiter;
  
  if (!object._empty) initialize(object);

  // If no key, clear object.
  // TODO: fix.
  if (!key) {
    for (_key in object) {
      if (_key !== '_empty') {
        object[_key] = void 0;
        delete object[_key];
      }
    }

    return initialize(object);
  }

  previous = get(object, key);
  id = ensureId.call(this, object, key);

  if (unset(object, key)) {
    this._emit('change', object);
    this._emit(['change', key].join(d), object);
  } 

  return previous;
};

// Convenience method.

Empty.prototype.get = function (object, key) {
  return get(object, key);
};



function set (object, key, value) {
  return dotty.put(object, key, value);
}

// Perform array operations directly on object properties.
// e.g. `evented.set(object, 'foo', 1, 'push');`
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

function update (fn, object, key, value) {
  var target;
  var result;

  target = dotty.get(object, key);
  result = fn(target, value);

  return dotty.put(object, key, result);
}

function unset (object, key) {
  return dotty.remove(object, key);
}

function get (object, key) {
  return dotty.get(object, key);
}

function extend (target) {
  var sources = [].slice.call(arguments, 1);

  sources.forEach(function (source) {
    var key;
    for (key in source) if (source.hasOwnProperty(key)) target[key] = source[key];
  });

  return target;
}

function mixin (source) {
  var methods;

  if (typeof source === 'function') {
    // Save a copy of own prototype methods.
    methods = extend({}, this.prototype);

    // Set prototype for correct inheritance.
    this.prototype = Object.create(source.prototype);
    
    // Restore original methods.
    extend(this.prototype, methods);
  } else {
    extend(this.prototype, source);
  }

  return this;
}

function toJSON () {
  return Empty.prototype.raw(this);
}

function generateId () {
  // https://github.com/mkuklis/depot.js/blob/master/depot.js#L207
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

// Make sure _empty.id is synced to the objects idKey property.
// So if the property being set is the id itself, the change:key:id event uses the latest id.

function ensureId (object, key, value) {
  if (!object._empty) initialize(object);
  
  var oldId = object._empty.id;
  var ownId = object[Empty.config.idKey];

  // Case: Empty#id.
  if (typeof key === 'undefined' 
      && typeof value === 'undefined' 
      && typeof ownId !== 'undefined') {
    
    object._empty.id = ownId;

    return object._empty.id;
  }

  // Case: Empty#set.
  if (typeof key === 'string' 
      && key === 'id' 
      && typeof value === 'string') {
      
    object._empty.id = value;

    return object._empty.id;
  }

  // Case: Empty#set with object as key.
  if (typeof key === 'string'
      && key !== oldId 
      && typeof value === 'undefined') {
    
    object._empty.id = key;
  }

  return object._empty.id;
}

function initialize (object, id) {
  if (!object._empty) object._empty = {};
  
  var ownId = object[Empty.config.idKey];
  var otherId = object._empty.id || id || generateId();

  object._empty.id = ownId || otherId;
  object._empty.previous = {};
  object._empty.persisted = false;

  object.toJSON = toJSON;

  return object;
}

function augment () {
  var methods = Empty.config.methods;
  var keys = Object.keys(methods);
  var d = Empty.config.delimiter;

  // Add extra methods to prototype.

  keys.forEach(function (key) {

    Empty.prototype[key] = function (object) {
      var result = methods[key].apply(null, arguments);

      if (!object._empty) initialize(object);

      this._emit(key, object, result);
      this._emit([key, object._empty.id].join(d), object, result);

      return result;
    };

  });

  // Add Array native methods to prototype.

  Empty.config.native.forEach(function (method) {

    Empty.prototype[method] = function (array) {
      var args = [].slice.call(arguments, 1);
      var result = Array.prototype[method].apply(array, args);

      if (!array._empty) initialize(array);

      this._emit(method, array, result);
      this._emit([method, array._empty.id].join(d), array, result);

      return result;
    };

  });
}

// Modification of [dotty](http://github.com/deoxxa/dotty).
// License: 3-clause BSD.

dotty.validate = function (object, path) {
  if (typeof path === 'string') path = path.split('.');

  if (!(path instanceof Array) || path.length === 0) return false;

  if (typeof object !== 'object') return false;

  return path.slice();
};

dotty.get = function get (object, path) {
  var key;
  
  path = dotty.validate(object, path);
  if (!path) return;

  key = path.shift();

  if (path.length === 0) return object[key];

  if (path.length) return get(object[key], path);
};


dotty.put = function put (object, path, value) {
  var key;
  
  path = dotty.validate(object, path);
  if (!path) return;

  key = path.shift();

  if (path.length === 0) {
    object[key] = value;
  } else {
    if (typeof object[key] === 'undefined') object[key] = {};

    if (typeof object[key] !== 'object' || object[key] === null) return false;

    return put(object[key], path, value);
  }
};

dotty.remove = function remove (object, path, value) {
  var key;
  
  path = dotty.validate(object, path);
  if (!path) return;

  key = path.shift();

  if (path.length === 0) {
    if (!Object.hasOwnProperty.call(object, key)) return false;

    object[key] = void 0;
    delete object[key];

    return true;
  } else {
    return remove(object[key], path, value);
  }
};



if (typeof define === 'function' && define.amd) {
  // AMD.
  define(function () { return Empty; });
} else if (typeof window !== 'undefined') {
  // Browser global.
  window.Empty = Empty;
}

if (typeof module === 'object' && module.exports) {
  // CommonJS.
  module.exports = Empty;
}