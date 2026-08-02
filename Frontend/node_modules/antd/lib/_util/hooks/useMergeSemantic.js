"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useMergeSemantic = exports.resolveStyleOrClass = exports.mergeStyles = exports.mergeClassNames = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
// ========================= ClassNames =========================
const mergeClassNames = (schema, ...classNames) => {
  const mergedSchema = schema || {};
  return classNames.filter(Boolean).reduce((acc, cur) => {
    // Loop keys of the current classNames
    Object.keys(cur || {}).forEach(key => {
      const keySchema = mergedSchema[key];
      const curVal = cur[key];
      if (keySchema && typeof keySchema === 'object') {
        if (curVal && typeof curVal === 'object') {
          // Loop fill
          acc[key] = mergeClassNames(keySchema, acc[key], curVal);
        } else {
          // Covert string to object structure
          const {
            _default: defaultField
          } = keySchema;
          if (defaultField) {
            acc[key] = acc[key] || {};
            acc[key][defaultField] = (0, _clsx.clsx)(acc[key][defaultField], curVal);
          }
        }
      } else {
        // Flatten fill
        acc[key] = (0, _clsx.clsx)(acc[key], curVal);
      }
    });
    return acc;
  }, {});
};
exports.mergeClassNames = mergeClassNames;
const useSemanticClassNames = (schema, ...classNames) => {
  return React.useMemo(() => mergeClassNames.apply(void 0, [schema].concat(classNames)), [schema].concat(classNames));
};
// =========================== Styles ===========================
const mergeStyles = (...styles) => {
  return styles.filter(Boolean).reduce((acc, cur = {}) => {
    Object.keys(cur).forEach(key => {
      acc[key] = {
        ...acc[key],
        ...cur[key]
      };
    });
    return acc;
  }, {});
};
exports.mergeStyles = mergeStyles;
const useSemanticStyles = (...styles) => {
  return React.useMemo(() => mergeStyles.apply(void 0, styles), [].concat(styles));
};
// =========================== Export ===========================
const fillObjectBySchema = (obj, schema) => {
  const newObj = {
    ...obj
  };
  Object.keys(schema).forEach(key => {
    if (key !== '_default') {
      const nestSchema = schema[key];
      const nextValue = newObj[key] || {};
      newObj[key] = nestSchema ? fillObjectBySchema(nextValue, nestSchema) : nextValue;
    }
  });
  return newObj;
};
const resolveStyleOrClass = (value, info) => {
  return typeof value === 'function' ? value(info) : value;
};
/**
 * @desc Merge classNames and styles from multiple sources. When `schema` is provided, it **must** provide the nest object structure.
 * @descZH 合并来自多个来源的 classNames 和 styles，当提供了 `schema` 时，必须提供嵌套的对象结构。
 */
exports.resolveStyleOrClass = resolveStyleOrClass;
const useMergeSemantic = (classNamesList, stylesList, info, schema) => {
  const resolvedClassNamesList = classNamesList.map(classNames => classNames ? resolveStyleOrClass(classNames, info) : undefined);
  const resolvedStylesList = stylesList.map(styles => styles ? resolveStyleOrClass(styles, info) : undefined);
  const mergedClassNames = useSemanticClassNames.apply(void 0, [schema].concat((0, _toConsumableArray2.default)(resolvedClassNamesList)));
  const mergedStyles = useSemanticStyles.apply(void 0, (0, _toConsumableArray2.default)(resolvedStylesList));
  return React.useMemo(() => {
    if (!schema) {
      return [mergedClassNames, mergedStyles];
    }
    return [fillObjectBySchema(mergedClassNames, schema), fillObjectBySchema(mergedStyles, schema)];
  }, [mergedClassNames, mergedStyles, schema]);
};
exports.useMergeSemantic = useMergeSemantic;