// Inspired by and mostly directly copied from:
// https://github.com/juliangruber/deep-access
// https://github.com/substack/js-traverse

module.exports = keypath;

function keypath (obj, path, value) {
  if (arguments.length === 3) return set.apply(null, arguments);
  return get.apply(null, arguments);
}

function get (obj, path) {
  var keys = path.split('.');

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!obj || !hasOwnProperty.call(obj, key)) {
      obj = undefined;
      break;
    }
    obj = obj[key];
  }

  return obj;
}

function set (obj, path, value) {
  var keys = path.split('.');

  for (var i = 0; i < keys.length - 1; i++) {
    var key = keys[i];
    if (!hasOwnProperty.call(obj, key)) obj[key] = {};
    obj = obj[key];
  }

  obj[keys[i]] = value;
  return value;
}