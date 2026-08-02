"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _react = _interopRequireDefault(require("react"));
var _CloseOutlined = _interopRequireDefault(require("@ant-design/icons/CloseOutlined"));
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var _clsx = require("clsx");
var _isNonNullable = _interopRequireDefault(require("../_util/isNonNullable"));
var _Button = _interopRequireDefault(require("../button/Button"));
var _locale = require("../locale");
var _en_US = _interopRequireDefault(require("../locale/en_US"));
// Due to the independent design of Panel, it will be too coupled to put in rc-tour,
// so a set of Panel logic is implemented separately in antd.
const TourPanel = props => {
  const {
    stepProps,
    current,
    type,
    indicatorsRender,
    actionsRender
  } = props;
  const {
    prefixCls,
    total = 1,
    title,
    onClose,
    onPrev,
    onNext,
    onFinish,
    cover,
    description,
    nextButtonProps,
    prevButtonProps,
    type: stepType,
    closable,
    classNames = {},
    styles = {}
  } = stepProps;
  const mergedType = stepType ?? type;
  const ariaProps = (0, _pickAttrs.default)(closable ?? {}, true);
  const [contextLocaleGlobal] = (0, _locale.useLocale)('global', _en_US.default.global);
  const [contextLocaleTour] = (0, _locale.useLocale)('Tour', _en_US.default.Tour);
  const mergedCloseIcon = /*#__PURE__*/_react.default.createElement("button", {
    type: "button",
    onClick: onClose,
    className: `${prefixCls}-close`,
    "aria-label": contextLocaleGlobal?.close,
    ...ariaProps
  }, closable?.closeIcon || /*#__PURE__*/_react.default.createElement(_CloseOutlined.default, {
    className: `${prefixCls}-close-icon`
  }));
  const isLastStep = current === total - 1;
  const prevBtnClick = () => {
    onPrev?.();
    prevButtonProps?.onClick?.();
  };
  const nextBtnClick = () => {
    if (isLastStep) {
      onFinish?.();
    } else {
      onNext?.();
    }
    nextButtonProps?.onClick?.();
  };
  const headerNode = (0, _isNonNullable.default)(title) ? (/*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-header`, classNames.header),
    style: styles.header
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-title`, classNames.title),
    style: styles.title
  }, title))) : null;
  const descriptionNode = (0, _isNonNullable.default)(description) ? (/*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-description`, classNames.description),
    style: styles.description
  }, description)) : null;
  const coverNode = (0, _isNonNullable.default)(cover) ? (/*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-cover`, classNames.cover),
    style: styles.cover
  }, cover)) : null;
  let mergedIndicatorNode;
  if (indicatorsRender) {
    mergedIndicatorNode = indicatorsRender(current, total);
  } else {
    mergedIndicatorNode = (0, _toConsumableArray2.default)(Array.from({
      length: total
    }).keys()).map((stepItem, index) => (/*#__PURE__*/_react.default.createElement("span", {
      key: stepItem,
      className: (0, _clsx.clsx)(index === current && `${prefixCls}-indicator-active`, `${prefixCls}-indicator`, classNames.indicator),
      style: styles.indicator
    })));
  }
  const mainBtnType = mergedType === 'primary' ? 'default' : 'primary';
  const secondaryBtnProps = {
    type: 'default',
    ghost: mergedType === 'primary'
  };
  const defaultActionsNode = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, current !== 0 ? (/*#__PURE__*/_react.default.createElement(_Button.default, {
    size: "small",
    ...secondaryBtnProps,
    ...prevButtonProps,
    onClick: prevBtnClick,
    className: (0, _clsx.clsx)(`${prefixCls}-prev-btn`, prevButtonProps?.className)
  }, prevButtonProps?.children ?? contextLocaleTour?.Previous)) : null, /*#__PURE__*/_react.default.createElement(_Button.default, {
    size: "small",
    type: mainBtnType,
    ...nextButtonProps,
    onClick: nextBtnClick,
    className: (0, _clsx.clsx)(`${prefixCls}-next-btn`, nextButtonProps?.className)
  }, nextButtonProps?.children ?? (isLastStep ? contextLocaleTour?.Finish : contextLocaleTour?.Next)));
  return /*#__PURE__*/_react.default.createElement("div", {
    className: `${prefixCls}-panel`
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-section`, classNames.section),
    style: styles.section
  }, closable && mergedCloseIcon, coverNode, headerNode, descriptionNode, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-footer`, classNames.footer),
    style: styles.footer
  }, total > 1 && (/*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-indicators`, classNames.indicators),
    style: styles.indicators
  }, mergedIndicatorNode)), /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-actions`, classNames.actions),
    style: styles.actions
  }, actionsRender ? actionsRender(defaultActionsNode, {
    current,
    total
  }) : defaultActionsNode))));
};
var _default = exports.default = TourPanel;