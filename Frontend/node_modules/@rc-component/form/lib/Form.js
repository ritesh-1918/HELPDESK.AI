"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _useForm = _interopRequireDefault(require("./hooks/useForm"));
var _FieldContext = _interopRequireWildcard(require("./FieldContext"));
var _FormContext = _interopRequireDefault(require("./FormContext"));
var _valueUtil = require("./utils/valueUtil");
var _ListContext = _interopRequireDefault(require("./ListContext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const Form = ({
  name,
  initialValues,
  fields,
  form,
  preserve,
  children,
  component: Component = 'form',
  validateMessages,
  validateTrigger = 'onChange',
  onValuesChange,
  onFieldsChange,
  onFinish,
  onFinishFailed,
  clearOnDestroy,
  ...restProps
}, ref) => {
  const nativeElementRef = React.useRef(null);
  const formContext = React.useContext(_FormContext.default);

  // We customize handle event since Context will makes all the consumer re-render:
  // https://reactjs.org/docs/context.html#contextprovider
  const [formInstance] = (0, _useForm.default)(form);
  const {
    useSubscribe,
    setInitialValues,
    setCallbacks,
    setValidateMessages,
    setPreserve,
    destroyForm
  } = formInstance.getInternalHooks(_FieldContext.HOOK_MARK);

  // Pass ref with form instance
  React.useImperativeHandle(ref, () => ({
    ...formInstance,
    nativeElement: nativeElementRef.current
  }));

  // Register form into Context
  React.useEffect(() => {
    formContext.registerForm(name, formInstance);
    return () => {
      formContext.unregisterForm(name);
    };
  }, [formContext, formInstance, name]);

  // Pass props to store
  setValidateMessages({
    ...formContext.validateMessages,
    ...validateMessages
  });
  setCallbacks({
    onValuesChange,
    onFieldsChange: (changedFields, ...rest) => {
      formContext.triggerFormChange(name, changedFields);
      if (onFieldsChange) {
        onFieldsChange(changedFields, ...rest);
      }
    },
    onFinish: values => {
      formContext.triggerFormFinish(name, values);
      if (onFinish) {
        onFinish(values);
      }
    },
    onFinishFailed
  });
  setPreserve(preserve);

  // Set initial value, init store value when first mount
  const mountRef = React.useRef(null);
  setInitialValues(initialValues, !mountRef.current);
  if (!mountRef.current) {
    mountRef.current = true;
  }

  // ========================== Unmount ===========================
  React.useEffect(() => () => destroyForm(clearOnDestroy),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  // Prepare children by `children` type
  let childrenNode;
  const childrenRenderProps = typeof children === 'function';
  if (childrenRenderProps) {
    const values = formInstance.getFieldsValue(true);
    childrenNode = children(values, formInstance);
  } else {
    childrenNode = children;
  }

  // Not use subscribe when using render props
  useSubscribe(!childrenRenderProps);

  // Listen if fields provided. We use ref to save prev data here to avoid additional render
  const prevFieldsRef = React.useRef(null);
  React.useEffect(() => {
    if (!(0, _valueUtil.isSimilar)(prevFieldsRef.current || [], fields || [])) {
      formInstance.setFields(fields || []);
    }
    prevFieldsRef.current = fields;
  }, [fields, formInstance]);

  // =========================== Render ===========================
  const formContextValue = React.useMemo(() => ({
    ...formInstance,
    validateTrigger
  }), [formInstance, validateTrigger]);
  const wrapperNode = /*#__PURE__*/React.createElement(_ListContext.default.Provider, {
    value: null
  }, /*#__PURE__*/React.createElement(_FieldContext.default.Provider, {
    value: formContextValue
  }, childrenNode));
  if (Component === false) {
    return wrapperNode;
  }
  return /*#__PURE__*/React.createElement(Component, _extends({}, restProps, {
    ref: nativeElementRef,
    onSubmit: event => {
      event.preventDefault();
      event.stopPropagation();
      formInstance.submit();
    },
    onReset: event => {
      event.preventDefault();
      formInstance.resetFields();
      restProps.onReset?.(event);
    }
  }), wrapperNode);
};
var _default = exports.default = Form;