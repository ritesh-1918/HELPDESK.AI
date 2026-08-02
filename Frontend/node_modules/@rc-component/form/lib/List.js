"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var _FieldContext = _interopRequireDefault(require("./FieldContext"));
var _Field = _interopRequireDefault(require("./Field"));
var _valueUtil = require("./utils/valueUtil");
var _ListContext = _interopRequireDefault(require("./ListContext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function List({
  name,
  initialValue,
  children,
  rules,
  validateTrigger,
  isListField
}) {
  const context = React.useContext(_FieldContext.default);
  const wrapperListContext = React.useContext(_ListContext.default);
  const keyRef = React.useRef({
    keys: [],
    id: 0
  });
  const keyManager = keyRef.current;
  const prefixName = React.useMemo(() => {
    const parentPrefixName = (0, _valueUtil.getNamePath)(context.prefixName) || [];
    return [...parentPrefixName, ...(0, _valueUtil.getNamePath)(name)];
  }, [context.prefixName, name]);
  const fieldContext = React.useMemo(() => ({
    ...context,
    prefixName
  }), [context, prefixName]);

  // List context
  const listContext = React.useMemo(() => ({
    getKey: namePath => {
      const len = prefixName.length;
      const pathName = namePath[len];
      return [keyManager.keys[pathName], namePath.slice(len + 1)];
    }
  }), [keyManager, prefixName]);

  // User should not pass `children` as other type.
  if (typeof children !== 'function') {
    (0, _warning.default)(false, 'Form.List only accepts function as children.');
    return null;
  }
  const shouldUpdate = (prevValue, nextValue, {
    source
  }) => {
    if (source === 'internal') {
      return false;
    }
    return prevValue !== nextValue;
  };
  return /*#__PURE__*/React.createElement(_ListContext.default.Provider, {
    value: listContext
  }, /*#__PURE__*/React.createElement(_FieldContext.default.Provider, {
    value: fieldContext
  }, /*#__PURE__*/React.createElement(_Field.default, {
    name: [],
    shouldUpdate: shouldUpdate,
    rules: rules,
    validateTrigger: validateTrigger,
    initialValue: initialValue,
    isList: true,
    isListField: isListField ?? !!wrapperListContext
  }, ({
    value = [],
    onChange
  }, meta) => {
    const {
      getFieldValue
    } = context;
    const getNewValue = () => {
      const values = getFieldValue(prefixName || []);
      return values || [];
    };
    /**
     * Always get latest value in case user update fields by `form` api.
     */
    const operations = {
      add: (defaultValue, index) => {
        // Mapping keys
        const newValue = getNewValue();
        if (index >= 0 && index <= newValue.length) {
          keyManager.keys = [...keyManager.keys.slice(0, index), keyManager.id, ...keyManager.keys.slice(index)];
          onChange([...newValue.slice(0, index), defaultValue, ...newValue.slice(index)]);
        } else {
          if (process.env.NODE_ENV !== 'production' && (index < 0 || index > newValue.length)) {
            (0, _warning.default)(false, 'The second parameter of the add function should be a valid positive number.');
          }
          keyManager.keys = [...keyManager.keys, keyManager.id];
          onChange([...newValue, defaultValue]);
        }
        keyManager.id += 1;
      },
      remove: index => {
        const newValue = getNewValue();
        const indexSet = new Set(Array.isArray(index) ? index : [index]);
        if (indexSet.size <= 0) {
          return;
        }
        keyManager.keys = keyManager.keys.filter((_, keysIndex) => !indexSet.has(keysIndex));

        // Trigger store change
        onChange(newValue.filter((_, valueIndex) => !indexSet.has(valueIndex)));
      },
      move(from, to) {
        if (from === to) {
          return;
        }
        const newValue = getNewValue();

        // Do not handle out of range
        if (from < 0 || from >= newValue.length || to < 0 || to >= newValue.length) {
          return;
        }
        keyManager.keys = (0, _valueUtil.move)(keyManager.keys, from, to);

        // Trigger store change
        onChange((0, _valueUtil.move)(newValue, from, to));
      }
    };
    let listValue = value || [];
    if (!Array.isArray(listValue)) {
      listValue = [];
      if (process.env.NODE_ENV !== 'production') {
        (0, _warning.default)(false, `Current value of '${prefixName.join(' > ')}' is not an array type.`);
      }
    }
    return children(listValue.map((__, index) => {
      let key = keyManager.keys[index];
      if (key === undefined) {
        keyManager.keys[index] = keyManager.id;
        key = keyManager.keys[index];
        keyManager.id += 1;
      }
      return {
        name: index,
        key,
        isListField: true
      };
    }), operations, meta);
  })));
}
var _default = exports.default = List;