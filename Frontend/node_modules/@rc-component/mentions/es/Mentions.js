function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import { BaseInput } from '@rc-component/input';
import TextArea from '@rc-component/textarea';
import toArray from "@rc-component/util/es/Children/toArray";
import useControlledState from "@rc-component/util/es/hooks/useControlledState";
import KeyCode from "@rc-component/util/es/KeyCode";
import useId from "@rc-component/util/es/hooks/useId";
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import useEffectState from "./hooks/useEffectState";
import KeywordTrigger from "./KeywordTrigger";
import MentionsContext from "./MentionsContext";
import Option from "./Option";
import { filterOption as defaultFilterOption, validateSearch as defaultValidateSearch, getBeforeSelectionText, getLastMeasureIndex, replaceWithMeasure, setInputSelection } from "./util";
import { UnstableContext } from "./context";
const InternalMentions = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    // Style
    prefixCls,
    className,
    style,
    classNames: mentionClassNames,
    styles,
    // Misc
    prefix = '@',
    split = ' ',
    notFoundContent = 'Not Found',
    value,
    defaultValue,
    children,
    options,
    allowClear,
    hasWrapper,
    silent,
    // Events
    validateSearch = defaultValidateSearch,
    filterOption = defaultFilterOption,
    onChange,
    onKeyDown,
    onKeyUp,
    onPressEnter,
    onSearch,
    onSelect,
    onFocus,
    onBlur,
    // Dropdown
    transitionName,
    placement,
    direction,
    getPopupContainer,
    popupClassName,
    rows = 1,
    // Fix Warning: Received `false` for a non-boolean attribute `visible`.
    // https://github.com/ant-design/ant-design/blob/df933e94efc8f376003bbdc658d64b64a0e53495/components/mentions/demo/render-panel.tsx
    // @ts-expect-error
    visible,
    onPopupScroll,
    // Rest
    ...restProps
  } = props;
  const mergedPrefix = useMemo(() => Array.isArray(prefix) ? prefix : [prefix], [prefix]);

  // =============================== Refs ===============================
  const containerRef = useRef(null);
  const textareaRef = useRef(null);
  const measureRef = useRef(null);
  const getTextArea = () => textareaRef.current?.resizableTextArea?.textArea;
  React.useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    blur: () => textareaRef.current?.blur(),
    textarea: textareaRef.current?.resizableTextArea?.textArea,
    nativeElement: containerRef.current
  }));

  // ============================== State ===============================
  const [measuring, setMeasuring] = useState(false);
  const [measureText, setMeasureText] = useState('');
  const [measurePrefix, setMeasurePrefix] = useState('');
  const [measureLocation, setMeasureLocation] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFocus, setIsFocus] = useState(false);

  // ================================ Id ================================
  const uniqueKey = useId(props.id);

  // ============================== Value ===============================
  const [mergedValue, setMergedValue] = useControlledState(defaultValue || '', value);

  // =============================== Open ===============================
  const {
    open
  } = useContext(UnstableContext);
  useEffect(() => {
    // Sync measure div top with textarea for rc-trigger usage
    if (measuring && measureRef.current) {
      measureRef.current.scrollTop = getTextArea().scrollTop;
    }
  }, [measuring]);
  const [mergedMeasuring, mergedMeasureText, mergedMeasurePrefix, mergedMeasureLocation] = React.useMemo(() => {
    if (open) {
      for (let i = 0; i < mergedPrefix.length; i += 1) {
        const curPrefix = mergedPrefix[i];
        const index = mergedValue.lastIndexOf(curPrefix);
        if (index >= 0) {
          return [true, '', curPrefix, index];
        }
      }
    }
    return [measuring, measureText, measurePrefix, measureLocation];
  }, [open, measuring, mergedPrefix, mergedValue, measureText, measurePrefix, measureLocation]);

  // ============================== Option ==============================
  const getOptions = React.useCallback(targetMeasureText => {
    let list;
    if (options && options.length > 0) {
      list = options.map(item => ({
        ...item,
        key: `${item?.key ?? item.value}-${uniqueKey}`
      }));
    } else {
      list = toArray(children).map(({
        props: optionProps,
        key
      }) => ({
        ...optionProps,
        label: optionProps.children,
        key: `${key || optionProps.value}-${uniqueKey}`
      }));
    }
    return list.filter(option => {
      /** Return all result if `filterOption` is false. */
      if (filterOption === false) {
        return true;
      }
      return filterOption(targetMeasureText, option);
    });
  }, [options, uniqueKey, children, filterOption]);
  const mergedOptions = React.useMemo(() => getOptions(mergedMeasureText), [getOptions, mergedMeasureText]);

  // ============================= Measure ==============================
  // Mark that we will reset input selection to target position when user select option
  const onSelectionEffect = useEffectState();
  const startMeasure = (nextMeasureText, nextMeasurePrefix, nextMeasureLocation) => {
    setMeasuring(true);
    setMeasureText(nextMeasureText);
    setMeasurePrefix(nextMeasurePrefix);
    setMeasureLocation(nextMeasureLocation);
    setActiveIndex(0);
  };
  const stopMeasure = callback => {
    setMeasuring(false);
    setMeasureLocation(0);
    setMeasureText('');
    onSelectionEffect(callback);
  };

  // ============================== Change ==============================
  const triggerChange = nextValue => {
    setMergedValue(nextValue);
    onChange?.(nextValue);
  };
  const onInternalChange = ({
    target: {
      value: nextValue
    }
  }) => {
    triggerChange(nextValue);
  };
  const selectOption = option => {
    const {
      value: mentionValue = ''
    } = option;
    const {
      text,
      selectionLocation
    } = replaceWithMeasure(mergedValue, {
      measureLocation: mergedMeasureLocation,
      targetText: mentionValue,
      prefix: mergedMeasurePrefix,
      selectionStart: getTextArea()?.selectionStart,
      split
    });
    triggerChange(text);
    stopMeasure(() => {
      // We need restore the selection position
      setInputSelection(getTextArea(), selectionLocation);
    });
    onSelect?.(option, mergedMeasurePrefix);
  };

  // ============================= KeyEvent =============================
  // Check if hit the measure keyword
  const onInternalKeyDown = event => {
    const {
      which
    } = event;
    onKeyDown?.(event);

    // Skip if not measuring
    if (!mergedMeasuring) {
      return;
    }
    if (which === KeyCode.UP || which === KeyCode.DOWN) {
      // Control arrow function
      const optionLen = mergedOptions.length;
      const offset = which === KeyCode.UP ? -1 : 1;
      const newActiveIndex = (activeIndex + offset + optionLen) % optionLen;
      setActiveIndex(newActiveIndex);
      event.preventDefault();
    } else if (which === KeyCode.ESC) {
      stopMeasure();
    } else if (which === KeyCode.ENTER) {
      // Measure hit
      event.preventDefault();
      // loading skip
      if (silent) {
        return;
      }
      if (!mergedOptions.length) {
        stopMeasure();
        return;
      }
      const option = mergedOptions[activeIndex];
      selectOption(option);
    }
  };

  /**
   * When to start measure:
   * 1. When user press `prefix`
   * 2. When measureText !== prevMeasureText
   *  - If measure hit
   *  - If measuring
   *
   * When to stop measure:
   * 1. Selection is out of range
   * 2. Contains `space`
   * 3. ESC or select one
   */
  const onInternalKeyUp = event => {
    const {
      key,
      which
    } = event;
    const target = event.target;
    const selectionStartText = getBeforeSelectionText(target);
    const {
      location: measureIndex,
      prefix: nextMeasurePrefix
    } = getLastMeasureIndex(selectionStartText, mergedPrefix);

    // If the client implements an onKeyUp handler, call it
    onKeyUp?.(event);

    // Skip if match the white key list
    if ([KeyCode.ESC, KeyCode.UP, KeyCode.DOWN, KeyCode.ENTER].indexOf(which) !== -1) {
      return;
    }
    if (measureIndex !== -1) {
      const nextMeasureText = selectionStartText.slice(measureIndex + nextMeasurePrefix.length);
      const validateMeasure = validateSearch(nextMeasureText, split);
      const matchOption = !!getOptions(nextMeasureText).length;
      if (validateMeasure) {
        // adding AltGraph also fort azert keyboard
        if (key === nextMeasurePrefix || key === 'Shift' || which === KeyCode.ALT || key === 'AltGraph' || mergedMeasuring || nextMeasureText !== mergedMeasureText && matchOption) {
          startMeasure(nextMeasureText, nextMeasurePrefix, measureIndex);
        }
      } else if (mergedMeasuring) {
        // Stop if measureText is invalidate
        stopMeasure();
      }

      /**
       * We will trigger `onSearch` to developer since they may use for async update.
       * If met `space` means user finished searching.
       */
      if (onSearch && validateMeasure) {
        onSearch(nextMeasureText, nextMeasurePrefix);
      }
    } else if (mergedMeasuring) {
      stopMeasure();
    }
  };
  const onInternalPressEnter = event => {
    if (!mergedMeasuring && onPressEnter) {
      onPressEnter(event);
    }
  };

  // ============================ Focus Blur ============================
  const focusRef = useRef();
  const onInternalFocus = event => {
    window.clearTimeout(focusRef.current);
    if (!isFocus && event && onFocus) {
      onFocus(event);
    }
    setIsFocus(true);
  };
  const onInternalBlur = event => {
    focusRef.current = window.setTimeout(() => {
      setIsFocus(false);
      stopMeasure();
      onBlur?.(event);
    }, 0);
  };
  const onDropdownFocus = () => {
    onInternalFocus();
  };
  const onDropdownBlur = () => {
    onInternalBlur();
  };

  // ============================== Scroll ===============================
  const onInternalPopupScroll = event => {
    onPopupScroll?.(event);
  };

  // ============================== Styles ==============================
  const mergedStyles = React.useMemo(() => {
    const resizeStyle = styles?.textarea?.resize ?? style?.resize;
    const mergedTextareaStyle = {
      ...styles?.textarea
    };

    // Only add resize if it has a valid value, avoid setting undefined
    if (resizeStyle !== undefined) {
      mergedTextareaStyle.resize = resizeStyle;
    }
    return {
      ...styles,
      textarea: mergedTextareaStyle
    };
  }, [style, styles]);

  // ============================== Render ==============================

  const mentionNode = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TextArea, _extends({
    classNames: {
      textarea: mentionClassNames?.textarea
    }
    /**
     * Example:<Mentions style={{ resize: 'none' }} />.
     * If written this way, resizing here will become invalid.
     * The TextArea component code and found that the resize parameter in the style of the ResizeTextArea component is obtained from prop.style.
     * Just pass the resize attribute and leave everything else unchanged.
     */,
    styles: mergedStyles,
    ref: textareaRef,
    value: mergedValue
  }, restProps, {
    rows: rows,
    onChange: onInternalChange,
    onKeyDown: onInternalKeyDown,
    onKeyUp: onInternalKeyUp,
    onPressEnter: onInternalPressEnter,
    onFocus: onInternalFocus,
    onBlur: onInternalBlur
  })), mergedMeasuring && /*#__PURE__*/React.createElement("div", {
    ref: measureRef,
    className: `${prefixCls}-measure`
  }, mergedValue.slice(0, mergedMeasureLocation), /*#__PURE__*/React.createElement(MentionsContext.Provider, {
    value: {
      notFoundContent,
      activeIndex,
      setActiveIndex,
      selectOption,
      onFocus: onDropdownFocus,
      onBlur: onDropdownBlur,
      onScroll: onInternalPopupScroll
    }
  }, /*#__PURE__*/React.createElement(KeywordTrigger, {
    prefixCls: prefixCls,
    transitionName: transitionName,
    placement: placement,
    direction: direction,
    options: mergedOptions,
    visible: true,
    getPopupContainer: getPopupContainer,
    popupClassName: clsx(popupClassName, mentionClassNames?.popup),
    popupStyle: styles?.popup
  }, /*#__PURE__*/React.createElement("span", null, mergedMeasurePrefix))), mergedValue.slice(mergedMeasureLocation + mergedMeasurePrefix.length)));
  if (!hasWrapper) {
    return /*#__PURE__*/React.createElement("div", {
      className: clsx(prefixCls, className),
      style: style,
      ref: containerRef
    }, mentionNode);
  }
  return mentionNode;
});
const Mentions = /*#__PURE__*/forwardRef(({
  suffix,
  prefixCls = 'rc-mentions',
  defaultValue,
  value: customValue,
  id,
  allowClear,
  onChange,
  classNames: mentionsClassNames,
  styles,
  className,
  disabled,
  onClear,
  ...rest
}, ref) => {
  const hasSuffix = !!(suffix || allowClear);

  // =============================== Ref ================================
  const holderRef = useRef(null);
  const mentionRef = useRef(null);
  useImperativeHandle(ref, () => ({
    ...mentionRef.current,
    nativeElement: holderRef.current?.nativeElement || mentionRef.current?.nativeElement
  }));

  // ============================== Value ===============================
  const [mergedValue, setMergedValue] = useControlledState(defaultValue || '', customValue);

  // ============================== Change ==============================
  const triggerChange = currentValue => {
    setMergedValue(currentValue);
    onChange?.(currentValue);
  };

  // ============================== Reset ===============================
  const handleReset = () => {
    triggerChange('');
  };
  return /*#__PURE__*/React.createElement(BaseInput, {
    suffix: suffix,
    prefixCls: prefixCls,
    value: mergedValue,
    allowClear: allowClear,
    handleReset: handleReset,
    className: clsx(prefixCls, className, {
      // hasSuffix
      [`${prefixCls}-has-suffix`]: hasSuffix
    }),
    classNames: mentionsClassNames,
    disabled: disabled,
    ref: holderRef,
    onClear: onClear
  }, /*#__PURE__*/React.createElement(InternalMentions, _extends({
    className: mentionsClassNames?.mentions,
    styles: styles,
    classNames: mentionsClassNames,
    prefixCls: prefixCls,
    id: id,
    ref: mentionRef,
    onChange: triggerChange,
    disabled: disabled,
    hasWrapper: hasSuffix
  }, rest)));
});
Mentions.Option = Option;
export default Mentions;