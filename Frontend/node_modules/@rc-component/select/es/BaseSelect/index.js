function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import { getDOM } from "@rc-component/util/es/Dom/findDOMNode";
import * as React from 'react';
import { useAllowClear } from "../hooks/useAllowClear";
import { BaseSelectContext } from "../hooks/useBaseProps";
import useLock from "../hooks/useLock";
import useSelectTriggerControl, { isInside } from "../hooks/useSelectTriggerControl";
import SelectTrigger from "../SelectTrigger";
import { getSeparatedContent, isValidCount } from "../utils/valueUtil";
import Polite from "./Polite";
import useOpen, { macroTask } from "../hooks/useOpen";
import { useEvent } from '@rc-component/util';
import SelectInput from "../SelectInput";
import useComponents from "../hooks/useComponents";

/**
 * ZombieJ:
 * We are currently refactoring the semantic structure of the component. Changelog:
 * - Remove `suffixIcon` and change to `suffix`.
 * - Add `components.root` for replacing response element.
 *   - Remove `getInputElement` and `getRawInputElement` since we can use `components.input` instead.
 */

export const isMultiple = mode => mode === 'tags' || mode === 'multiple';
const BaseSelect = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    id,
    prefixCls,
    className,
    styles,
    classNames,
    showSearch,
    tagRender,
    showScrollBar = 'optional',
    direction,
    omitDomProps,
    // Value
    displayValues,
    onDisplayValuesChange,
    emptyOptions,
    notFoundContent = 'Not Found',
    onClear,
    maxCount,
    placeholder,
    // Mode
    mode,
    // Status
    disabled,
    loading,
    // Customize Input
    getInputElement,
    getRawInputElement,
    // Open
    open,
    defaultOpen,
    onPopupVisibleChange,
    // Active
    activeValue,
    onActiveValueChange,
    activeDescendantId,
    // Search
    searchValue,
    autoClearSearchValue,
    onSearch,
    onSearchSplit,
    tokenSeparators,
    // Icons
    allowClear,
    prefix,
    suffix,
    suffixIcon,
    clearIcon,
    // Dropdown
    OptionList,
    animation,
    transitionName,
    popupStyle,
    popupClassName,
    popupMatchSelectWidth,
    popupRender,
    popupAlign,
    placement,
    builtinPlacements,
    getPopupContainer,
    // Focus
    showAction = [],
    onFocus,
    onBlur,
    // Rest Events
    onKeyUp,
    onKeyDown,
    onMouseDown,
    // Components
    components,
    // Rest Props
    ...restProps
  } = props;

  // ============================== MISC ==============================
  const multiple = isMultiple(mode);

  // ============================== Refs ==============================
  const containerRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const listRef = React.useRef(null);

  /** Used for component focused management */
  const [focused, setFocused] = React.useState(false);

  // =========================== Imperative ===========================
  React.useImperativeHandle(ref, () => ({
    focus: containerRef.current?.focus,
    blur: containerRef.current?.blur,
    scrollTo: arg => listRef.current?.scrollTo(arg),
    nativeElement: getDOM(containerRef.current)
  }));

  // =========================== Components ===========================
  const mergedComponents = useComponents(components, getInputElement, getRawInputElement);

  // ========================== Search Value ==========================
  const mergedSearchValue = React.useMemo(() => {
    if (mode !== 'combobox') {
      return searchValue;
    }
    const val = displayValues[0]?.value;
    return typeof val === 'string' || typeof val === 'number' ? String(val) : '';
  }, [searchValue, mode, displayValues]);

  // ========================== Custom Input ==========================
  // Only works in `combobox`
  const customizeInputElement = mode === 'combobox' && typeof getInputElement === 'function' && getInputElement() || null;

  // ============================== Open ==============================
  // Not trigger `open` when `notFoundContent` is empty
  const emptyListContent = !notFoundContent && emptyOptions;
  const [rawOpen, mergedOpen, triggerOpen, lockOptions] = useOpen(defaultOpen || false, open, onPopupVisibleChange, nextOpen => disabled || emptyListContent ? false : nextOpen);

  // ============================= Search =============================
  const tokenWithEnter = React.useMemo(() => (tokenSeparators || []).some(tokenSeparator => ['\n', '\r\n'].includes(tokenSeparator)), [tokenSeparators]);
  const onInternalSearch = (searchText, fromTyping, isCompositing) => {
    if (multiple && isValidCount(maxCount) && displayValues.length >= maxCount) {
      return;
    }
    let ret = true;
    let newSearchText = searchText;
    onActiveValueChange?.(null);
    const separatedList = getSeparatedContent(searchText, tokenSeparators, isValidCount(maxCount) ? maxCount - displayValues.length : undefined);

    // Check if match the `tokenSeparators`
    const patchLabels = isCompositing ? null : separatedList;

    // Ignore combobox since it's not split-able
    if (mode !== 'combobox' && patchLabels) {
      newSearchText = '';
      onSearchSplit?.(patchLabels);

      // Should close when paste finish
      triggerOpen(false);

      // Tell Selector that break next actions
      ret = false;
    }
    if (onSearch && mergedSearchValue !== newSearchText) {
      onSearch(newSearchText, {
        source: fromTyping ? 'typing' : 'effect'
      });
    }

    // Open if from typing
    if (searchText && fromTyping && ret) {
      triggerOpen(true);
    }
    return ret;
  };

  // Only triggered when menu is closed & mode is tags
  // If menu is open, OptionList will take charge
  // If mode isn't tags, press enter is not meaningful when you can't see any option
  const onInternalSearchSubmit = searchText => {
    // prevent empty tags from appearing when you click the Enter button
    if (!searchText || !searchText.trim()) {
      return;
    }
    onSearch(searchText, {
      source: 'submit'
    });
  };

  // Clean up search value when the dropdown is closed.
  // We use `rawOpen` here to avoid clearing the search input when the dropdown is
  // programmatically closed due to `notFoundContent={null}` and no matching options.
  // This allows the user to continue typing their search query.
  React.useEffect(() => {
    if (!rawOpen && !multiple && mode !== 'combobox') {
      onInternalSearch('', false, false);
    }
  }, [rawOpen]);

  // ============================ Disabled ============================
  // Close dropdown & remove focus state when disabled change
  React.useEffect(() => {
    // After onBlur is triggered, the focused does not need to be reset
    if (disabled) {
      triggerOpen(false);
      setFocused(false);
    }
  }, [disabled, mergedOpen]);

  // ============================ Keyboard ============================
  /**
   * We record input value here to check if can press to clean up by backspace
   * - null: Key is not down, this is reset by key up
   * - true: Search text is empty when first time backspace down
   * - false: Search text is not empty when first time backspace down
   */
  const [getClearLock, setClearLock] = useLock();
  const keyLockRef = React.useRef(false);

  // KeyDown
  const onInternalKeyDown = event => {
    const clearLock = getClearLock();
    const {
      key
    } = event;
    const isEnterKey = key === 'Enter';
    const isSpaceKey = key === ' ';

    // Enter or Space opens dropdown (ARIA combobox: spacebar should open)
    if (isEnterKey || isSpaceKey) {
      // Do not submit form when type in the input; prevent Space from scrolling page
      const isCombobox = mode === 'combobox';
      const isEditable = isCombobox || showSearch;
      if (isSpaceKey && !isEditable || isEnterKey && !isCombobox) {
        event.preventDefault();
      }

      // We only manage open state here, close logic should handle by list component
      if (!mergedOpen) {
        triggerOpen(true);
      }
    }
    setClearLock(!!mergedSearchValue);

    // Remove value by `backspace`
    if (key === 'Backspace' && !clearLock && multiple && !mergedSearchValue && displayValues.length) {
      const cloneDisplayValues = [...displayValues];
      let removedDisplayValue = null;
      for (let i = cloneDisplayValues.length - 1; i >= 0; i -= 1) {
        const current = cloneDisplayValues[i];
        if (!current.disabled) {
          cloneDisplayValues.splice(i, 1);
          removedDisplayValue = current;
          break;
        }
      }
      if (removedDisplayValue) {
        onDisplayValuesChange(cloneDisplayValues, {
          type: 'remove',
          values: [removedDisplayValue]
        });
      }
    }
    if (mergedOpen && (!isEnterKey || !keyLockRef.current) && !isSpaceKey) {
      // Lock the Enter key after it is pressed to avoid repeated triggering of the onChange event.
      if (isEnterKey) {
        keyLockRef.current = true;
      }
      listRef.current?.onKeyDown(event);
    }
    onKeyDown?.(event);
  };

  // KeyUp
  const onInternalKeyUp = (event, ...rest) => {
    if (mergedOpen) {
      listRef.current?.onKeyUp(event, ...rest);
    }
    if (event.key === 'Enter') {
      keyLockRef.current = false;
    }
    onKeyUp?.(event, ...rest);
  };

  // ============================ Selector ============================
  const onSelectorRemove = useEvent(val => {
    const newValues = displayValues.filter(i => i !== val);
    onDisplayValuesChange(newValues, {
      type: 'remove',
      values: [val]
    });
  });
  const onInputBlur = () => {
    // Unlock the Enter key after the input blur; otherwise, the Enter key needs to be pressed twice to trigger the correct effect.
    keyLockRef.current = false;
  };

  // ========================== Focus / Blur ==========================
  const getSelectElements = () => [getDOM(containerRef.current), triggerRef.current?.getPopupElement()];

  // Close when click on non-select element
  useSelectTriggerControl(getSelectElements, mergedOpen, triggerOpen, !!mergedComponents.root);

  // ========================== Focus / Blur ==========================
  const internalMouseDownRef = React.useRef(false);
  const onInternalFocus = event => {
    setFocused(true);
    if (!disabled) {
      // `showAction` should handle `focus` if set
      if (showAction.includes('focus')) {
        triggerOpen(true);
      }
      onFocus?.(event);
    }
  };
  const onRootBlur = () => {
    // Delay close should check the activeElement
    if (mergedOpen && !internalMouseDownRef.current) {
      triggerOpen(false, {
        cancelFun: () => isInside(getSelectElements(), document.activeElement)
      });
    }
  };
  const onInternalBlur = event => {
    setFocused(false);
    if (mergedSearchValue) {
      // `tags` mode should move `searchValue` into values
      if (mode === 'tags') {
        onSearch(mergedSearchValue, {
          source: 'submit'
        });
      } else if (mode === 'multiple') {
        // `multiple` mode only clean the search value but not trigger event
        onSearch('', {
          source: 'blur'
        });
      }
    }
    onRootBlur();
    if (!disabled) {
      onBlur?.(event);
    }
  };
  const onRootMouseDown = (event, ...restArgs) => {
    const {
      target
    } = event;
    const popupElement = triggerRef.current?.getPopupElement();

    // We should give focus back to selector if clicked item is not focusable
    if (popupElement?.contains(target) && triggerOpen) {
      // Tell `open` not to close since it's safe in the popup
      triggerOpen(true);
    }
    onMouseDown?.(event, ...restArgs);
    internalMouseDownRef.current = true;
    macroTask(() => {
      internalMouseDownRef.current = false;
    });
  };

  // ============================ Dropdown ============================
  const [, forceUpdate] = React.useState({});
  // We need force update here since popup dom is render async
  function onPopupMouseEnter() {
    forceUpdate({});
  }

  // Used for raw custom input trigger
  let onTriggerVisibleChange;
  if (!!mergedComponents.root) {
    onTriggerVisibleChange = newOpen => {
      triggerOpen(newOpen);
    };
  }

  // ============================ Context =============================
  const baseSelectContext = React.useMemo(() => ({
    ...props,
    notFoundContent,
    open: mergedOpen,
    triggerOpen: mergedOpen,
    rawOpen,
    id,
    showSearch,
    multiple,
    toggleOpen: triggerOpen,
    showScrollBar,
    styles,
    classNames,
    lockOptions
  }), [props, notFoundContent, triggerOpen, id, showSearch, multiple, mergedOpen, rawOpen, showScrollBar, styles, classNames, lockOptions]);

  // ==================================================================
  // ==                            Render                            ==
  // ==================================================================

  // ============================= Suffix =============================
  const mergedSuffixIcon = React.useMemo(() => {
    const nextSuffix = suffix ?? suffixIcon;
    if (typeof nextSuffix === 'function') {
      return nextSuffix({
        searchValue: mergedSearchValue,
        open: mergedOpen,
        focused,
        showSearch,
        loading
      });
    }
    return nextSuffix;
  }, [suffix, suffixIcon, mergedSearchValue, mergedOpen, focused, showSearch, loading]);

  // ============================= Clear ==============================
  const onClearMouseDown = () => {
    onClear?.();
    containerRef.current?.focus();
    onDisplayValuesChange([], {
      type: 'clear',
      values: displayValues
    });
    onInternalSearch('', false, false);
  };
  const {
    allowClear: mergedAllowClear,
    clearIcon: clearNode
  } = useAllowClear(prefixCls, displayValues, allowClear, clearIcon, disabled, mergedSearchValue, mode);

  // =========================== OptionList ===========================
  const optionList = /*#__PURE__*/React.createElement(OptionList, {
    ref: listRef
  });

  // ============================= Select =============================
  const mergedClassName = clsx(prefixCls, className, {
    [`${prefixCls}-focused`]: focused,
    [`${prefixCls}-multiple`]: multiple,
    [`${prefixCls}-single`]: !multiple,
    [`${prefixCls}-allow-clear`]: mergedAllowClear,
    [`${prefixCls}-show-arrow`]: mergedSuffixIcon !== undefined && mergedSuffixIcon !== null,
    [`${prefixCls}-disabled`]: disabled,
    [`${prefixCls}-loading`]: loading,
    [`${prefixCls}-open`]: mergedOpen,
    [`${prefixCls}-customize-input`]: customizeInputElement,
    [`${prefixCls}-show-search`]: showSearch
  });

  // >>> Render
  let renderNode = /*#__PURE__*/React.createElement(SelectInput, _extends({}, restProps, {
    // Ref
    ref: containerRef
    // Style
    ,
    prefixCls: prefixCls,
    className: mergedClassName
    // Focus state
    ,
    focused: focused
    // UI
    ,
    prefix: prefix,
    suffix: mergedSuffixIcon,
    clearIcon: clearNode
    // Type or mode
    ,
    multiple: multiple,
    mode: mode
    // Values
    ,
    displayValues: displayValues,
    placeholder: placeholder,
    searchValue: mergedSearchValue,
    activeValue: activeValue,
    onSearch: onInternalSearch,
    onSearchSubmit: onInternalSearchSubmit,
    onInputBlur: onInputBlur,
    onFocus: onInternalFocus,
    onBlur: onInternalBlur,
    onClearMouseDown: onClearMouseDown,
    onKeyDown: onInternalKeyDown,
    onKeyUp: onInternalKeyUp,
    onSelectorRemove: onSelectorRemove
    // Token handling
    ,
    tokenWithEnter: tokenWithEnter
    // Open
    ,
    onMouseDown: onRootMouseDown
    // Components
    ,
    components: mergedComponents
  }));
  renderNode = /*#__PURE__*/React.createElement(SelectTrigger, {
    ref: triggerRef,
    disabled: disabled,
    prefixCls: prefixCls,
    visible: mergedOpen,
    popupElement: optionList,
    animation: animation,
    transitionName: transitionName,
    popupStyle: popupStyle,
    popupClassName: popupClassName,
    direction: direction,
    popupMatchSelectWidth: popupMatchSelectWidth,
    popupRender: popupRender,
    popupAlign: popupAlign,
    placement: placement,
    builtinPlacements: builtinPlacements,
    getPopupContainer: getPopupContainer,
    empty: emptyOptions,
    onPopupVisibleChange: onTriggerVisibleChange,
    onPopupMouseEnter: onPopupMouseEnter,
    onPopupMouseDown: onRootMouseDown,
    onPopupBlur: onRootBlur
  }, renderNode);
  return /*#__PURE__*/React.createElement(BaseSelectContext.Provider, {
    value: baseSelectContext
  }, /*#__PURE__*/React.createElement(Polite, {
    visible: focused && !mergedOpen,
    values: displayValues
  }), renderNode);
});

// Set display name for dev
if (process.env.NODE_ENV !== 'production') {
  BaseSelect.displayName = 'BaseSelect';
}
export default BaseSelect;