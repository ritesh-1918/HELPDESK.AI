function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { BaseInput } from '@rc-component/input';
import useCount from "@rc-component/input/es/hooks/useCount";
import { resolveOnChange } from "@rc-component/input/es/utils/commonUtils";
import useControlledState from "@rc-component/util/es/hooks/useControlledState";
import { clsx } from 'clsx';
import React, { useEffect, useImperativeHandle, useRef } from 'react';
import ResizableTextArea from "./ResizableTextArea";
const TextArea = /*#__PURE__*/React.forwardRef(({
  defaultValue,
  value: customValue,
  onFocus,
  onBlur,
  onChange,
  allowClear,
  maxLength,
  onCompositionStart,
  onCompositionEnd,
  suffix,
  prefixCls = 'rc-textarea',
  showCount,
  count,
  className,
  style,
  disabled,
  hidden,
  classNames,
  styles,
  onResize,
  onClear,
  onPressEnter,
  readOnly,
  autoSize,
  onKeyDown,
  ...rest
}, ref) => {
  const [value, setValue] = useControlledState(defaultValue, customValue);
  const formatValue = value === undefined || value === null ? '' : String(value);
  const [focused, setFocused] = React.useState(false);
  const compositionRef = React.useRef(false);
  const [textareaResized, setTextareaResized] = React.useState(null);

  // =============================== Ref ================================
  const holderRef = useRef(null);
  const resizableTextAreaRef = useRef(null);
  const getTextArea = () => resizableTextAreaRef.current?.textArea;
  const focus = () => {
    getTextArea().focus();
  };
  useImperativeHandle(ref, () => ({
    resizableTextArea: resizableTextAreaRef.current,
    focus,
    blur: () => {
      getTextArea().blur();
    },
    nativeElement: holderRef.current?.nativeElement || getTextArea()
  }));
  useEffect(() => {
    setFocused(prev => !disabled && prev);
  }, [disabled]);

  // =========================== Select Range ===========================
  const [selection, setSelection] = React.useState(null);
  React.useEffect(() => {
    if (selection) {
      getTextArea().setSelectionRange(...selection);
    }
  }, [selection]);

  // ============================== Count ===============================
  const countConfig = useCount(count, showCount);
  const mergedMax = countConfig.max ?? maxLength;

  // Max length value
  const hasMaxLength = Number(mergedMax) > 0;
  const valueLength = countConfig.strategy(formatValue);
  const isOutOfRange = !!mergedMax && valueLength > mergedMax;

  // ============================== Change ==============================
  const triggerChange = (e, currentValue) => {
    let cutValue = currentValue;
    if (!compositionRef.current && countConfig.exceedFormatter && countConfig.max && countConfig.strategy(currentValue) > countConfig.max) {
      cutValue = countConfig.exceedFormatter(currentValue, {
        max: countConfig.max
      });
      if (currentValue !== cutValue) {
        setSelection([getTextArea().selectionStart || 0, getTextArea().selectionEnd || 0]);
      }
    }
    setValue(cutValue);
    resolveOnChange(e.currentTarget, e, onChange, cutValue);
  };

  // =========================== Value Update ===========================
  const onInternalCompositionStart = e => {
    compositionRef.current = true;
    onCompositionStart?.(e);
  };
  const onInternalCompositionEnd = e => {
    compositionRef.current = false;
    triggerChange(e, e.currentTarget.value);
    onCompositionEnd?.(e);
  };
  const onInternalChange = e => {
    triggerChange(e, e.target.value);
  };
  const handleKeyDown = e => {
    if (e.key === 'Enter' && onPressEnter && !e.nativeEvent.isComposing) {
      onPressEnter(e);
    }
    onKeyDown?.(e);
  };
  const handleFocus = e => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = e => {
    setFocused(false);
    onBlur?.(e);
  };

  // ============================== Reset ===============================
  const handleReset = e => {
    setValue('');
    focus();
    resolveOnChange(getTextArea(), e, onChange);
  };
  let suffixNode = suffix;
  let dataCount;
  if (countConfig.show) {
    if (countConfig.showFormatter) {
      dataCount = countConfig.showFormatter({
        value: formatValue,
        count: valueLength,
        maxLength: mergedMax
      });
    } else {
      dataCount = `${valueLength}${hasMaxLength ? ` / ${mergedMax}` : ''}`;
    }
    suffixNode = /*#__PURE__*/React.createElement(React.Fragment, null, suffixNode, /*#__PURE__*/React.createElement("span", {
      className: clsx(`${prefixCls}-data-count`, classNames?.count),
      style: styles?.count
    }, dataCount));
  }
  const handleResize = size => {
    onResize?.(size);
    if (getTextArea()?.style.height) {
      setTextareaResized(true);
    }
  };
  const isPureTextArea = !autoSize && !showCount && !allowClear;
  return /*#__PURE__*/React.createElement(BaseInput, {
    ref: holderRef,
    value: formatValue,
    allowClear: allowClear,
    handleReset: handleReset,
    suffix: suffixNode,
    prefixCls: prefixCls,
    classNames: {
      ...classNames,
      affixWrapper: clsx(classNames?.affixWrapper, {
        [`${prefixCls}-show-count`]: showCount,
        [`${prefixCls}-textarea-allow-clear`]: allowClear
      })
    },
    disabled: disabled,
    focused: focused,
    className: clsx(className, isOutOfRange && `${prefixCls}-out-of-range`),
    style: {
      ...style,
      ...(textareaResized && !isPureTextArea ? {
        height: 'auto'
      } : {})
    },
    dataAttrs: {
      affixWrapper: {
        'data-count': typeof dataCount === 'string' ? dataCount : undefined
      }
    },
    hidden: hidden,
    readOnly: readOnly,
    onClear: onClear
  }, /*#__PURE__*/React.createElement(ResizableTextArea, _extends({}, rest, {
    autoSize: autoSize,
    maxLength: maxLength,
    onKeyDown: handleKeyDown,
    onChange: onInternalChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onCompositionStart: onInternalCompositionStart,
    onCompositionEnd: onInternalCompositionEnd,
    className: clsx(classNames?.textarea),
    style: {
      resize: style?.resize,
      ...styles?.textarea
    },
    disabled: disabled,
    prefixCls: prefixCls,
    onResize: handleResize,
    ref: resizableTextAreaRef,
    readOnly: readOnly
  })));
});
export default TextArea;