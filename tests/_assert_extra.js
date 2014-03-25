var assert, assertTypeOf, libxmljs, typeOf;

assert = require('assert');
libxmljs = require('libxmljs');

assert.hasTag = function(xml, xpath, expected, message) {
  var doc, element;
  doc = libxmljs.parseHtmlString(xml);
  element = doc.find(xpath);
  if (element[0] === void 0) {
    throw new Error("XPath '" + xpath + "' was not found in the document.");
  } else if (!(expected === element[0].text())) {
    return assert.fail(xml, expected, message || ("expected " + xml + " to have xpath " + xpath + " with content " + expected), "hasTag", assert.hasTag);
  }
};

assert.hasTagMatch = function(xml, xpath, expected, message) {
  var doc, element;
  doc = libxmljs.parseHtmlString(xml);
  element = doc.find(xpath);
  if (element[0] === void 0) {
    throw new Error("XPath '" + xpath + "' was not found in the document.");
  } else if (!(expected.test(element[0].text()))) {
    return assert.fail(xml, expected, message || ("expected " + xml + " to have xpath " + xpath + " with content " + expected), "hasTag", assert.hasTag);
  }
};

assert.match = function(actual, expected, message) {
  if (typeOf(expected) === 'string') {
    expected = new RegExp(expected);
  }
  if (!expected.test(actual)) {
    return assert.fail(actual, expected, message || ("expected " + actual + " to match " + expected), "match", assert.match);
  }
};

assert.matches = assert.match;

assert.instanceOf = function(actual, expected, message) {
  if (!(actual instanceof expected)) {
    return assert.fail(actual, expected, message || ("expected " + actual + " to be an instance of " + expected), "instanceof", assert.instanceOf);
  }
};

assert.typeOf = function(actual, expected, message) {
  return assertTypeOf(actual, expected, message, assert.typeOf);
};

assert.inDelta = function(actual, expected, delta, message) {
  if (!(Math.abs(actual - expected) <= delta)) {
    return assert.fail(actual, expected, message || ("expected " + actual + " to be within " + delta + " of " + expected + " but difference was " + (Math.abs(actual - expected))), "inDelta", assert.inDelta);
  }
};

assertTypeOf = function(actual, expected, message, caller) {
  if (typeOf(actual) !== expected) {
    return assert.fail(actual, expected, message || ("expected " + actual + " to be of type " + expected), "typeOf", caller);
  }
};

typeOf = function(value) {
  var s, types;
  s = typeof value;
  types = [Object, Array, String, RegExp, Number, Function, Boolean, Date];
  if (s === 'object' || s === 'function') {
    if (value) {
      types.forEach(function(t) {
        if (value instanceof t) {
          return s = t.name.toLowerCase();
        }
      });
    } else {
      s = 'null';
    }
  }
  return s;
};
