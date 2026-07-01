"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findExpandedKeys = findExpandedKeys;
exports.getExpandRange = getExpandRange;
function findExpandedKeys(prev = [], next = []) {
  const prevLen = prev.length;
  const nextLen = next.length;
  if (Math.abs(prevLen - nextLen) !== 1) {
    return {
      add: false,
      key: null
    };
  }
  function find(shorter, longer) {
    const cache = new Map();
    shorter.forEach(key => {
      cache.set(key, true);
    });
    const keys = longer.filter(key => !cache.has(key));
    return keys.length === 1 ? keys[0] : null;
  }
  if (prevLen < nextLen) {
    return {
      add: true,
      key: find(prev, next)
    };
  }
  return {
    add: false,
    key: find(next, prev)
  };
}
function getExpandRange(shorter, longer, key) {
  const shorterStartIndex = shorter.findIndex(data => data.key === key);
  const shorterEndNode = shorter[shorterStartIndex + 1];
  const longerStartIndex = longer.findIndex(data => data.key === key);
  if (shorterEndNode) {
    const longerEndIndex = longer.findIndex(data => data.key === shorterEndNode.key);
    return longer.slice(longerStartIndex + 1, longerEndIndex);
  }
  return longer.slice(longerStartIndex + 1);
}