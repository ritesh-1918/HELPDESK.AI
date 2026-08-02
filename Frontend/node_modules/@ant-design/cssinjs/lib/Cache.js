"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.pathKey = pathKey;
// [times, realValue]

const SPLIT = '%';

/** Connect key with `SPLIT` */
function pathKey(keys) {
  return keys.join(SPLIT);
}

/** Record update id for extract static style order. */
let updateId = 0;
class Entity {
  instanceId;
  constructor(instanceId) {
    this.instanceId = instanceId;
  }

  /** @private Internal cache map. Do not access this directly */
  cache = new Map();

  /** @private Record update times for each key */
  updateTimes = new Map();
  extracted = new Set();
  get(keys) {
    return this.opGet(pathKey(keys));
  }

  /** A fast get cache with `get` concat. */
  opGet(keyPathStr) {
    return this.cache.get(keyPathStr) || null;
  }
  update(keys, valueFn) {
    return this.opUpdate(pathKey(keys), valueFn);
  }

  /** A fast get cache with `get` concat. */
  opUpdate(keyPathStr, valueFn) {
    const prevValue = this.cache.get(keyPathStr);
    const nextValue = valueFn(prevValue);
    if (nextValue === null) {
      this.cache.delete(keyPathStr);
      this.updateTimes.delete(keyPathStr);
    } else {
      this.cache.set(keyPathStr, nextValue);
      this.updateTimes.set(keyPathStr, updateId);
      updateId += 1;
    }
  }
}
var _default = exports.default = Entity;