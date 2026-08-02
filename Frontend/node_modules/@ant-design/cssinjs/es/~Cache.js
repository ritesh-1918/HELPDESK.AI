// [times, realValue]

const SPLIT = '%';

/** Connect key with `SPLIT` */
export function pathKey(keys) {
  return keys.join(SPLIT);
}
class Entity {
  instanceId;
  constructor(instanceId) {
    this.instanceId = instanceId;
  }

  /** @private Internal cache map. Do not access this directly */
  cache = new Map();
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
    } else {
      this.cache.set(keyPathStr, nextValue);
    }
  }
}
export default Entity;