"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VariantContext = exports.NoStyleItemContext = exports.NoFormStyle = exports.FormProvider = exports.FormItemPrefixContext = exports.FormItemInputContext = exports.FormContext = void 0;
var React = _interopRequireWildcard(require("react"));
var _form = require("@rc-component/form");
var _util = require("@rc-component/util");
const FormContext = exports.FormContext = /*#__PURE__*/React.createContext({
  labelAlign: 'right',
  layout: 'horizontal',
  itemRef: () => {}
});
const NoStyleItemContext = exports.NoStyleItemContext = /*#__PURE__*/React.createContext(null);
const FormProvider = props => {
  const providerProps = (0, _util.omit)(props, ['prefixCls']);
  return /*#__PURE__*/React.createElement(_form.FormProvider, {
    ...providerProps
  });
};
exports.FormProvider = FormProvider;
const FormItemPrefixContext = exports.FormItemPrefixContext = /*#__PURE__*/React.createContext({
  prefixCls: ''
});
const FormItemInputContext = exports.FormItemInputContext = /*#__PURE__*/React.createContext({});
if (process.env.NODE_ENV !== 'production') {
  FormItemInputContext.displayName = 'FormItemInputContext';
}
const NoFormStyle = ({
  children,
  status,
  override
}) => {
  const formItemInputContext = React.useContext(FormItemInputContext);
  const newFormItemInputContext = React.useMemo(() => {
    const newContext = {
      ...formItemInputContext
    };
    if (override) {
      delete newContext.isFormItemInput;
    }
    if (status) {
      delete newContext.status;
      delete newContext.hasFeedback;
      delete newContext.feedbackIcon;
    }
    return newContext;
  }, [status, override, formItemInputContext]);
  return /*#__PURE__*/React.createElement(FormItemInputContext.Provider, {
    value: newFormItemInputContext
  }, children);
};
exports.NoFormStyle = NoFormStyle;
const VariantContext = exports.VariantContext = /*#__PURE__*/React.createContext(undefined);