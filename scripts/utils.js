String.prototype.$fmt = function() {
  var args = arguments;
  return this.replace(/\{(\d+)\}/g, function(str, m1) {
    if (m1 >= args.length) return str;
    return args[m1];
  });
};
function $type(o) {
  var types = {};
  ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Undefined', 'Null'].
    forEach(function(n) { types['[object ' + n + ']'] = n.toLowerCase(); });
  return types[Object.prototype.toString.call(o)] || 'object';
}
