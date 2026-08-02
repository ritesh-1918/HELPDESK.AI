"use client";

import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import * as React from 'react';
import FilterFilled from "@ant-design/icons/es/icons/FilterFilled";
import isEqual from "@rc-component/util/es/isEqual";
import { clsx } from 'clsx';
import extendsObject from '../../../_util/extendsObject';
import { useSyncState } from '../../../_util/hooks';
import { devUseWarning } from '../../../_util/warning';
import Button from '../../../button/Button';
import Checkbox from '../../../checkbox';
import { ConfigContext } from '../../../config-provider/context';
import Dropdown from '../../../dropdown';
import Empty from '../../../empty';
import Menu from '../../../menu';
import { OverrideProvider } from '../../../menu/OverrideContext';
import Radio from '../../../radio';
import Tree from '../../../tree';
import TableMeasureRowContext from '../../TableMeasureRowContext';
import FilterSearch from './FilterSearch';
import FilterDropdownMenuWrapper from './FilterWrapper';
export function flattenKeys(filters) {
  let keys = [];
  (filters || []).forEach(({
    value,
    children
  }) => {
    keys.push(value);
    if (children) {
      keys = [].concat(_toConsumableArray(keys), _toConsumableArray(flattenKeys(children)));
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
    const Component = filterMultiple ? Checkbox : Radio;
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
  const inMeasureRow = React.useContext(TableMeasureRowContext);
  const filtered = !!(filterState && (filterState.filteredKeys?.length || filterState.forceFiltered));
  const triggerVisible = newVisible => {
    setVisible(newVisible);
    filterDropdownProps.onOpenChange?.(newVisible);
    // deprecated
    onFilterDropdownOpenChange?.(newVisible);
  };
  // =================Warning===================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Table');
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
  const [getFilteredKeysSync, setFilteredKeysSync] = useSyncState(wrapStringListType(propFilteredKeys));
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
    if (isEqual(mergedKeys, filterState?.filteredKeys, true)) {
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
  const dropdownMenuClass = clsx({
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
  } = React.useContext(ConfigContext);
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
      const empty = renderEmpty?.('Table.filter') ?? (/*#__PURE__*/React.createElement(Empty, {
        image: Empty.PRESENTED_IMAGE_SIMPLE,
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
        return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FilterSearch, {
          filterSearch: filterSearch,
          value: searchValue,
          onChange: onSearch,
          tablePrefixCls: tablePrefixCls,
          locale: locale
        }), /*#__PURE__*/React.createElement("div", {
          className: `${tablePrefixCls}-filter-dropdown-tree`
        }, filterMultiple ? (/*#__PURE__*/React.createElement(Checkbox, {
          checked: selectedKeys.length === flattenKeys(column.filters).length,
          indeterminate: selectedKeys.length > 0 && selectedKeys.length < flattenKeys(column.filters).length,
          className: `${tablePrefixCls}-filter-dropdown-checkall`,
          onChange: onCheckAll
        }, locale?.filterCheckall ?? locale?.filterCheckAll)) : null, /*#__PURE__*/React.createElement(Tree, {
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
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FilterSearch, {
        filterSearch: filterSearch,
        value: searchValue,
        onChange: onSearch,
        tablePrefixCls: tablePrefixCls,
        locale: locale
      }), isEmpty ? empty : (/*#__PURE__*/React.createElement(Menu, {
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
        return isEqual((defaultFilteredValue || []).map(key => String(key)), selectedKeys, true);
      }
      return selectedKeys.length === 0;
    };
    dropdownContent = /*#__PURE__*/React.createElement(React.Fragment, null, getFilterComponent(), /*#__PURE__*/React.createElement("div", {
      className: `${prefixCls}-dropdown-btns`
    }, /*#__PURE__*/React.createElement(Button, {
      type: "link",
      size: "small",
      disabled: getResetDisabled(),
      onClick: () => onReset()
    }, locale.filterReset), /*#__PURE__*/React.createElement(Button, {
      type: "primary",
      size: "small",
      onClick: onConfirm
    }, locale.filterConfirm)));
  }
  // We should not block customize Menu with additional props
  if (column.filterDropdown) {
    dropdownContent = /*#__PURE__*/React.createElement(OverrideProvider, {
      selectable: undefined
    }, dropdownContent);
  }
  dropdownContent = /*#__PURE__*/React.createElement(FilterDropdownMenuWrapper, {
    className: `${prefixCls}-dropdown`
  }, dropdownContent);
  const getDropdownTrigger = () => {
    let filterIcon;
    if (typeof column.filterIcon === 'function') {
      filterIcon = column.filterIcon(filtered);
    } else if (column.filterIcon) {
      filterIcon = column.filterIcon;
    } else {
      filterIcon = /*#__PURE__*/React.createElement(FilterFilled, null);
    }
    return /*#__PURE__*/React.createElement("span", {
      role: "button",
      tabIndex: -1,
      className: clsx(`${prefixCls}-trigger`, {
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
  const mergedDropdownProps = extendsObject({
    trigger: ['click'],
    placement: direction === 'rtl' ? 'bottomLeft' : 'bottomRight',
    children: triggerNode,
    getPopupContainer
  }, {
    ...filterDropdownProps,
    rootClassName: clsx(rootClassName, filterDropdownProps.rootClassName),
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
  }, children), /*#__PURE__*/React.createElement(Dropdown, {
    ...mergedDropdownProps
  }));
};
export default FilterDropdown;