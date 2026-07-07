function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import ResizeObserver from '@rc-component/resize-observer';
import useControlledState from "@rc-component/util/es/hooks/useControlledState";
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import raf from "@rc-component/util/es/raf";
import { clsx } from 'clsx';
import * as React from 'react';
import calculateAutoSizeStyle from "./calculateNodeHeight";
const RESIZE_START = 0;
const RESIZE_MEASURING = 1;
const RESIZE_STABLE = 2;
const ResizableTextArea = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    defaultValue,
    value,
    autoSize,
    onResize,
    className,
    style,
    disabled,
    onChange,
    // Test only
    onInternalAutoSize,
    ...restProps
  } = props;

  // =============================== Value ================================
  const [internalValue, setMergedValue] = useControlledState(defaultValue, value);
  const mergedValue = internalValue ?? '';
  const onInternalChange = event => {
    setMergedValue(event.target.value);
    onChange?.(event);
  };

  // ================================ Ref =================================
  const textareaRef = React.useRef();
  React.useImperativeHandle(ref, () => ({
    textArea: textareaRef.current
  }));

  // ============================== AutoSize ==============================
  const [minRows, maxRows] = React.useMemo(() => {
    if (autoSize && typeof autoSize === 'object') {
      return [autoSize.minRows, autoSize.maxRows];
    }
    return [];
  }, [autoSize]);
  const needAutoSize = !!autoSize;

  // =============================== Resize ===============================
  const [resizeState, setResizeState] = React.useState(RESIZE_STABLE);
  const [autoSizeStyle, setAutoSizeStyle] = React.useState();
  const startResize = () => {
    setResizeState(RESIZE_START);
    if (process.env.NODE_ENV === 'test') {
      onInternalAutoSize?.();
    }
  };

  // Change to trigger resize measure
  useLayoutEffect(() => {
    if (needAutoSize) {
      startResize();
    }
  }, [value, minRows, maxRows, needAutoSize]);
  useLayoutEffect(() => {
    if (resizeState === RESIZE_START) {
      setResizeState(RESIZE_MEASURING);
    } else if (resizeState === RESIZE_MEASURING) {
      const textareaStyles = calculateAutoSizeStyle(textareaRef.current, false, minRows, maxRows);

      // Safari has bug that text will keep break line on text cut when it's prev is break line.
      // ZombieJ: This not often happen. So we just skip it.
      // const { selectionStart, selectionEnd, scrollTop } = textareaRef.current;
      // const { value: tmpValue } = textareaRef.current;
      // textareaRef.current.value = '';
      // textareaRef.current.value = tmpValue;

      // if (document.activeElement === textareaRef.current) {
      //   textareaRef.current.scrollTop = scrollTop;
      //   textareaRef.current.setSelectionRange(selectionStart, selectionEnd);
      // }

      setResizeState(RESIZE_STABLE);
      setAutoSizeStyle(textareaStyles);
    } else {
      // https://github.com/react-component/textarea/pull/23
      // Firefox has blink issue before but fixed in latest version.
    }
  }, [resizeState]);

  // We lock resize trigger by raf to avoid Safari warning
  const resizeRafRef = React.useRef();
  const cleanRaf = () => {
    raf.cancel(resizeRafRef.current);
  };
  const onInternalResize = size => {
    if (resizeState === RESIZE_STABLE) {
      onResize?.(size);
      if (autoSize) {
        cleanRaf();
        resizeRafRef.current = raf(() => {
          startResize();
        });
      }
    }
  };
  React.useEffect(() => cleanRaf, []);

  // =============================== Render ===============================
  const mergedAutoSizeStyle = needAutoSize ? autoSizeStyle : null;
  const mergedStyle = {
    ...style,
    ...mergedAutoSizeStyle
  };
  if (resizeState === RESIZE_START || resizeState === RESIZE_MEASURING) {
    mergedStyle.overflowY = 'hidden';
    mergedStyle.overflowX = 'hidden';
  }
  return /*#__PURE__*/React.createElement(ResizeObserver, {
    onResize: onInternalResize,
    disabled: !(autoSize || onResize)
  }, /*#__PURE__*/React.createElement("textarea", _extends({}, restProps, {
    ref: textareaRef,
    style: mergedStyle,
    className: clsx(prefixCls, className, {
      [`${prefixCls}-disabled`]: disabled
    }),
    disabled: disabled,
    value: mergedValue,
    onChange: onInternalChange
  })));
});
export default ResizableTextArea;