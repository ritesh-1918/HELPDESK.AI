"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const SPLIT = '__@field_split__';

/**
 * Convert name path into string to fast the fetch speed of Map.
 */
function normalize(namePath) {
  return namePath.map(cell => `${typeof cell}:${cell}`)
  // Magic split
  .join(SPLIT);
}

/**
 * NameMap like a `Map` but accepts `string[]` as key.
 */
class NameMap {
  kvs = new Map();
  set(key, value) {
    this.kvs.set(normalize(key), value);
  }
  get(key) {
    return this.kvs.get(normalize(key));
  }
  getAsPrefix(key) {
    const normalizedKey = normalize(key);
    const normalizedPrefix = normalizedKey + SPLIT;
    const results = [];
    const current = this.kvs.get(normalizedKey);
    if (current !== undefined) {
      results.push(current);
    }
    this.kvs.forEach((value, itemNormalizedKey) => {
      if (itemNormalizedKey.startsWith(normalizedPrefix)) {
        results.push(value);
      }
    });
    return results;
  }
  update(key, updater) {
    const origin = this.get(key);
    const next = updater(origin);
    if (!next) {
      this.delete(key);
    } else {
      this.set(key, next);
    }
  }
  delete(key) {
    this.kvs.delete(normalize(key));
  }

  // Since we only use this in test, let simply realize this
  map(callback) {
    return [...this.kvs.entries()].map(([key, value]) => {
      const cells = key.split(SPLIT);
      return callback({
        key: cells.map(cell => {
          const [, type, unit] = cell.match(/^([^:]*):(.*)$/);
          return type === 'number' ? Number(unit) : unit;
        }),
        value
      });
    });
  }
  toJSON() {
    const json = {};
    this.map(({
      key,
      value
    }) => {
      json[key.join('.')] = value;
      return null;
    });
    return json;
  }
}
var _default = exports.default = NameMap;