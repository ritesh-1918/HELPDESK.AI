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
var _util = require("@rc-component/util");
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var _clsx = require("clsx");
var _hooks = require("../../_util/hooks");
var _statusUtils = require("../../_util/statusUtils");
var _warning = require("../../_util/warning");
var _context = require("../../config-provider/context");
var _useSize = _interopRequireDefault(require("../../config-provider/hooks/useSize"));
var _context2 = require("../../form/context");
var _otp = _interopRequireDefault(require("../style/otp"));
var _OTPInput = _interopRequireDefault(require("./OTPInput"));
function strToArr(str) {
  return (str || '').split('');
}
const Separator = props => {
  const {
    index,
    prefixCls,
    separator,
    className: semanticClassName,
    style: semanticStyle
  } = props;
  const separatorNode = typeof separator === 'function' ? separator(index) : separator;
  if (!separatorNode) {
    return null;
  }
  return /*#__PURE__*/React.createElement("span", {
    className: (0, _clsx.clsx)(`${prefixCls}-separator`, semanticClassName),
    style: semanticStyle
  }, separatorNode);
};
const OTP = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    length = 6,
    size: customSize,
    defaultValue,
    value,
    onChange,
    formatter,
    separator,
    variant,
    disabled,
    status: customStatus,
    autoFocus,
    mask,
    type,
    autoComplete,
    onInput,
    onFocus,
    inputMode,
    classNames,
    styles,
    className,
    style,
    ...restProps
  } = props;
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Input.OTP');
    process.env.NODE_ENV !== "production" ? warning(!(typeof mask === 'string' && mask.length > 1), 'usage', '`mask` prop should be a single character.') : void 0;
  }
  const {
    classNames: contextClassNames,
    styles: contextStyles,
    getPrefixCls,
    direction,
    style: contextStyle,
    className: contextClassName
  } = (0, _context.useComponentConfig)('otp');
  const prefixCls = getPrefixCls('otp', customizePrefixCls);
  const mergedProps = {
    ...props,
    length
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const domAttrs = (0, _pickAttrs.default)(restProps, {
    aria: true,
    data: true,
    attr: true
  });
  // ========================= Root =========================
  // Style
  const [hashId, cssVarCls] = (0, _otp.default)(prefixCls);
  // ========================= Size =========================
  const mergedSize = (0, _useSize.default)(ctx => customSize ?? ctx);
  // ======================== Status ========================
  const formContext = React.useContext(_context2.FormItemInputContext);
  const mergedStatus = (0, _statusUtils.getMergedStatus)(formContext.status, customStatus);
  const proxyFormContext = React.useMemo(() => ({
    ...formContext,
    status: mergedStatus,
    hasFeedback: false,
    feedbackIcon: null
  }), [formContext, mergedStatus]);
  // ========================= Refs =========================
  const containerRef = React.useRef(null);
  const refs = React.useRef({});
  React.useImperativeHandle(ref, () => ({
    focus: () => {
      refs.current[0]?.focus();
    },
    blur: () => {
      for (let i = 0; i < length; i += 1) {
        refs.current[i]?.blur();
      }
    },
    nativeElement: containerRef.current
  }));
  // ======================= Formatter ======================
  const internalFormatter = txt => formatter ? formatter(txt) : txt;
  // ======================== Values ========================
  const [valueCells, setValueCells] = React.useState(() => strToArr(internalFormatter(defaultValue || '')));
  React.useEffect(() => {
    if (value !== undefined) {
      setValueCells(strToArr(value));
    }
  }, [value]);
  const triggerValueCellsChange = (0, _util.useEvent)(nextValueCells => {
    setValueCells(nextValueCells);
    if (onInput) {
      onInput(nextValueCells);
    }
    // Trigger if all cells are filled
    if (onChange && nextValueCells.length === length && nextValueCells.every(c => c) && nextValueCells.some((c, index) => valueCells[index] !== c)) {
      onChange(nextValueCells.join(''));
    }
  });
  const patchValue = (0, _util.useEvent)((index, txt) => {
    let nextCells = (0, _toConsumableArray2.default)(valueCells);
    // Fill cells till index
    for (let i = 0; i < index; i += 1) {
      if (!nextCells[i]) {
        nextCells[i] = '';
      }
    }
    if (txt.length <= 1) {
      nextCells[index] = txt;
    } else {
      nextCells = nextCells.slice(0, index).concat(strToArr(txt));
    }
    nextCells = nextCells.slice(0, length);
    // Clean the last empty cell
    for (let i = nextCells.length - 1; i >= 0; i -= 1) {
      if (nextCells[i]) {
        break;
      }
      nextCells.pop();
    }
    // Format if needed
    const formattedValue = internalFormatter(nextCells.map(c => c || ' ').join(''));
    nextCells = strToArr(formattedValue).map((c, i) => {
      if (c === ' ' && !nextCells[i]) {
        return nextCells[i];
      }
      return c;
    });
    return nextCells;
  });
  // ======================== Change ========================
  const onInputChange = (index, txt) => {
    const nextCells = patchValue(index, txt);
    const nextIndex = Math.min(index + txt.length, length - 1);
    if (nextIndex !== index && nextCells[index] !== undefined) {
      refs.current[nextIndex]?.focus();
    }
    triggerValueCellsChange(nextCells);
  };
  const onInputActiveChange = nextIndex => {
    refs.current[nextIndex]?.focus();
  };
  // ======================== Focus ========================
  const onInputFocus = (event, index) => {
    // keep focus on the first empty cell
    for (let i = 0; i < index; i += 1) {
      if (!refs.current[i]?.input?.value) {
        refs.current[i]?.focus();
        break;
      }
    }
    onFocus?.(event);
  };
  // ======================== Render ========================
  const inputSharedProps = {
    variant,
    disabled,
    status: mergedStatus,
    mask,
    type,
    inputMode,
    autoComplete
  };
  return /*#__PURE__*/React.createElement("div", {
    ...domAttrs,
    ref: containerRef,
    className: (0, _clsx.clsx)(className, prefixCls, {
      [`${prefixCls}-sm`]: mergedSize === 'small',
      [`${prefixCls}-lg`]: mergedSize === 'large',
      [`${prefixCls}-rtl`]: direction === 'rtl'
    }, cssVarCls, hashId, contextClassName, mergedClassNames.root),
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    role: "group"
  }, /*#__PURE__*/React.createElement(_context2.FormItemInputContext.Provider, {
    value: proxyFormContext
  }, Array.from({
    length
  }).map((_, index) => {
    const key = `otp-${index}`;
    const singleValue = valueCells[index] || '';
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: key
    }, /*#__PURE__*/React.createElement(_OTPInput.default, {
      ref: inputEle => {
        refs.current[index] = inputEle;
      },
      index: index,
      size: mergedSize,
      htmlSize: 1,
      className: (0, _clsx.clsx)(mergedClassNames.input, `${prefixCls}-input`),
      style: mergedStyles.input,
      onChange: onInputChange,
      value: singleValue,
      onActiveChange: onInputActiveChange,
      autoFocus: index === 0 && autoFocus,
      onFocus: event => onInputFocus(event, index),
      ...inputSharedProps
    }), index < length - 1 && (/*#__PURE__*/React.createElement(Separator, {
      separator: separator,
      index: index,
      prefixCls: prefixCls,
      className: (0, _clsx.clsx)(mergedClassNames.separator),
      style: mergedStyles.separator
    })));
  })));
});
var _default = exports.default = OTP;