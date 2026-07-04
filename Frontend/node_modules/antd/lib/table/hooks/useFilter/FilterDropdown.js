"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.flattenKeys = flattenKeys;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var React = _interopRequireWildcard(require("react"));
var _FilterFilled = _interopRequireDefault(require("@ant-design/icons/FilterFilled"));
var _isEqual = _interopRequireDefault(require("@rc-component/util/lib/isEqual"));
var _clsx = require("clsx");
var _extendsObject = _interopRequireDefault(require("../../../_util/extendsObject"));
var _hooks = require("../../../_util/hooks");
var _warning = require("../../../_util/warning");
var _Button = _interopRequireDefault(require("../../../button/Button"));
var _checkbox = _interopRequireDefault(require("../../../checkbox"));
var _context = require("../../../config-provider/context");
var _dropdown = _interopRequireDefault(require("../../../dropdown"));
var _empty = _interopRequireDefault(require("../../../empty"));
var _menu = _interopRequireDefault(require("../../../menu"));
var _OverrideContext = require("../../../menu/OverrideContext");
var _radio = _interopRequireDefault(require("../../../radio"));
var _tree = _interopRequireDefault(require("../../../tree"));
var _TableMeasureRowContext = _interopRequireDefault(require("../../TableMeasureRowContext"));
var _FilterSearch = _interopRequireDefault(require("./FilterSearch"));
var _FilterWrapper = _interopRequireDefault(require("./FilterWrapper"));
function flattenKeys(filters) {
  let keys = [];
  (filters || []).forEach(({
    value,
    children
  }) => {
    keys.push(value);
    if (children) {
      keys = [].concat((0, _toConsumableArray2.default)(keys), (0, _toConsumableArray2.default)(flattenKeys(children)));
    }
  });
  return keys;
}
function hasSubMenu(filters) {
  return filters.some(({
    children
  }) => children);
}
function searchValueMatched(searchValue, text) {
  if (typeof text === 'string' || typeof text === 'number') {
    return text?.toString().toLowerCase().includes(searchValue.trim().toLowerCase());
  }
  return false;
}
function renderFilterItems({
  filters,
  prefixCls,
  filteredKeys,
  filterMultiple,
  searchValue,
  filterSearch
}) {
  return filters.map((filter, index) => {
    const key = String(filter.value);
    if (filter.children) {
      return {
        key: key || index,
        label: filter.text,
        popupClassName: `${prefixCls}-dropdown-submenu`,
        children: renderFilterItems({
          filters: filter.children,
          prefixCls,
          filteredKeys,
          filterMultiple,
          searchValue,
          filterSearch
        })
      };
    }
    const Component = filterMultiple ? _checkbox.default : _radio.default;
    const item = {
      key: filter.value !== undefined ? key : index,
      label: (/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Component, {
        checked: filteredKeys.includes(key)
      }), /*#__PURE__*/React.createElement("span", null, filter.text)))
    };
    if (searchValue.trim()) {
      if (typeof filterSearch === 'function') {
        return filterSearch(searchValue, filter) ? item : null;
      }
      return searchValueMatched(searchValue, filter.text) ? item : null;
    }
    return item;
  });
}
function wrapStringListType(keys) {
  return keys || [];
}
const FilterDropdown = props => {
  const {
    tablePrefixCls,
    prefixCls,
    column,
    dropdownPrefixCls,
    columnKey,
    filterOnClose,
    filterMultiple,
    filterMode = 'menu',
    filterSearch = false,
    filterState,
    triggerFilter,
    locale,
    children,
    getPopupContainer,
    rootClassName
  } = props;
  const {
    filterResetToDefaultFilteredValue,
    defaultFilteredValue,
    filterDropdownProps = {},
    // Deprecated
    filterDropdownOpen,
    onFilterDropdownOpenChange
  } = column;
  const [visible, setVisible] = React.useState(false);
  const inMeasureRow = React.useContext(_TableMeasureRowContext.default);
  const filtered = !!(filterState && (filterState.filteredKeys?.length || filterState.forceFiltered));
  const triggerVisible = newVisible => {
    setVisible(newVisible);
    filterDropdownProps.onOpenChange?.(newVisible);
    // deprecated
    onFilterDropdownOpenChange?.(newVisible);
  };
  // =================Warning===================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Table');
    const deprecatedList = [['filterDropdownOpen', 'filterDropdownProps.open'], ['onFilterDropdownOpenChange', 'filterDropdownProps.onOpenChange']];
    deprecatedList.forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in column), deprecatedName, newName);
    });
    warning.deprecated(!('filterCheckall' in locale), 'filterCheckall', 'locale.filterCheckAll');
  }
  const mergedVisible = filterDropdownProps.open ?? filterDropdownOpen ??
  // deprecated
  visible; // inner state
  // ===================== Select Keys =====================
  const propFilteredKeys = filterState?.filteredKeys;
  const [getFilteredKeysSync, setFilteredKeysSync] = (0, _hooks.useSyncState)(wrapStringListType(propFilteredKeys));
  const onSelectKeys = ({
    selectedKeys
  }) => {
    setFilteredKeysSync(selectedKeys);
  };
  const onCheck = (keys, {
    node,
    checked
  }) => {
    if (!filterMultiple) {
      onSelectKeys({
        selectedKeys: checked && node.key ? [node.key] : []
      });
    } else {
      onSelectKeys({
        selectedKeys: keys
      });
    }
  };
  React.useEffect(() => {
    if (!visible) {
      return;
    }
    onSelectKeys({
      selectedKeys: wrapStringListType(propFilteredKeys)
    });
  }, [propFilteredKeys]);
  // ====================== Open Keys ======================
  const [openKeys, setOpenKeys] = React.useState([]);
  const onOpenChange = keys => {
    setOpenKeys(keys);
  };
  // search in tree mode column filter
  const [searchValue, setSearchValue] = React.useState('');
  const onSearch = e => {
    const {
      value
    } = e.target;
    setSearchValue(value);
  };
  // clear search value after close filter dropdown
  React.useEffect(() => {
    if (!visible) {
      setSearchValue('');
    }
  }, [visible]);
  // ======================= Submit ========================
  const internalTriggerFilter = keys => {
    const mergedKeys = keys?.length ? keys : null;
    if (mergedKeys === null && (!filterState || !filterState.filteredKeys)) {
      return null;
    }
    if ((0, _isEqual.default)(mergedKeys, filterState?.filteredKeys, true)) {
      return null;
    }
    triggerFilter({
      column,
      key: columnKey,
      filteredKeys: mergedKeys
    });
  };
  const onConfirm = () => {
    triggerVisible(false);
    internalTriggerFilter(getFilteredKeysSync());
  };
  const onReset = ({
    confirm,
    closeDropdown
  } = {
    confirm: false,
    closeDropdown: false
  }) => {
    if (confirm) {
      internalTriggerFilter([]);
    }
    if (closeDropdown) {
      triggerVisible(false);
    }
    setSearchValue('');
    if (filterResetToDefaultFilteredValue) {
      setFilteredKeysSync((defaultFilteredValue || []).map(key => String(key)));
    } else {
      setFilteredKeysSync([]);
    }
  };
  const doFilter = ({
    closeDropdown
  } = {
    closeDropdown: true
  }) => {
    if (closeDropdown) {
      triggerVisible(false);
    }
    internalTriggerFilter(getFilteredKeysSync());
  };
  const onVisibleChange = (newVisible, info) => {
    if (info.source === 'trigger') {
      if (newVisible && propFilteredKeys !== undefined) {
        // Sync filteredKeys on appear in controlled mode (propFilteredKeys !== undefined)
        setFilteredKeysSync(wrapStringListType(propFilteredKeys));
      }
      triggerVisible(newVisible);
      if (!newVisible && !column.filterDropdown && filterOnClose) {
        onConfirm();
      }
    }
  };
  // ======================== Style ========================
  const dropdownMenuClass = (0, _clsx.clsx)({
    [`${dropdownPrefixCls}-menu-without-submenu`]: !hasSubMenu(column.filters || [])
  });
  const onCheckAll = e => {
    if (e.target.checked) {
      const allFilterKeys = flattenKeys(column?.filters).map(key => String(key));
      setFilteredKeysSync(allFilterKeys);
    } else {
      setFilteredKeysSync([]);
    }
  };
  const getTreeData = ({
    filters
  }) => (filters || []).map((filter, index) => {
    const key = String(filter.value);
    const item = {
      title: filter.text,
      key: filter.value !== undefined ? key : String(index)
    };
    if (filter.children) {
      item.children = getTreeData({
        filters: filter.children
      });
    }
    return item;
  });
  const getFilterData = node => ({
    ...node,
    text: node.title,
    value: node.key,
    children: node.children?.map(item => getFilterData(item)) || []
  });
  let dropdownContent;
  const {
    direction,
    renderEmpty
  } = React.useContext(_context.ConfigContext);
  if (typeof column.filterDropdown === 'function') {
    dropdownContent = column.filterDropdown({
      prefixCls: `${dropdownPrefixCls}-custom`,
      setSelectedKeys: selectedKeys => onSelectKeys({
        selectedKeys: selectedKeys
      }),
      selectedKeys: getFilteredKeysSync(),
      confirm: doFilter,
      clearFilters: onReset,
      filters: column.filters,
      visible: mergedVisible,
      close: () => {
        triggerVisible(false);
      }
    });
  } else if (column.filterDropdown) {
    dropdownContent = column.filterDropdown;
  } else {
    const selectedKeys = getFilteredKeysSync() || [];
    const getFilterComponent = () => {
      const empty = renderEmpty?.('Table.filter') ?? (/*#__PURE__*/React.createElement(_empty.default, {
        image: _empty.default.PRESENTED_IMAGE_SIMPLE,
        description: locale.filterEmptyText,
        styles: {
          image: {
            height: 24
          }
        },
        style: {
          margin: 0,
          padding: '16px 0'
        }
      }));
      if ((column.filters || []).length === 0) {
        return empty;
      }
      if (filterMode === 'tree') {
        return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_FilterSearch.default, {
          filterSearch: filterSearch,
          value: searchValue,
          onChange: onSearch,
          tablePrefixCls: tablePrefixCls,
          locale: locale
        }), /*#__PURE__*/React.createElement("div", {
          className: `${tablePrefixCls}-filter-dropdown-tree`
        }, filterMultiple ? (/*#__PURE__*/React.createElement(_checkbox.default, {
          checked: selectedKeys.length === flattenKeys(column.filters).length,
          indeterminate: selectedKeys.length > 0 && selectedKeys.length < flattenKeys(column.filters).length,
          className: `${tablePrefixCls}-filter-dropdown-checkall`,
          onChange: onCheckAll
        }, locale?.filterCheckall ?? locale?.filterCheckAll)) : null, /*#__PURE__*/React.createElement(_tree.default, {
          checkable: true,
          selectable: false,
          blockNode: true,
          multiple: filterMultiple,
          checkStrictly: !filterMultiple,
          className: `${dropdownPrefixCls}-menu`,
          onCheck: onCheck,
          checkedKeys: selectedKeys,
          selectedKeys: selectedKeys,
          showIcon: false,
          treeData: getTreeData({
            filters: column.filters
          }),
          autoExpandParent: true,
          defaultExpandAll: true,
          filterTreeNode: searchValue.trim() ? node => {
            if (typeof filterSearch === 'function') {
              return filterSearch(searchValue, getFilterData(node));
            }
            return searchValueMatched(searchValue, node.title);
          } : undefined
        })));
      }
      const items = renderFilterItems({
        filters: column.filters || [],
        filterSearch,
        prefixCls,
        filteredKeys: getFilteredKeysSync(),
        filterMultiple,
        searchValue
      });
      const isEmpty = items.every(item => item === null);
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_FilterSearch.default, {
        filterSearch: filterSearch,
        value: searchValue,
        onChange: onSearch,
        tablePrefixCls: tablePrefixCls,
        locale: locale
      }), isEmpty ? empty : (/*#__PURE__*/React.createElement(_menu.default, {
        selectable: true,
        multiple: filterMultiple,
        prefixCls: `${dropdownPrefixCls}-menu`,
        className: dropdownMenuClass,
        onSelect: onSelectKeys,
        onDeselect: onSelectKeys,
        selectedKeys: selectedKeys,
        getPopupContainer: getPopupContainer,
        openKeys: openKeys,
        onOpenChange: onOpenChange,
        items: items
      })));
    };
    const getResetDisabled = () => {
      if (filterResetToDefaultFilteredValue) {
        return (0, _isEqual.default)((defaultFilteredValue || []).map(key => String(key)), selectedKeys, true);
      }
      return selectedKeys.length === 0;
    };
    dropdownContent = /*#__PURE__*/React.createElement(React.Fragment, null, getFilterComponent(), /*#__PURE__*/React.createElement("div", {
      className: `${prefixCls}-dropdown-btns`
    }, /*#__PURE__*/React.createElement(_Button.default, {
      type: "link",
      size: "small",
      disabled: getResetDisabled(),
      onClick: () => onReset()
    }, locale.filterReset), /*#__PURE__*/React.createElement(_Button.default, {
      type: "primary",
      size: "small",
      onClick: onConfirm
    }, locale.filterConfirm)));
  }
  // We should not block customize Menu with additional props
  if (column.filterDropdown) {
    dropdownContent = /*#__PURE__*/React.createElement(_OverrideContext.OverrideProvider, {
      selectable: undefined
    }, dropdownContent);
  }
  dropdownContent = /*#__PURE__*/React.createElement(_FilterWrapper.default, {
    className: `${prefixCls}-dropdown`
  }, dropdownContent);
  const getDropdownTrigger = () => {
    let filterIcon;
    if (typeof column.filterIcon === 'function') {
      filterIcon = column.filterIcon(filtered);
    } else if (column.filterIcon) {
      filterIcon = column.filterIcon;
    } else {
      filterIcon = /*#__PURE__*/React.createElement(_FilterFilled.default, null);
    }
    return /*#__PURE__*/React.createElement("span", {
      role: "button",
      tabIndex: -1,
      className: (0, _clsx.clsx)(`${prefixCls}-trigger`, {
        active: filtered
      }),
      onClick: e => {
        e.stopPropagation();
      }
    }, filterIcon);
  };
  const triggerNode = getDropdownTrigger();
  // MeasureRow：仅渲染静态 trigger，不渲染 Dropdown 实例
  if (inMeasureRow) {
    return /*#__PURE__*/React.createElement("div", {
      className: `${prefixCls}-column`
    }, /*#__PURE__*/React.createElement("span", {
      className: `${tablePrefixCls}-column-title`
    }, children), triggerNode);
  }
  const mergedDropdownProps = (0, _extendsObject.default)({
    trigger: ['click'],
    placement: direction === 'rtl' ? 'bottomLeft' : 'bottomRight',
    children: triggerNode,
    getPopupContainer
  }, {
    ...filterDropdownProps,
    rootClassName: (0, _clsx.clsx)(rootClassName, filterDropdownProps.rootClassName),
    open: mergedVisible,
    onOpenChange: onVisibleChange,
    popupRender: () => {
      if (typeof filterDropdownProps?.dropdownRender === 'function') {
        return filterDropdownProps.dropdownRender(dropdownContent);
      }
      return dropdownContent;
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-column`
  }, /*#__PURE__*/React.createElement("span", {
    className: `${tablePrefixCls}-column-title`
  }, children), /*#__PURE__*/React.createElement(_dropdown.default, {
    ...mergedDropdownProps
  }));
};
var _default = exports.default = FilterDropdown;