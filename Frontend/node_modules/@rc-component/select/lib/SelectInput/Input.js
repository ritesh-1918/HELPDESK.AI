"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _context = require("./context");
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _useBaseProps = _interopRequireDefault(require("../hooks/useBaseProps"));
var _ref = require("@rc-component/util/lib/ref");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const Input = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    onChange,
    onKeyDown,
    onBlur,
    style,
    syncWidth,
    value,
    className,
    autoComplete,
    ...restProps
  } = props;
  const {
    prefixCls,
    mode,
    onSearch,
    onSearchSubmit,
    onInputBlur,
    autoFocus,
    tokenWithEnter,
    placeholder,
    components: {
      input: InputComponent = 'input'
    }
  } = (0, _context.useSelectInputContext)();
  const {
    id,
    classNames,
    styles,
    open,
    activeDescendantId,
    role,
    disabled
  } = (0, _useBaseProps.default)() || {};
  const inputCls = (0, _clsx.clsx)(`${prefixCls}-input`, classNames?.input, className);

  // Used to handle input method composition status
  const compositionStatusRef = React.useRef(false);

  // Used to handle paste content, similar to original Selector implementation
  const pastedTextRef = React.useRef(null);

  // ============================== Refs ==============================
  const inputRef = React.useRef(null);
  React.useImperativeHandle(ref, () => inputRef.current);

  // ============================== Data ==============================
  // Handle input changes
  const handleChange = event => {
    let {
      value: nextVal
    } = event.target;

    // Handle pasted text with tokenWithEnter, similar to original Selector implementation
    if (tokenWithEnter && pastedTextRef.current && /[\r\n]/.test(pastedTextRef.current)) {
      // CRLF will be treated as a single space for input element
      const replacedText = pastedTextRef.current.replace(/[\r\n]+$/, '').replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ');
      nextVal = nextVal.replace(replacedText, pastedTextRef.current);
    }

    // Reset pasted text reference
    pastedTextRef.current = null;

    // Call onSearch callback
    if (onSearch) {
      onSearch(nextVal, true, compositionStatusRef.current);
    }

    // Call original onChange callback
    onChange?.(event);
  };

  // ============================ Keyboard ============================
  // Handle keyboard events
  const handleKeyDown = event => {
    const {
      key
    } = event;
    const {
      value: nextVal
    } = event.currentTarget;

    // Handle Enter key submission - referencing Selector implementation
    if (key === 'Enter' && mode === 'tags' && !compositionStatusRef.current && onSearchSubmit) {
      onSearchSubmit(nextVal);
    }

    // Call original onKeyDown callback
    onKeyDown?.(event);
  };

  // Handle blur events
  const handleBlur = event => {
    // Call onInputBlur callback
    onInputBlur?.();

    // Call original onBlur callback
    onBlur?.(event);
  };

  // Handle input method composition start
  const handleCompositionStart = () => {
    compositionStatusRef.current = true;
  };

  // Handle input method composition end
  const handleCompositionEnd = event => {
    compositionStatusRef.current = false;

    // Trigger search when input method composition ends, similar to original Selector
    if (mode !== 'combobox') {
      const {
        value: nextVal
      } = event.currentTarget;
      onSearch?.(nextVal, true, false);
    }
  };

  // Handle paste events to track pasted content
  const handlePaste = event => {
    const {
      clipboardData
    } = event;
    const pastedValue = clipboardData?.getData('text');
    pastedTextRef.current = pastedValue || '';
  };

  // ============================= Width ==============================
  const [widthCssVar, setWidthCssVar] = React.useState(undefined);

  // When syncWidth is enabled, adjust input width based on content
  (0, _useLayoutEffect.default)(() => {
    const input = inputRef.current;
    if (syncWidth && input) {
      input.style.width = '0px';
      const scrollWidth = input.scrollWidth;
      setWidthCssVar(scrollWidth);

      // Reset input style
      input.style.width = '';
    }
  }, [syncWidth, value]);

  // ============================= Render =============================
  // Extract shared input props
  const sharedInputProps = {
    id,
    type: mode === 'combobox' ? 'text' : 'search',
    ...restProps,
    ref: inputRef,
    style: {
      ...styles?.input,
      ...style,
      '--select-input-width': widthCssVar
    },
    autoFocus,
    autoComplete: autoComplete || 'off',
    className: inputCls,
    disabled,
    value: value || '',
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
    onPaste: handlePaste,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    // Accessibility attributes
    role: role || 'combobox',
    'aria-expanded': open || false,
    'aria-haspopup': 'listbox',
    'aria-owns': open ? `${id}_list` : undefined,
    'aria-autocomplete': 'list',
    'aria-controls': open ? `${id}_list` : undefined,
    'aria-activedescendant': open ? activeDescendantId : undefined
  };

  // Handle different InputComponent types
  if ( /*#__PURE__*/React.isValidElement(InputComponent)) {
    // If InputComponent is a ReactElement, use cloneElement with merged props
    const existingProps = InputComponent.props || {};

    // Start with shared props as base
    const mergedProps = {
      placeholder: props.placeholder || placeholder,
      ...sharedInputProps,
      ...existingProps
    };

    // Batch update function calls
    Object.keys(existingProps).forEach(key => {
      const existingValue = existingProps[key];
      if (typeof existingValue === 'function') {
        // Merge event handlers
        mergedProps[key] = (...args) => {
          existingValue(...args);
          sharedInputProps[key]?.(...args);
        };
      }
    });

    // Update ref
    mergedProps.ref = (0, _ref.composeRef)(InputComponent.ref, sharedInputProps.ref);
    return /*#__PURE__*/React.cloneElement(InputComponent, mergedProps);
  }

  // If InputComponent is a component type, render normally
  const Component = InputComponent;
  return /*#__PURE__*/React.createElement(Component, sharedInputProps);
});
var _default = exports.default = Input;