function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import { clsx } from 'clsx';
import Overflow from '@rc-component/overflow';
import Input from "../Input";
import { useSelectInputContext } from "../context";
import TransBtn from "../../TransBtn";
import { getTitle } from "../../utils/commonUtil";
import useBaseProps from "../../hooks/useBaseProps";
import Placeholder from "./Placeholder";
function itemKey(value) {
  return value.key ?? value.value;
}
const onPreventMouseDown = event => {
  event.preventDefault();
  event.stopPropagation();
};
export default /*#__PURE__*/React.forwardRef(function MultipleContent({
  inputProps
}, ref) {
  const {
    prefixCls,
    displayValues,
    searchValue,
    mode,
    onSelectorRemove,
    removeIcon: removeIconFromContext
  } = useSelectInputContext();
  const {
    disabled,
    showSearch,
    triggerOpen,
    rawOpen,
    toggleOpen,
    autoClearSearchValue,
    tagRender: tagRenderFromContext,
    maxTagPlaceholder: maxTagPlaceholderFromContext,
    maxTagTextLength,
    maxTagCount,
    classNames,
    styles
  } = useBaseProps();
  const selectionItemPrefixCls = `${prefixCls}-selection-item`;

  // ===================== Search ======================
  // Apply autoClearSearchValue logic: when dropdown is closed and autoClearSearchValue is not false (default true), clear search value
  // Use rawOpen to avoid clearing search when emptyListContent blocks open
  let computedSearchValue = searchValue;
  if (!rawOpen && mode === 'multiple' && autoClearSearchValue !== false) {
    computedSearchValue = '';
  }
  const inputValue = showSearch ? computedSearchValue || '' : '';
  const inputEditable = showSearch && !disabled;

  // Props from context with safe defaults
  const removeIcon = removeIconFromContext ?? '×';
  const maxTagPlaceholder = maxTagPlaceholderFromContext ?? (omittedValues => `+ ${omittedValues.length} ...`);
  const tagRender = tagRenderFromContext;
  const onToggleOpen = newOpen => {
    toggleOpen(newOpen);
  };
  const onRemove = value => {
    onSelectorRemove?.(value);
  };

  // ======================== Item ========================
  // >>> Render Selector Node. Includes Item & Rest
  const defaultRenderSelector = (item, content, itemDisabled, closable, onClose) => /*#__PURE__*/React.createElement("span", {
    title: getTitle(item),
    className: clsx(selectionItemPrefixCls, {
      [`${selectionItemPrefixCls}-disabled`]: itemDisabled
    }, classNames?.item),
    style: styles?.item
  }, /*#__PURE__*/React.createElement("span", {
    className: clsx(`${selectionItemPrefixCls}-content`, classNames?.itemContent),
    style: styles?.itemContent
  }, content), closable && /*#__PURE__*/React.createElement(TransBtn, {
    className: clsx(`${selectionItemPrefixCls}-remove`, classNames?.itemRemove),
    style: styles?.itemRemove,
    onMouseDown: onPreventMouseDown,
    onClick: onClose,
    customizeIcon: removeIcon
  }, "\xD7"));
  const customizeRenderSelector = (value, content, itemDisabled, closable, onClose, isMaxTag, info) => {
    const onMouseDown = e => {
      onPreventMouseDown(e);
      onToggleOpen(!triggerOpen);
    };
    return /*#__PURE__*/React.createElement("span", {
      onMouseDown: onMouseDown
    }, tagRender({
      label: content,
      value,
      index: info?.index,
      disabled: itemDisabled,
      closable,
      onClose,
      isMaxTag: !!isMaxTag
    }));
  };

  // ====================== Overflow ======================
  const renderItem = (valueItem, info) => {
    const {
      disabled: itemDisabled,
      label,
      value
    } = valueItem;
    const closable = !disabled && !itemDisabled;
    let displayLabel = label;
    if (typeof maxTagTextLength === 'number') {
      if (typeof label === 'string' || typeof label === 'number') {
        const strLabel = String(displayLabel);
        if (strLabel.length > maxTagTextLength) {
          displayLabel = `${strLabel.slice(0, maxTagTextLength)}...`;
        }
      }
    }
    const onClose = event => {
      if (event) {
        event.stopPropagation();
      }
      onRemove(valueItem);
    };
    return typeof tagRender === 'function' ? customizeRenderSelector(value, displayLabel, itemDisabled, closable, onClose, undefined, info) : defaultRenderSelector(valueItem, displayLabel, itemDisabled, closable, onClose);
  };
  const renderRest = omittedValues => {
    // https://github.com/ant-design/ant-design/issues/48930
    if (!displayValues.length) {
      return null;
    }
    const content = typeof maxTagPlaceholder === 'function' ? maxTagPlaceholder(omittedValues) : maxTagPlaceholder;
    return typeof tagRender === 'function' ? customizeRenderSelector(undefined, content, false, false, undefined, true) : defaultRenderSelector({
      title: content
    }, content, false);
  };

  // ======================= Render =======================
  return /*#__PURE__*/React.createElement(Overflow, {
    prefixCls: `${prefixCls}-content`,
    className: classNames?.content,
    style: styles?.content,
    prefix: !displayValues.length && !inputValue && /*#__PURE__*/React.createElement(Placeholder, null),
    data: displayValues,
    renderItem: renderItem,
    renderRest: renderRest,
    suffix: /*#__PURE__*/React.createElement(Input, _extends({
      ref: ref,
      disabled: disabled,
      readOnly: !inputEditable
    }, inputProps, {
      value: inputValue || '',
      syncWidth: true
    })),
    itemKey: itemKey,
    maxCount: maxTagCount
  });
});