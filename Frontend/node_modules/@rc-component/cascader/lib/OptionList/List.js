"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
var _useMemo = _interopRequireDefault(require("@rc-component/util/lib/hooks/useMemo"));
var _context = _interopRequireDefault(require("../context"));
var _commonUtil = require("../utils/commonUtil");
var _treeUtil = require("../utils/treeUtil");
var _Column = _interopRequireWildcard(require("./Column"));
var _useActive = _interopRequireDefault(require("./useActive"));
var _useKeyboard = _interopRequireDefault(require("./useKeyboard"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } /* eslint-disable default-case */
const RawOptionList = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    multiple,
    searchValue,
    toggleOpen,
    notFoundContent,
    direction,
    open,
    disabled,
    lockOptions = false
  } = props;
  const containerRef = React.useRef(null);
  const rtl = direction === 'rtl';
  const {
    options,
    values,
    halfValues,
    fieldNames,
    changeOnSelect,
    onSelect,
    searchOptions,
    popupPrefixCls,
    loadData,
    expandTrigger
  } = React.useContext(_context.default);
  const mergedPrefixCls = popupPrefixCls || prefixCls;

  // ========================= loadData =========================
  const [loadingKeys, setLoadingKeys] = React.useState([]);
  const internalLoadData = valueCells => {
    // Do not load when search
    if (!loadData || searchValue) {
      return;
    }
    const optionList = (0, _treeUtil.toPathOptions)(valueCells, options, fieldNames);
    const rawOptions = optionList.map(({
      option
    }) => option);
    const lastOption = rawOptions[rawOptions.length - 1];
    if (lastOption && !(0, _commonUtil.isLeaf)(lastOption, fieldNames)) {
      const pathKey = (0, _commonUtil.toPathKey)(valueCells);
      setLoadingKeys(keys => [...keys, pathKey]);
      loadData(rawOptions);
    }
  };

  // zombieJ: This is bad. We should make this same as `rc-tree` to use Promise instead.
  React.useEffect(() => {
    if (loadingKeys.length) {
      loadingKeys.forEach(loadingKey => {
        const valueStrCells = (0, _commonUtil.toPathValueStr)(loadingKey);
        const optionList = (0, _treeUtil.toPathOptions)(valueStrCells, options, fieldNames, true).map(({
          option
        }) => option);
        const lastOption = optionList[optionList.length - 1];
        if (!lastOption || lastOption[fieldNames.children] || (0, _commonUtil.isLeaf)(lastOption, fieldNames)) {
          setLoadingKeys(keys => keys.filter(key => key !== loadingKey));
        }
      });
    }
  }, [options, loadingKeys, fieldNames]);

  // ========================== Values ==========================
  const checkedSet = React.useMemo(() => new Set((0, _commonUtil.toPathKeys)(values)), [values]);
  const halfCheckedSet = React.useMemo(() => new Set((0, _commonUtil.toPathKeys)(halfValues)), [halfValues]);

  // ====================== Accessibility =======================
  const [activeValueCells, setActiveValueCells] = (0, _useActive.default)(multiple, open);

  // =========================== Path ===========================
  const onPathOpen = nextValueCells => {
    setActiveValueCells(nextValueCells);

    // Trigger loadData
    internalLoadData(nextValueCells);
  };
  const isSelectable = option => {
    if (disabled) {
      return false;
    }
    const {
      disabled: optionDisabled
    } = option;
    const isMergedLeaf = (0, _commonUtil.isLeaf)(option, fieldNames);
    return !optionDisabled && (isMergedLeaf || changeOnSelect || multiple);
  };
  const onPathSelect = (valuePath, leaf, fromKeyboard = false) => {
    onSelect(valuePath);
    if (!multiple && (leaf || changeOnSelect && (expandTrigger === 'hover' || fromKeyboard))) {
      toggleOpen(false);
    }
  };

  // ========================== Option ==========================
  const filteredOptions = React.useMemo(() => {
    if (searchValue) {
      return searchOptions;
    }
    return options;
  }, [searchValue, searchOptions, options]);

  // Update only when open or lockOptions
  const mergedOptions = (0, _useMemo.default)(() => filteredOptions, [open, lockOptions], (prev, next) => !!next[0] && !next[1]);

  // ========================== Column ==========================
  const optionColumns = React.useMemo(() => {
    const optionList = [{
      options: mergedOptions
    }];
    let currentList = mergedOptions;
    const fullPathKeys = (0, _commonUtil.getFullPathKeys)(currentList, fieldNames);
    for (let i = 0; i < activeValueCells.length; i += 1) {
      const activeValueCell = activeValueCells[i];
      const currentOption = currentList.find((option, index) => (fullPathKeys[index] ? (0, _commonUtil.toPathKey)(fullPathKeys[index]) : option[fieldNames.value]) === activeValueCell);
      const subOptions = currentOption?.[fieldNames.children];
      if (!subOptions?.length) {
        break;
      }
      currentList = subOptions;
      optionList.push({
        options: subOptions
      });
    }
    return optionList;
  }, [mergedOptions, activeValueCells, fieldNames]);

  // ========================= Keyboard =========================
  const onKeyboardSelect = (selectValueCells, option) => {
    if (isSelectable(option)) {
      onPathSelect(selectValueCells, (0, _commonUtil.isLeaf)(option, fieldNames), true);
    }
  };
  (0, _useKeyboard.default)(ref, mergedOptions, fieldNames, activeValueCells, onPathOpen, onKeyboardSelect, {
    direction,
    searchValue,
    toggleOpen,
    open
  });

  // >>>>> Active Scroll
  React.useEffect(() => {
    if (searchValue) {
      return;
    }
    for (let i = 0; i < activeValueCells.length; i += 1) {
      const cellPath = activeValueCells.slice(0, i + 1);
      const cellKeyPath = (0, _commonUtil.toPathKey)(cellPath);
      const ele = containerRef.current?.querySelector(`li[data-path-key="${cellKeyPath.replace(/\\{0,2}"/g, '\\"')}"]` // matches unescaped double quotes
      );
      if (ele) {
        (0, _commonUtil.scrollIntoParentView)(ele);
      }
    }
  }, [activeValueCells, searchValue]);

  // ========================== Render ==========================
  // >>>>> Empty
  const isEmpty = !optionColumns[0]?.options?.length;
  const emptyList = [{
    [fieldNames.value]: '__EMPTY__',
    [_Column.FIX_LABEL]: notFoundContent,
    disabled: true
  }];
  const columnProps = {
    ...props,
    multiple: !isEmpty && multiple,
    onSelect: onPathSelect,
    onActive: onPathOpen,
    onToggleOpen: toggleOpen,
    checkedSet,
    halfCheckedSet,
    loadingKeys,
    isSelectable
  };

  // >>>>> Columns
  const mergedOptionColumns = isEmpty ? [{
    options: emptyList
  }] : optionColumns;
  const columnNodes = mergedOptionColumns.map((col, index) => {
    const prevValuePath = activeValueCells.slice(0, index);
    const activeValue = activeValueCells[index];
    return /*#__PURE__*/React.createElement(_Column.default, _extends({
      key: index
    }, columnProps, {
      prefixCls: mergedPrefixCls,
      options: col.options,
      prevValuePath: prevValuePath,
      activeValue: activeValue
    }));
  });

  // >>>>> Render
  return /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${mergedPrefixCls}-menus`, {
      [`${mergedPrefixCls}-menu-empty`]: isEmpty,
      [`${mergedPrefixCls}-rtl`]: rtl
    }),
    ref: containerRef
  }, columnNodes);
});
if (process.env.NODE_ENV !== 'production') {
  RawOptionList.displayName = 'RawOptionList';
}
var _default = exports.default = RawOptionList;