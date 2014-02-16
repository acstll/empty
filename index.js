(function () {
  'use strict';

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
    ],
    set: function (obj, key, value) {
      if (arguments.length === 3) obj[key] = value;
      return obj[key];
    }
  };



  try { module.exports = Empty; }
  catch (err) { if (typeof window !== 'undefined') window.Empty = Empty; }

  function Empty () {
    if (!Empty.config.events)
      throw new Error('You need to call Empty.configure before using Empty');

    if (!(this instanceof Empty)) {
      if (arguments.length > 0) return Empty.wrap.apply(null, arguments);
      return new Empty(); 
    }

    // Call EventEmitter's constructor.
    if (typeof Empty.config.events === 'function')
      Empty.config.events.call(this);

    this.map = assign({}, Empty.config.map);
    this.idKey = Empty.config.idKey;
  }

  Empty.configure = function (options) {
    var native = {};
    var Events = options.events;

    if (Events) {
      mixin(Empty, Events);
      Empty.config.events = Events;
    } else if (!Empty.config.events) {
      throw new Error('options.events should refer to an EventEmitter library');
    }

    Empty.config = assign({}, defaults, options);
    
    // Add native array methods to Empty.prototype
    Empty.config.native.forEach(function (key) {
      if (typeof Array.prototype[key] === 'function')
        native[key] = Array.prototype[key];
    });
    augment(native, true);

    // Add custom methods to Empty.prototype
    augment(Empty.config.methods);
  };

  Empty.wrap = function (object, id) {
    var args, instance;
    
    object = object || {};
    if (typeof id !== 'undefined') object[Empty.config.idKey] = id;
    
    if (typeof object === 'function') {
      args = [].slice.call(arguments, 1);
      instance = Object.create(object.prototype);
      object.apply(instance, args);
      return (new Empty()).bind(instance);
    }

    return (new Empty()).bind(object);
  };

  Empty.mixin = mixin;
  Empty.assign = assign;

  Empty.config = defaults;
  Empty.VERSION = '0.3.0';



  // Proxy method to map to external library API.

  Empty.prototype._emit = function () {
    this[this.map.emit].apply(this, arguments);
  };

  // Curry-esque method that returns an Empty instance with an object bound to it.

  Empty.prototype.bind = function (object) {
    if (typeof this.origin === 'object')
      throw new Error('Cannot call #bind on an already bound Empty instace');

    this.origin = object;
    this.previous = {};

    if (typeof this.initialize === 'function') this.initialize.apply(this);

    return this;
  };

  Empty.prototype.id = apply(function (object) {
    if (typeof this.origin === 'object')
      return this.origin[Empty.config.idKey];
  });

  Empty.prototype.set = apply(function (object, values, op) {
    var key, previous, action, value;
    var id = values[Empty.config.idKey] || object[Empty.config.idKey];
    var changed = Object.create(null);
    var d = Empty.config.delimiter;
    
    for (key in values) {
      value = values[key];
      previous = get(object, key);

      if (typeof op === 'string') {
        set[op](object, key, value);
      } else {
        action = value ? set : unset;
        action(object, key, value);
      }

      if (previous !== value) {
        set(changed, key + '', previous);
        if (id) this._emit(['change', key, id].join(d), object);
        this._emit(['change', key].join(d), object);
      }  
    }
    
    if (Object.keys(changed).length > 0) {
      if (this.previous) this.previous = changed;
      this._emit('change', object);
    }

    return object;
  });

  Empty.prototype.get = apply(function (object, key) {
    return get(object, key);
  });

  Empty.prototype.unset = apply(function (object, values) {
    return this.set(object, values, void 0);
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
    // with Empty#set(array, { 1: null }, 'foo');
    if (Array.isArray(object) && typeof key === 'number') {
      object[key] = value;
      return value;
    }

    return Empty.config.set(object, key, value);
  }

  // Perform array operations directly on object properties.
  // e.g. `__.set(object, { 'foo': 1 }, 'push');`
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

    target = Empty.config.set(object, key);
    result = fn(target, value);

    return Empty.config.set(object, key, result);
  }

  function unset (object, key) {
    return Empty.config.set(object, key, void 0);
  }

  function get (object, key) {
    if (Array.isArray(object) && typeof key === 'number') return object[key];
    return Empty.config.set(object, key);
  }



  function assign (target) {
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
      methods = assign({}, target.prototype);

      // Set prototype for correct inheritance.
      target.prototype = Object.create(source.prototype);
      
      // Restore original methods.
      assign(target.prototype, methods);
    } else {
      assign(target.prototype, source);
    }

    return target;
  }



  function augment (methods, isNative) {
    var d = Empty.config.delimiter;
    
    Object.keys(methods).forEach(function (key) {
      Empty.prototype[key] = apply(function (object) {
        var args = isNative ? [].slice.call(arguments, 1) : arguments;
        var context = isNative ? object : null;
        var id = object[Empty.config.idKey];
        var result = methods[key].apply(context, args);

        this._emit(key, object, result);
        if (id) {
          this._emit([key, id].join(d), object, result);
          this._emit(['change', id].join(d), object, result, key);
        }

        return result;
      });
    });
  }
})();
