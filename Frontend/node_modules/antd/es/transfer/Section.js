"use client";

import React, { useMemo, useRef, useState } from 'react';
import DownOutlined from "@ant-design/icons/es/icons/DownOutlined";
import { omit } from '@rc-component/util';
import { clsx } from 'clsx';
import { groupKeysMap } from '../_util/transKeys';
import Checkbox from '../checkbox';
import Dropdown from '../dropdown';
import DefaultListBody, { OmitProps } from './ListBody';
import Search from './search';
const defaultRender = () => null;
function isRenderResultPlainObject(result) {
  return !!(result && ! /*#__PURE__*/React.isValidElement(result) && Object.prototype.toString.call(result) === '[object Object]');
}
function getEnabledItemKeys(items) {
  return items.filter(data => !data.disabled).map(data => data.key);
}
const isValidIcon = icon => icon !== undefined;
const getShowSearchOption = showSearch => {
  if (showSearch && typeof showSearch === 'object') {
    return {
      ...showSearch,
      defaultValue: showSearch.defaultValue || ''
    };
  }
  return {
    defaultValue: '',
    placeholder: ''
  };
};
const TransferSection = props => {
  const {
    prefixCls,
    style,
    classNames,
    styles,
    dataSource = [],
    titleText = '',
    checkedKeys,
    disabled,
    showSearch = false,
    searchPlaceholder,
    notFoundContent,
    selectAll,
    deselectAll,
    selectCurrent,
    selectInvert,
    removeAll,
    removeCurrent,
    showSelectAll = true,
    showRemove,
    pagination,
    direction,
    itemsUnit,
    itemUnit,
    selectAllLabel,
    selectionsIcon,
    footer,
    renderList,
    onItemSelectAll,
    onItemRemove,
    handleFilter,
    handleClear,
    filterOption,
    render = defaultRender
  } = props;
  const sectionPrefixCls = `${prefixCls}-section`;
  const listPrefixCls = `${prefixCls}-list`;
  const searchOptions = getShowSearchOption(showSearch);
  const [filterValue, setFilterValue] = useState(searchOptions.defaultValue);
  const listBodyRef = useRef({});
  const internalHandleFilter = e => {
    setFilterValue(e.target.value);
    handleFilter(e);
  };
  const internalHandleClear = () => {
    setFilterValue('');
    handleClear();
  };
  const matchFilter = (text, item) => {
    if (typeof filterOption === 'function') {
      return filterOption(filterValue, item, direction);
    }
    return text.includes(filterValue);
  };
  const customRenderListBody = listProps => {
    let bodyContent = renderList ? renderList({
      ...listProps,
      onItemSelect: (key, check) => listProps.onItemSelect(key, check)
    }) : null;
    const customize = !!bodyContent;
    if (!customize) {
      // @ts-ignore
      bodyContent = /*#__PURE__*/React.createElement(DefaultListBody, {
        ref: listBodyRef,
        ...listProps,
        prefixCls: listPrefixCls
      });
    }
    return {
      customize,
      bodyContent
    };
  };
  const renderItem = item => {
    const renderResult = render(item);
    const isRenderResultPlain = isRenderResultPlainObject(renderResult);
    return {
      item,
      renderedEl: isRenderResultPlain ? renderResult.label : renderResult,
      renderedText: isRenderResultPlain ? renderResult.value : renderResult
    };
  };
  const notFoundContentEle = useMemo(() => Array.isArray(notFoundContent) ? notFoundContent[direction === 'left' ? 0 : 1] : notFoundContent, [notFoundContent, direction]);
  const [filteredItems, filteredRenderItems] = useMemo(() => {
    const filterItems = [];
    const filterRenderItems = [];
    dataSource.forEach(item => {
      const renderedItem = renderItem(item);
      if (filterValue && !matchFilter(renderedItem.renderedText, item)) {
        return;
      }
      filterItems.push(item);
      filterRenderItems.push(renderedItem);
    });
    return [filterItems, filterRenderItems];
  }, [dataSource, filterValue]);
  const checkedActiveItems = useMemo(() => {
    return filteredItems.filter(item => checkedKeys.includes(item.key) && !item.disabled);
  }, [checkedKeys, filteredItems]);
  const checkStatus = useMemo(() => {
    if (checkedActiveItems.length === 0) {
      return 'none';
    }
    const checkedKeysMap = groupKeysMap(checkedKeys);
    if (filteredItems.every(item => checkedKeysMap.has(item.key) || !!item.disabled)) {
      return 'all';
    }
    return 'part';
  }, [checkedActiveItems.length, checkedKeys, filteredItems]);
  const renderListBody = () => {
    const search = showSearch ? (/*#__PURE__*/React.createElement("div", {
      className: `${listPrefixCls}-body-search-wrapper`
    }, /*#__PURE__*/React.createElement(Search, {
      prefixCls: `${listPrefixCls}-search`,
      onChange: internalHandleFilter,
      handleClear: internalHandleClear,
      placeholder: searchOptions.placeholder || searchPlaceholder,
      value: filterValue,
      disabled: disabled
    }))) : null;
    const {
      customize,
      bodyContent
    } = customRenderListBody({
      ...omit(props, OmitProps),
      filteredItems,
      filteredRenderItems,
      selectedKeys: checkedKeys,
      classNames,
      styles
    });
    let bodyNode;
    // We should wrap customize list body in a classNamed div to use flex layout.
    if (customize) {
      bodyNode = /*#__PURE__*/React.createElement("div", {
        className: `${listPrefixCls}-body-customize-wrapper`
      }, bodyContent);
    } else {
      bodyNode = filteredItems.length ? bodyContent : (/*#__PURE__*/React.createElement("div", {
        className: `${listPrefixCls}-body-not-found`
      }, notFoundContentEle));
    }
    return /*#__PURE__*/React.createElement("div", {
      className: clsx(`${listPrefixCls}-body`, {
        [`${listPrefixCls}-body-with-search`]: showSearch
      }, classNames.body),
      style: styles.body
    }, search, bodyNode);
  };
  const checkBox = /*#__PURE__*/React.createElement(Checkbox, {
    disabled: dataSource.filter(d => !d.disabled).length === 0 || disabled,
    checked: checkStatus === 'all',
    indeterminate: checkStatus === 'part',
    className: `${listPrefixCls}-checkbox`,
    onChange: () => {
      // Only select enabled items
      onItemSelectAll?.(filteredItems.filter(item => !item.disabled).map(({
        key
      }) => key), checkStatus !== 'all');
    }
  });
  const getSelectAllLabel = (selectedCount, totalCount) => {
    if (selectAllLabel) {
      return typeof selectAllLabel === 'function' ? selectAllLabel({
        selectedCount,
        totalCount
      }) : selectAllLabel;
    }
    const unit = totalCount > 1 ? itemsUnit : itemUnit;
    return /*#__PURE__*/React.createElement(React.Fragment, null, (selectedCount > 0 ? `${selectedCount}/` : '') + totalCount, " ", unit);
  };
  // Custom Layout
  const footerDom = footer && (footer.length < 2 ? footer(props) : footer(props, {
    direction
  }));
  // Get filtered, checked item list
  const listFooter = footerDom ? (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${listPrefixCls}-footer`, classNames.footer),
    style: styles.footer
  }, footerDom)) : null;
  const checkAllCheckbox = !showRemove && !pagination && checkBox;
  let items;
  if (showRemove) {
    items = [/* Remove Current Page */
    pagination ? {
      key: 'removeCurrent',
      label: removeCurrent,
      onClick() {
        const pageKeys = getEnabledItemKeys((listBodyRef.current?.items || []).map(entity => entity.item));
        onItemRemove?.(pageKeys);
      }
    } : null, /* Remove All */
    {
      key: 'removeAll',
      label: removeAll,
      onClick() {
        onItemRemove?.(getEnabledItemKeys(filteredItems));
      }
    }].filter(Boolean);
  } else {
    items = [{
      key: 'selectAll',
      label: checkStatus === 'all' ? deselectAll : selectAll,
      onClick() {
        const keys = getEnabledItemKeys(filteredItems);
        onItemSelectAll?.(keys, keys.length !== checkedKeys.length);
      }
    }, pagination ? {
      key: 'selectCurrent',
      label: selectCurrent,
      onClick() {
        const pageItems = listBodyRef.current?.items || [];
        onItemSelectAll?.(getEnabledItemKeys(pageItems.map(entity => entity.item)), true);
      }
    } : null, {
      key: 'selectInvert',
      label: selectInvert,
      onClick() {
        const availablePageItemKeys = getEnabledItemKeys((listBodyRef.current?.items || []).map(entity => entity.item));
        const checkedKeySet = new Set(checkedKeys);
        const newCheckedKeysSet = new Set(checkedKeySet);
        availablePageItemKeys.forEach(key => {
          if (checkedKeySet.has(key)) {
            newCheckedKeysSet.delete(key);
          } else {
            newCheckedKeysSet.add(key);
          }
        });
        onItemSelectAll?.(Array.from(newCheckedKeysSet), 'replace');
      }
    }];
  }
  const dropdown = /*#__PURE__*/React.createElement(Dropdown, {
    className: `${listPrefixCls}-header-dropdown`,
    menu: {
      items
    },
    disabled: disabled
  }, isValidIcon(selectionsIcon) ? selectionsIcon : /*#__PURE__*/React.createElement(DownOutlined, null));
  return /*#__PURE__*/React.createElement("div", {
    className: clsx(sectionPrefixCls, classNames.section, {
      [`${sectionPrefixCls}-with-pagination`]: !!pagination,
      [`${sectionPrefixCls}-with-footer`]: !!footerDom
    }),
    style: {
      ...style,
      ...styles.section
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: clsx(`${listPrefixCls}-header`, classNames.header),
    style: styles.header
  }, showSelectAll ? (/*#__PURE__*/React.createElement(React.Fragment, null, checkAllCheckbox, dropdown)) : null, /*#__PURE__*/React.createElement("span", {
    className: `${listPrefixCls}-header-selected`
  }, getSelectAllLabel(checkedActiveItems.length, filteredItems.length)), /*#__PURE__*/React.createElement("span", {
    className: clsx(`${listPrefixCls}-header-title`, classNames.title),
    style: styles.title
  }, titleText)), renderListBody(), listFooter);
};
if (process.env.NODE_ENV !== 'production') {
  TransferSection.displayName = 'TransferSection';
}
export default TransferSection;