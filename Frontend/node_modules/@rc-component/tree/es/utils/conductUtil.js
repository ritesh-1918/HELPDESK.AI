import warning from "@rc-component/util/es/warning";
import getEntity from "./keyUtil";
function removeFromCheckedKeys(halfCheckedKeys, checkedKeys) {
  const filteredKeys = new Set();
  halfCheckedKeys.forEach(key => {
    if (!checkedKeys.has(key)) {
      filteredKeys.add(key);
    }
  });
  return filteredKeys;
}
export function isCheckDisabled(node) {
  const {
    disabled,
    disableCheckbox,
    checkable
  } = node || {};
  return !!(disabled || disableCheckbox) || checkable === false;
}

// Fill miss keys
function fillConductCheck(keys, levelEntities, maxLevel, syntheticGetCheckDisabled) {
  const checkedKeys = new Set(keys);
  const halfCheckedKeys = new Set();

  // Add checked keys top to bottom
  for (let level = 0; level <= maxLevel; level += 1) {
    const entities = levelEntities.get(level) || new Set();
    entities.forEach(entity => {
      const {
        key,
        node,
        children = []
      } = entity;
      if (checkedKeys.has(key) && !syntheticGetCheckDisabled(node)) {
        children.filter(childEntity => !syntheticGetCheckDisabled(childEntity.node)).forEach(childEntity => {
          checkedKeys.add(childEntity.key);
        });
      }
    });
  }

  // Add checked keys from bottom to top
  const visitedKeys = new Set();
  for (let level = maxLevel; level >= 0; level -= 1) {
    const entities = levelEntities.get(level) || new Set();
    entities.forEach(entity => {
      const {
        parent,
        node
      } = entity;

      // Skip if no need to check
      if (syntheticGetCheckDisabled(node) || !entity.parent || visitedKeys.has(entity.parent.key)) {
        return;
      }

      // Skip if parent is disabled
      if (syntheticGetCheckDisabled(entity.parent.node)) {
        visitedKeys.add(parent.key);
        return;
      }
      let allChecked = true;
      let partialChecked = false;
      (parent.children || []).filter(childEntity => !syntheticGetCheckDisabled(childEntity.node)).forEach(({
        key
      }) => {
        const checked = checkedKeys.has(key);
        if (allChecked && !checked) {
          allChecked = false;
        }
        if (!partialChecked && (checked || halfCheckedKeys.has(key))) {
          partialChecked = true;
        }
      });
      if (allChecked) {
        checkedKeys.add(parent.key);
      }
      if (partialChecked) {
        halfCheckedKeys.add(parent.key);
      }
      visitedKeys.add(parent.key);
    });
  }
  return {
    checkedKeys: Array.from(checkedKeys),
    halfCheckedKeys: Array.from(removeFromCheckedKeys(halfCheckedKeys, checkedKeys))
  };
}

// Remove useless key
function cleanConductCheck(keys, halfKeys, levelEntities, maxLevel, syntheticGetCheckDisabled) {
  const checkedKeys = new Set(keys);
  let halfCheckedKeys = new Set(halfKeys);

  // Remove checked keys from top to bottom
  for (let level = 0; level <= maxLevel; level += 1) {
    const entities = levelEntities.get(level) || new Set();
    entities.forEach(entity => {
      const {
        key,
        node,
        children = []
      } = entity;
      if (!checkedKeys.has(key) && !halfCheckedKeys.has(key) && !syntheticGetCheckDisabled(node)) {
        children.filter(childEntity => !syntheticGetCheckDisabled(childEntity.node)).forEach(childEntity => {
          checkedKeys.delete(childEntity.key);
        });
      }
    });
  }

  // Remove checked keys form bottom to top
  halfCheckedKeys = new Set();
  const visitedKeys = new Set();
  for (let level = maxLevel; level >= 0; level -= 1) {
    const entities = levelEntities.get(level) || new Set();
    entities.forEach(entity => {
      const {
        parent,
        node
      } = entity;

      // Skip if no need to check
      if (syntheticGetCheckDisabled(node) || !entity.parent || visitedKeys.has(entity.parent.key)) {
        return;
      }

      // Skip if parent is disabled
      if (syntheticGetCheckDisabled(entity.parent.node)) {
        visitedKeys.add(parent.key);
        return;
      }
      let allChecked = true;
      let partialChecked = false;
      (parent.children || []).filter(childEntity => !syntheticGetCheckDisabled(childEntity.node)).forEach(({
        key
      }) => {
        const checked = checkedKeys.has(key);
        if (allChecked && !checked) {
          allChecked = false;
        }
        if (!partialChecked && (checked || halfCheckedKeys.has(key))) {
          partialChecked = true;
        }
      });
      if (!allChecked) {
        checkedKeys.delete(parent.key);
      }
      if (partialChecked) {
        halfCheckedKeys.add(parent.key);
      }
      visitedKeys.add(parent.key);
    });
  }
  return {
    checkedKeys: Array.from(checkedKeys),
    halfCheckedKeys: Array.from(removeFromCheckedKeys(halfCheckedKeys, checkedKeys))
  };
}

/**
 * Conduct with keys.
 * @param keyList current key list
 * @param keyEntities key - dataEntity map
 * @param mode `fill` to fill missing key, `clean` to remove useless key
 */
export function conductCheck(keyList, checked, keyEntities, getCheckDisabled) {
  const warningMissKeys = [];
  let syntheticGetCheckDisabled;
  if (getCheckDisabled) {
    syntheticGetCheckDisabled = getCheckDisabled;
  } else {
    syntheticGetCheckDisabled = isCheckDisabled;
  }

  // We only handle exist keys
  const keys = new Set(keyList.filter(key => {
    const hasEntity = !!getEntity(keyEntities, key);
    if (!hasEntity) {
      warningMissKeys.push(key);
    }
    return hasEntity;
  }));
  const levelEntities = new Map();
  let maxLevel = 0;

  // Convert entities by level for calculation
  Object.keys(keyEntities).forEach(key => {
    const entity = keyEntities[key];
    const {
      level
    } = entity;
    let levelSet = levelEntities.get(level);
    if (!levelSet) {
      levelSet = new Set();
      levelEntities.set(level, levelSet);
    }
    levelSet.add(entity);
    maxLevel = Math.max(maxLevel, level);
  });
  warning(!warningMissKeys.length, `Tree missing follow keys: ${warningMissKeys.slice(0, 100).map(key => `'${key}'`).join(', ')}`);
  let result;
  if (checked === true) {
    result = fillConductCheck(keys, levelEntities, maxLevel, syntheticGetCheckDisabled);
  } else {
    result = cleanConductCheck(keys, checked.halfCheckedKeys, levelEntities, maxLevel, syntheticGetCheckDisabled);
  }
  return result;
}