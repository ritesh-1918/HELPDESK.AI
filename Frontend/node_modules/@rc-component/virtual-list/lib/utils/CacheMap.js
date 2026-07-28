"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
// Firefox has low performance of map.
class CacheMap {
  maps;

  // Used for cache key
  // `useMemo` no need to update if `id` not change
  id = 0;
  diffRecords = new Map();
  constructor() {
    this.maps = Object.create(null);
  }
  set(key, value) {
    // Record prev value
    this.diffRecords.set(key, this.maps[key]);
    this.maps[key] = value;
    this.id += 1;
  }
  get(key) {
    return this.maps[key];
  }

  /**
   * CacheMap will record the key changed.
   * To help to know what's update in the next render.
   */
  resetRecord() {
    this.diffRecords.clear();
  }
  getRecord() {
    return this.diffRecords;
  }
}
var _default = exports.default = CacheMap;