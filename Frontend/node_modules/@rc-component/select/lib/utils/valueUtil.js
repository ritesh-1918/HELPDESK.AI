"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fillFieldNames = fillFieldNames;
exports.flattenOptions = flattenOptions;
exports.getSeparatedContent = void 0;
exports.injectPropsWithOption = injectPropsWithOption;
exports.isValidCount = isValidCount;
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function getKey(data, index) {
  const {
    key
  } = data;
  let value;
  if ('value' in data) {
    ({
      value
    } = data);
  }
  if (key !== null && key !== undefined) {
    return key;
  }
  if (value !== undefined) {
    return value;
  }
  return `rc-index-key-${index}`;
}
function isValidCount(value) {
  return typeof value !== 'undefined' && !Number.isNaN(value);
}
function fillFieldNames(fieldNames, childrenAsData) {
  const {
    label,
    value,
    options,
    groupLabel
  } = fieldNames || {};
  const mergedLabel = label || (childrenAsData ? 'children' : 'label');
  return {
    label: mergedLabel,
    value: value || 'value',
    options: options || 'options',
    groupLabel: groupLabel || mergedLabel
  };
}

/**
 * Flat options into flatten list.
 * We use `optionOnly` here is aim to avoid user use nested option group.
 * Here is simply set `key` to the index if not provided.
 */
function flattenOptions(options, {
  fieldNames,
  childrenAsData
} = {}) {
  const flattenList = [];
  const {
    label: fieldLabel,
    value: fieldValue,
    options: fieldOptions,
    groupLabel
  } = fillFieldNames(fieldNames, false);
  function dig(list, isGroupOption) {
    if (!Array.isArray(list)) {
      return;
    }
    list.forEach(data => {
      if (isGroupOption || !(fieldOptions in data)) {
        const value = data[fieldValue];

        // Option
        flattenList.push({
          key: getKey(data, flattenList.length),
          groupOption: isGroupOption,
          data,
          label: data[fieldLabel],
          value
        });
      } else {
        let grpLabel = data[groupLabel];
        if (grpLabel === undefined && childrenAsData) {
          grpLabel = data.label;
        }

        // Option Group
        flattenList.push({
          key: getKey(data, flattenList.length),
          group: true,
          data,
          label: grpLabel
        });
        dig(data[fieldOptions], true);
      }
    });
  }
  dig(options, false);
  return flattenList;
}

/**
 * Inject `props` into `option` for legacy usage
 */
function injectPropsWithOption(option) {
  const newOption = {
    ...option
  };
  if (!('props' in newOption)) {
    Object.defineProperty(newOption, 'props', {
      get() {
        (0, _warning.default)(false, 'Return type is option instead of Option instance. Please read value directly instead of reading from `props`.');
        return newOption;
      }
    });
  }
  return newOption;
}
const getSeparatedContent = (text, tokens, end) => {
  if (!tokens || !tokens.length) {
    return null;
  }
  let match = false;
  const separate = (str, [token, ...restTokens]) => {
    if (!token) {
      return [str];
    }
    const list = str.split(token);
    match = match || list.length > 1;
    return list.reduce((prevList, unitStr) => [...prevList, ...separate(unitStr, restTokens)], []).filter(Boolean);
  };
  const list = separate(text, tokens);
  if (match) {
    return typeof end !== 'undefined' ? list.slice(0, end) : list;
  } else {
    return null;
  }
};
exports.getSeparatedContent = getSeparatedContent;