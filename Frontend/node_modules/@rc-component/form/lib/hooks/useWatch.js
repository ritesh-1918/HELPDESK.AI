"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.stringify = stringify;
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var _react = require("react");
var _FieldContext = _interopRequireWildcard(require("../FieldContext"));
var _typeUtil = require("../utils/typeUtil");
var _valueUtil = require("../utils/valueUtil");
var _util = require("@rc-component/util");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function stringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return Math.random();
  }
}

// ------- selector type -------

// ------- selector type end -------

function useWatch(...args) {
  const [dependencies, _form = {}] = args;
  const options = (0, _typeUtil.isFormInstance)(_form) ? {
    form: _form
  } : _form;
  const form = options.form;
  const [value, setValue] = (0, _react.useState)(() => typeof dependencies === 'function' ? dependencies({}) : undefined);
  const valueStr = (0, _react.useMemo)(() => stringify(value), [value]);
  const valueStrRef = (0, _react.useRef)(valueStr);
  valueStrRef.current = valueStr;
  const fieldContext = (0, _react.useContext)(_FieldContext.default);
  const formInstance = form || fieldContext;
  const isValidForm = formInstance && formInstance._init;

  // Warning if not exist form instance
  if (process.env.NODE_ENV !== 'production') {
    (0, _warning.default)(args.length === 2 ? form ? isValidForm : true : isValidForm, 'useWatch requires a form instance since it can not auto detect from context.');
  }

  // ============================== Form ==============================
  const {
    getFieldsValue,
    getInternalHooks
  } = formInstance;
  const {
    registerWatch
  } = getInternalHooks(_FieldContext.HOOK_MARK);

  // ============================= Update =============================
  const triggerUpdate = (0, _util.useEvent)((values, allValues) => {
    const watchValue = options.preserve ? allValues ?? getFieldsValue(true) : values ?? getFieldsValue();
    const nextValue = typeof dependencies === 'function' ? dependencies(watchValue) : (0, _valueUtil.getValue)(watchValue, (0, _valueUtil.getNamePath)(dependencies));
    if (stringify(value) !== stringify(nextValue)) {
      setValue(nextValue);
    }
  });

  // ============================= Effect =============================
  const flattenDeps = typeof dependencies === 'function' ? dependencies : JSON.stringify(dependencies);

  // Deps changed
  (0, _react.useEffect)(() => {
    // Skip if not exist form instance
    if (!isValidForm) {
      return;
    }
    triggerUpdate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidForm, flattenDeps]);

  // Value changed
  (0, _react.useEffect)(() => {
    // Skip if not exist form instance
    if (!isValidForm) {
      return;
    }
    const cancelRegister = registerWatch((values, allValues) => {
      triggerUpdate(values, allValues);
    });
    return cancelRegister;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidForm]);
  return value;
}
var _default = exports.default = useWatch;