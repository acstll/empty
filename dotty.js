// Modification of [dotty](http://github.com/deoxxa/dotty).
// License: 3-clause BSD.

var dotty = module.exports = {};

function validate (object, path) {
  if (typeof path === 'string') path = path.split('.');
  if (!(path instanceof Array) || path.length === 0) return false;
  if (typeof object !== 'object') return false;
  return path.slice();
};

dotty.get = function get (object, path) {  
  path = validate(object, path);
  if (!path) return;

  var key = path.shift();

  if (path.length === 0) return object[key];
  if (path.length) return get(object[key], path);
};


dotty.put = function put (object, path, value) {  
  path = validate(object, path);
  if (!path) return;

  var key = path.shift();

  if (path.length === 0) {
    object[key] = value;
  } else {
    if (typeof object[key] === 'undefined') object[key] = {};
    if (typeof object[key] !== 'object' || object[key] === null) return false;

    return put(object[key], path, value);
  }
};

dotty.remove = function remove (object, path, value) {
  path = validate(object, path);
  if (!path) return;

  var key = path.shift();

  if (path.length === 0) {
    if (!Object.hasOwnProperty.call(object, key)) return false;

    delete object[key];

    return true;
  } else {
    return remove(object[key], path, value);
  }
};