"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createContext = createContext;
exports.useContext = useContext;
var _useEvent = _interopRequireDefault(require("@rc-component/util/lib/hooks/useEvent"));
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _isEqual = _interopRequireDefault(require("@rc-component/util/lib/isEqual"));
var React = _interopRequireWildcard(require("react"));
var _reactDom = require("react-dom");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function createContext(defaultValue) {
  const Context = /*#__PURE__*/React.createContext(undefined);
  const Provider = ({
    value,
    children
  }) => {
    const valueRef = React.useRef(value);
    valueRef.current = value;
    const [context] = React.useState(() => ({
      getValue: () => valueRef.current,
      listeners: new Set()
    }));
    (0, _useLayoutEffect.default)(() => {
      (0, _reactDom.unstable_batchedUpdates)(() => {
        context.listeners.forEach(listener => {
          listener(value);
        });
      });
    }, [value]);
    return /*#__PURE__*/React.createElement(Context.Provider, {
      value: context
    }, children);
  };
  return {
    Context,
    Provider,
    defaultValue
  };
}

/** e.g. useSelect(userContext) => user */

/** e.g. useSelect(userContext, user => user.name) => user.name */

/** e.g. useSelect(userContext, ['name', 'age']) => user { name, age } */

/** e.g. useSelect(userContext, 'name') => user.name */

function useContext(holder, selector) {
  const eventSelector = (0, _useEvent.default)(typeof selector === 'function' ? selector : ctx => {
    if (selector === undefined) {
      return ctx;
    }
    if (!Array.isArray(selector)) {
      return ctx[selector];
    }
    const obj = {};
    selector.forEach(key => {
      obj[key] = ctx[key];
    });
    return obj;
  });
  const context = React.useContext(holder?.Context);
  const {
    listeners,
    getValue
  } = context || {};
  const valueRef = React.useRef();
  valueRef.current = eventSelector(context ? getValue() : holder?.defaultValue);
  const [, forceUpdate] = React.useState({});
  (0, _useLayoutEffect.default)(() => {
    if (!context) {
      return;
    }
    function trigger(nextValue) {
      const nextSelectorValue = eventSelector(nextValue);
      if (!(0, _isEqual.default)(valueRef.current, nextSelectorValue, true)) {
        forceUpdate({});
      }
    }
    listeners.add(trigger);
    return () => {
      listeners.delete(trigger);
    };
  }, [context]);
  return valueRef.current;
}