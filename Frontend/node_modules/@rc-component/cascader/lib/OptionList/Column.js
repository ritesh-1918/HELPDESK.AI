"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FIX_LABEL = void 0;
exports.default = Column;
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var _context = _interopRequireDefault(require("../context"));
var _useSearchOptions = require("../hooks/useSearchOptions");
var _commonUtil = require("../utils/commonUtil");
var _Checkbox = _interopRequireDefault(require("./Checkbox"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const FIX_LABEL = exports.FIX_LABEL = '__cascader_fix_label__';
function Column({
  prefixCls,
  multiple,
  options,
  activeValue,
  prevValuePath,
  onToggleOpen,
  onSelect,
  onActive,
  checkedSet,
  halfCheckedSet,
  loadingKeys,
  isSelectable,
  disabled: propsDisabled
}) {
  const menuPrefixCls = `${prefixCls}-menu`;
  const menuItemPrefixCls = `${prefixCls}-menu-item`;
  const menuRef = React.useRef(null);
  const {
    fieldNames,
    changeOnSelect,
    expandTrigger,
    expandIcon,
    loadingIcon,
    popupMenuColumnStyle,
    optionRender,
    classNames,
    styles
  } = React.useContext(_context.default);
  const hoverOpen = expandTrigger === 'hover';
  const isOptionDisabled = disabled => propsDisabled || disabled;

  // ============================ Option ============================
  const optionInfoList = React.useMemo(() => options.map(option => {
    const {
      disabled,
      disableCheckbox
    } = option;
    const searchOptions = option[_useSearchOptions.SEARCH_MARK];
    const label = option[FIX_LABEL] ?? option[fieldNames.label];
    const value = option[fieldNames.value];
    const isMergedLeaf = (0, _commonUtil.isLeaf)(option, fieldNames);

    // Get real value of option. Search option is different way.
    const fullPath = searchOptions ? searchOptions.map(opt => opt[fieldNames.value]) : [...prevValuePath, value];
    const fullPathKey = (0, _commonUtil.toPathKey)(fullPath);
    const isLoading = loadingKeys.includes(fullPathKey);

    // >>>>> checked
    const checked = checkedSet.has(fullPathKey);

    // >>>>> halfChecked
    const halfChecked = halfCheckedSet.has(fullPathKey);
    return {
      disabled,
      label,
      value,
      isLeaf: isMergedLeaf,
      isLoading,
      checked,
      halfChecked,
      option,
      disableCheckbox,
      fullPath,
      fullPathKey
    };
  }), [options, checkedSet, fieldNames, halfCheckedSet, loadingKeys, prevValuePath]);
  React.useEffect(() => {
    if (menuRef.current) {
      const selector = `.${menuItemPrefixCls}-active`;
      const activeElement = menuRef.current.querySelector(selector);
      if (activeElement) {
        (0, _commonUtil.scrollIntoParentView)(activeElement);
      }
    }
  }, [activeValue, menuItemPrefixCls]);

  // ============================ Render ============================
  return /*#__PURE__*/React.createElement("ul", {
    className: (0, _clsx.clsx)(menuPrefixCls, classNames?.popup?.list),
    style: styles?.popup?.list,
    ref: menuRef,
    role: "menu"
  }, optionInfoList.map(({
    disabled,
    label,
    value,
    isLeaf: isMergedLeaf,
    isLoading,
    checked,
    halfChecked,
    option,
    fullPath,
    fullPathKey,
    disableCheckbox
  }) => {
    const ariaProps = (0, _pickAttrs.default)(option, {
      aria: true,
      data: true
    });
    // >>>>> Open
    const triggerOpenPath = () => {
      if (isOptionDisabled(disabled)) {
        return;
      }
      const nextValueCells = [...fullPath];
      if (hoverOpen && isMergedLeaf) {
        nextValueCells.pop();
      }
      onActive(nextValueCells);
    };

    // >>>>> Selection
    const triggerSelect = () => {
      if (isSelectable(option) && !isOptionDisabled(disabled)) {
        onSelect(fullPath, isMergedLeaf);
      }
    };

    // >>>>> Title
    let title;
    if (typeof option.title === 'string') {
      title = option.title;
    } else if (typeof label === 'string') {
      title = label;
    }

    // >>>>> Render
    return /*#__PURE__*/React.createElement("li", _extends({
      key: fullPathKey
    }, ariaProps, {
      className: (0, _clsx.clsx)(menuItemPrefixCls, classNames?.popup?.listItem, {
        [`${menuItemPrefixCls}-expand`]: !isMergedLeaf,
        [`${menuItemPrefixCls}-active`]: activeValue === value || activeValue === fullPathKey,
        [`${menuItemPrefixCls}-disabled`]: isOptionDisabled(disabled),
        [`${menuItemPrefixCls}-loading`]: isLoading
      }),
      style: {
        ...popupMenuColumnStyle,
        ...styles?.popup?.listItem
      },
      role: "menuitemcheckbox",
      title: title,
      "aria-checked": checked,
      "data-path-key": fullPathKey,
      onClick: () => {
        triggerOpenPath();
        if (disableCheckbox) {
          return;
        }
        if (!multiple || isMergedLeaf) {
          triggerSelect();
        }
      },
      onDoubleClick: () => {
        if (changeOnSelect) {
          onToggleOpen(false);
        }
      },
      onMouseEnter: () => {
        if (hoverOpen) {
          triggerOpenPath();
        }
      },
      onMouseDown: e => {
        // Prevent selector from blurring
        e.preventDefault();
      }
    }), multiple && /*#__PURE__*/React.createElement(_Checkbox.default, {
      prefixCls: `${prefixCls}-checkbox`,
      checked: checked,
      halfChecked: halfChecked,
      disabled: isOptionDisabled(disabled) || disableCheckbox,
      disableCheckbox: disableCheckbox,
      onClick: e => {
        if (disableCheckbox) {
          return;
        }
        e.stopPropagation();
        triggerSelect();
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: `${menuItemPrefixCls}-content`
    }, optionRender && value !== '__EMPTY__' ? optionRender(option) : label), !isLoading && expandIcon && !isMergedLeaf && /*#__PURE__*/React.createElement("div", {
      className: `${menuItemPrefixCls}-expand-icon`
    }, expandIcon), isLoading && loadingIcon && /*#__PURE__*/React.createElement("div", {
      className: `${menuItemPrefixCls}-loading-icon`
    }, loadingIcon));
  }));
}