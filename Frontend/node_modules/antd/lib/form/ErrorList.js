"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var React = _interopRequireWildcard(require("react"));
var _motion = _interopRequireWildcard(require("@rc-component/motion"));
var _clsx = require("clsx");
var _isNonNullable = _interopRequireDefault(require("../_util/isNonNullable"));
var _motion2 = _interopRequireDefault(require("../_util/motion"));
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _context = require("./context");
var _useDebounce = _interopRequireDefault(require("./hooks/useDebounce"));
var _style = _interopRequireDefault(require("./style"));
const EMPTY_LIST = [];
function toErrorEntity(error, prefix, errorStatus, index = 0) {
  return {
    key: typeof error === 'string' ? error : `${prefix}-${index}`,
    error,
    errorStatus
  };
}
const ErrorList = ({
  help,
  helpStatus,
  errors = EMPTY_LIST,
  warnings = EMPTY_LIST,
  className: rootClassName,
  fieldId,
  onVisibleChanged
}) => {
  const {
    prefixCls
  } = React.useContext(_context.FormItemPrefixContext);
  const baseClassName = `${prefixCls}-item-explain`;
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const collapseMotion = React.useMemo(() => (0, _motion2.default)(prefixCls), [prefixCls]);
  // We have to debounce here again since somewhere use ErrorList directly still need no shaking
  // ref: https://github.com/ant-design/ant-design/issues/36336
  const debounceErrors = (0, _useDebounce.default)(errors);
  const debounceWarnings = (0, _useDebounce.default)(warnings);
  const fullKeyList = React.useMemo(() => {
    if ((0, _isNonNullable.default)(help)) {
      return [toErrorEntity(help, 'help', helpStatus)];
    }
    return [].concat((0, _toConsumableArray2.default)(debounceErrors.map((error, index) => toErrorEntity(error, 'error', 'error', index))), (0, _toConsumableArray2.default)(debounceWarnings.map((warning, index) => toErrorEntity(warning, 'warning', 'warning', index))));
  }, [help, helpStatus, debounceErrors, debounceWarnings]);
  const filledKeyFullKeyList = React.useMemo(() => {
    const keysCount = {};
    fullKeyList.forEach(({
      key
    }) => {
      keysCount[key] = (keysCount[key] || 0) + 1;
    });
    return fullKeyList.map((entity, index) => ({
      ...entity,
      key: keysCount[entity.key] > 1 ? `${entity.key}-fallback-${index}` : entity.key
    }));
  }, [fullKeyList]);
  const helpProps = {};
  if (fieldId) {
    helpProps.id = `${fieldId}_help`;
  }
  return /*#__PURE__*/React.createElement(_motion.default, {
    motionDeadline: collapseMotion.motionDeadline,
    motionName: `${prefixCls}-show-help`,
    visible: !!filledKeyFullKeyList.length,
    onVisibleChanged: onVisibleChanged
  }, holderProps => {
    const {
      className: holderClassName,
      style: holderStyle
    } = holderProps;
    return /*#__PURE__*/React.createElement("div", {
      ...helpProps,
      className: (0, _clsx.clsx)(baseClassName, holderClassName, cssVarCls, rootCls, rootClassName, hashId),
      style: holderStyle
    }, /*#__PURE__*/React.createElement(_motion.CSSMotionList, {
      keys: filledKeyFullKeyList,
      ...(0, _motion2.default)(prefixCls),
      motionName: `${prefixCls}-show-help-item`,
      component: false
    }, itemProps => {
      const {
        key,
        error,
        errorStatus,
        className: itemClassName,
        style: itemStyle
      } = itemProps;
      return /*#__PURE__*/React.createElement("div", {
        key: key,
        className: (0, _clsx.clsx)(itemClassName, {
          [`${baseClassName}-${errorStatus}`]: errorStatus
        }),
        style: itemStyle
      }, error);
    }));
  });
};
var _default = exports.default = ErrorList;