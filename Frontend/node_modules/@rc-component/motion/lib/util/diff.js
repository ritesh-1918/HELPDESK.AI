"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.STATUS_REMOVED = exports.STATUS_REMOVE = exports.STATUS_KEEP = exports.STATUS_ADD = void 0;
exports.diffKeys = diffKeys;
exports.parseKeys = parseKeys;
exports.wrapKeyToObject = wrapKeyToObject;
const STATUS_ADD = exports.STATUS_ADD = 'add';
const STATUS_KEEP = exports.STATUS_KEEP = 'keep';
const STATUS_REMOVE = exports.STATUS_REMOVE = 'remove';
const STATUS_REMOVED = exports.STATUS_REMOVED = 'removed';
function wrapKeyToObject(key) {
  let keyObj;
  if (key && typeof key === 'object' && 'key' in key) {
    keyObj = key;
  } else {
    keyObj = {
      key: key
    };
  }
  return {
    ...keyObj,
    key: String(keyObj.key)
  };
}
function parseKeys(keys = []) {
  return keys.map(wrapKeyToObject);
}
function diffKeys(prevKeys = [], currentKeys = []) {
  let list = [];
  let currentIndex = 0;
  const currentLen = currentKeys.length;
  const prevKeyObjects = parseKeys(prevKeys);
  const currentKeyObjects = parseKeys(currentKeys);

  // Check prev keys to insert or keep
  prevKeyObjects.forEach(keyObj => {
    let hit = false;
    for (let i = currentIndex; i < currentLen; i += 1) {
      const currentKeyObj = currentKeyObjects[i];
      if (currentKeyObj.key === keyObj.key) {
        // New added keys should add before current key
        if (currentIndex < i) {
          list = list.concat(currentKeyObjects.slice(currentIndex, i).map(obj => ({
            ...obj,
            status: STATUS_ADD
          })));
          currentIndex = i;
        }
        list.push({
          ...currentKeyObj,
          status: STATUS_KEEP
        });
        currentIndex += 1;
        hit = true;
        break;
      }
    }

    // If not hit, it means key is removed
    if (!hit) {
      list.push({
        ...keyObj,
        status: STATUS_REMOVE
      });
    }
  });

  // Add rest to the list
  if (currentIndex < currentLen) {
    list = list.concat(currentKeyObjects.slice(currentIndex).map(obj => ({
      ...obj,
      status: STATUS_ADD
    })));
  }

  /**
   * Merge same key when it remove and add again:
   *    [1 - add, 2 - keep, 1 - remove] -> [1 - keep, 2 - keep]
   */
  const keys = {};
  list.forEach(({
    key
  }) => {
    keys[key] = (keys[key] || 0) + 1;
  });
  const duplicatedKeys = Object.keys(keys).filter(key => keys[key] > 1);
  duplicatedKeys.forEach(matchKey => {
    // Remove `STATUS_REMOVE` node.
    list = list.filter(({
      key,
      status
    }) => key !== matchKey || status !== STATUS_REMOVE);

    // Update `STATUS_ADD` to `STATUS_KEEP`
    list.forEach(node => {
      if (node.key === matchKey) {
        // eslint-disable-next-line no-param-reassign
        node.status = STATUS_KEEP;
      }
    });
  });
  return list;
}