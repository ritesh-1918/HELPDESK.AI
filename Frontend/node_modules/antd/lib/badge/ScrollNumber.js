"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _reactNode = require("../_util/reactNode");
var _configProvider = require("../config-provider");
var _SingleNumber = _interopRequireDefault(require("./SingleNumber"));
const ScrollNumber = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    count,
    className,
    motionClassName,
    style,
    title,
    show,
    component: Component = 'sup',
    children,
    ...restProps
  } = props;
  const {
    getPrefixCls
  } = React.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('scroll-number', customizePrefixCls);
  // ============================ Render ============================
  const newProps = {
    ...restProps,
    'data-show': show,
    style,
    className: (0, _clsx.clsx)(prefixCls, className, motionClassName),
    title: title
  };
  // Only integer need motion
  let numberNodes = count;
  if (count && Number(count) % 1 === 0) {
    const numberList = String(count).split('');
    numberNodes = /*#__PURE__*/React.createElement("bdi", null, numberList.map((num, i) => (/*#__PURE__*/React.createElement(_SingleNumber.default, {
      prefixCls: prefixCls,
      count: Number(count),
      value: num,
      // eslint-disable-next-line react/no-array-index-key
      key: numberList.length - i
    }))));
  }
  // allow specify the border
  // mock border-color by box-shadow for compatible with old usage:
  // <Badge count={4} style={{ backgroundColor: '#fff', color: '#999', borderColor: '#d9d9d9' }} />
  if (style?.borderColor) {
    newProps.style = {
      ...style,
      boxShadow: `0 0 0 1px ${style.borderColor} inset`
    };
  }
  if (children) {
    return (0, _reactNode.cloneElement)(children, oriProps => ({
      className: (0, _clsx.clsx)(`${prefixCls}-custom-component`, oriProps?.className, motionClassName)
    }));
  }
  return /*#__PURE__*/React.createElement(Component, {
    ...newProps,
    ref: ref
  }, numberNodes);
});
var _default = exports.default = ScrollNumber;