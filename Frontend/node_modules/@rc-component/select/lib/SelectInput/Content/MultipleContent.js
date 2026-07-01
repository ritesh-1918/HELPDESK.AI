"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _overflow = _interopRequireDefault(require("@rc-component/overflow"));
var _Input = _interopRequireDefault(require("../Input"));
var _context = require("../context");
var _TransBtn = _interopRequireDefault(require("../../TransBtn"));
var _commonUtil = require("../../utils/commonUtil");
var _useBaseProps = _interopRequireDefault(require("../../hooks/useBaseProps"));
var _Placeholder = _interopRequireDefault(require("./Placeholder"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function itemKey(value) {
  return value.key ?? value.value;
}
const onPreventMouseDown = event => {
  event.preventDefault();
  event.stopPropagation();
};
var _default = exports.default = /*#__PURE__*/React.forwardRef(function MultipleContent({
  inputProps
}, ref) {
  const {
    prefixCls,
    displayValues,
    searchValue,
    mode,
    onSelectorRemove,
    removeIcon: removeIconFromContext
  } = (0, _context.useSelectInputContext)();
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
  } = (0, _useBaseProps.default)();
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
    title: (0, _commonUtil.getTitle)(item),
    className: (0, _clsx.clsx)(selectionItemPrefixCls, {
      [`${selectionItemPrefixCls}-disabled`]: itemDisabled
    }, classNames?.item),
    style: styles?.item
  }, /*#__PURE__*/React.createElement("span", {
    className: (0, _clsx.clsx)(`${selectionItemPrefixCls}-content`, classNames?.itemContent),
    style: styles?.itemContent
  }, content), closable && /*#__PURE__*/React.createElement(_TransBtn.default, {
    className: (0, _clsx.clsx)(`${selectionItemPrefixCls}-remove`, classNames?.itemRemove),
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
  return /*#__PURE__*/React.createElement(_overflow.default, {
    prefixCls: `${prefixCls}-content`,
    className: classNames?.content,
    style: styles?.content,
    prefix: !displayValues.length && !inputValue && /*#__PURE__*/React.createElement(_Placeholder.default, null),
    data: displayValues,
    renderItem: renderItem,
    renderRest: renderRest,
    suffix: /*#__PURE__*/React.createElement(_Input.default, _extends({
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