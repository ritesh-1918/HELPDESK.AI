"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _react = _interopRequireWildcard(require("react"));
var _commonUtils = require("./utils/commonUtils");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const BaseInput = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    inputElement: inputEl,
    children,
    prefixCls,
    prefix,
    suffix,
    addonBefore,
    addonAfter,
    className,
    style,
    disabled,
    readOnly,
    focused,
    triggerFocus,
    allowClear,
    value,
    handleReset,
    hidden,
    classes,
    classNames,
    dataAttrs,
    styles,
    components,
    onClear
  } = props;
  const inputElement = children ?? inputEl;
  const AffixWrapperComponent = components?.affixWrapper || 'span';
  const GroupWrapperComponent = components?.groupWrapper || 'span';
  const WrapperComponent = components?.wrapper || 'span';
  const GroupAddonComponent = components?.groupAddon || 'span';
  const containerRef = (0, _react.useRef)(null);
  const onInputClick = e => {
    if (containerRef.current?.contains(e.target)) {
      triggerFocus?.();
    }
  };
  const hasAffix = (0, _commonUtils.hasPrefixSuffix)(props);
  let element = /*#__PURE__*/(0, _react.cloneElement)(inputElement, {
    value,
    className: (0, _clsx.clsx)(inputElement.props?.className, !hasAffix && classNames?.variant) || null
  });

  // ======================== Ref ======================== //
  const groupRef = (0, _react.useRef)(null);
  _react.default.useImperativeHandle(ref, () => ({
    nativeElement: groupRef.current || containerRef.current
  }));

  // ================== Prefix & Suffix ================== //
  if (hasAffix) {
    // ================== Clear Icon ================== //
    let clearIcon = null;
    if (allowClear) {
      const needClear = !disabled && !readOnly && value;
      const clearIconCls = `${prefixCls}-clear-icon`;
      const iconNode = typeof allowClear === 'object' && allowClear?.clearIcon ? allowClear.clearIcon : '✖';
      clearIcon = /*#__PURE__*/_react.default.createElement("button", {
        type: "button",
        tabIndex: -1,
        onClick: event => {
          handleReset?.(event);
          onClear?.();
        }
        // Do not trigger onBlur when clear input
        // https://github.com/ant-design/ant-design/issues/31200
        ,
        onMouseDown: e => e.preventDefault(),
        className: (0, _clsx.clsx)(clearIconCls, {
          [`${clearIconCls}-hidden`]: !needClear,
          [`${clearIconCls}-has-suffix`]: !!suffix
        })
      }, iconNode);
    }
    const affixWrapperPrefixCls = `${prefixCls}-affix-wrapper`;
    const affixWrapperCls = (0, _clsx.clsx)(affixWrapperPrefixCls, {
      [`${prefixCls}-disabled`]: disabled,
      [`${affixWrapperPrefixCls}-disabled`]: disabled,
      // Not used, but keep it
      [`${affixWrapperPrefixCls}-focused`]: focused,
      // Not used, but keep it
      [`${affixWrapperPrefixCls}-readonly`]: readOnly,
      [`${affixWrapperPrefixCls}-input-with-clear-btn`]: suffix && allowClear && value
    }, classes?.affixWrapper, classNames?.affixWrapper, classNames?.variant);
    const suffixNode = (suffix || allowClear) && /*#__PURE__*/_react.default.createElement("span", {
      className: (0, _clsx.clsx)(`${prefixCls}-suffix`, classNames?.suffix),
      style: styles?.suffix
    }, clearIcon, suffix);
    element = /*#__PURE__*/_react.default.createElement(AffixWrapperComponent, _extends({
      className: affixWrapperCls,
      style: styles?.affixWrapper,
      onClick: onInputClick
    }, dataAttrs?.affixWrapper, {
      ref: containerRef
    }), prefix && /*#__PURE__*/_react.default.createElement("span", {
      className: (0, _clsx.clsx)(`${prefixCls}-prefix`, classNames?.prefix),
      style: styles?.prefix
    }, prefix), element, suffixNode);
  }

  // ================== Addon ================== //
  if ((0, _commonUtils.hasAddon)(props)) {
    const wrapperCls = `${prefixCls}-group`;
    const addonCls = `${wrapperCls}-addon`;
    const groupWrapperCls = `${wrapperCls}-wrapper`;
    const mergedWrapperClassName = (0, _clsx.clsx)(`${prefixCls}-wrapper`, wrapperCls, classes?.wrapper, classNames?.wrapper);
    const mergedGroupClassName = (0, _clsx.clsx)(groupWrapperCls, {
      [`${groupWrapperCls}-disabled`]: disabled
    }, classes?.group, classNames?.groupWrapper);

    // Need another wrapper for changing display:table to display:inline-block
    // and put style prop in wrapper
    element = /*#__PURE__*/_react.default.createElement(GroupWrapperComponent, {
      className: mergedGroupClassName,
      ref: groupRef
    }, /*#__PURE__*/_react.default.createElement(WrapperComponent, {
      className: mergedWrapperClassName
    }, addonBefore && /*#__PURE__*/_react.default.createElement(GroupAddonComponent, {
      className: addonCls
    }, addonBefore), element, addonAfter && /*#__PURE__*/_react.default.createElement(GroupAddonComponent, {
      className: addonCls
    }, addonAfter)));
  }

  // `className` and `style` are always on the root element
  return /*#__PURE__*/_react.default.cloneElement(element, {
    className: (0, _clsx.clsx)(element.props?.className, className) || null,
    style: {
      ...element.props?.style,
      ...style
    },
    hidden
  });
});
var _default = exports.default = BaseInput;