"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.OverrideProvider = void 0;
var React = _interopRequireWildcard(require("react"));
var _ref = require("@rc-component/util/lib/ref");
var _ContextIsolator = _interopRequireDefault(require("../_util/ContextIsolator"));
const OverrideContext = /*#__PURE__*/React.createContext(null);
/** @internal Only used for Dropdown component. Do not use this in your production. */
const OverrideProvider = exports.OverrideProvider = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    children,
    ...restProps
  } = props;
  const override = React.useContext(OverrideContext);
  const context = React.useMemo(() => ({
    ...override,
    ...restProps
  }), [override, restProps.prefixCls,
  // restProps.expandIcon, Not mark as deps since this is a ReactNode
  restProps.mode, restProps.selectable, restProps.rootClassName
  // restProps.validator, Not mark as deps since this is a function
  ]);
  const canRef = (0, _ref.supportNodeRef)(children);
  const mergedRef = (0, _ref.useComposeRef)(ref, canRef ? (0, _ref.getNodeRef)(children) : null);
  return /*#__PURE__*/React.createElement(OverrideContext.Provider, {
    value: context
  }, /*#__PURE__*/React.createElement(_ContextIsolator.default, {
    space: true
  }, canRef ? /*#__PURE__*/React.cloneElement(children, {
    ref: mergedRef
  }) : children));
});
/** @internal Only used for Dropdown component. Do not use this in your production. */
var _default = exports.default = OverrideContext;