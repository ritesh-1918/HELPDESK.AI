import warning from "@rc-component/util/es/warning";
import * as React from 'react';
import { INTERNAL_HOOKS } from "../constant";
import { findAllChildrenKeys, renderExpandIcon } from "../utils/expandUtil";
import { getExpandableProps } from "../utils/legacyUtil";
export default function useExpand(props, mergedData, getRowKey) {
  const expandableConfig = getExpandableProps(props);
  const {
    expandIcon,
    expandedRowKeys,
    defaultExpandedRowKeys,
    defaultExpandAllRows,
    expandedRowRender,
    onExpand,
    onExpandedRowsChange,
    childrenColumnName
  } = expandableConfig;
  const mergedExpandIcon = expandIcon || renderExpandIcon;
  const mergedChildrenColumnName = childrenColumnName || 'children';
  const expandableType = React.useMemo(() => {
    if (expandedRowRender) {
      return 'row';
    }
    /* eslint-disable no-underscore-dangle */
    /**
     * Fix https://github.com/ant-design/ant-design/issues/21154
     * This is a workaround to not to break current behavior.
     * We can remove follow code after final release.
     *
     * To other developer:
     *  Do not use `__PARENT_RENDER_ICON__` in prod since we will remove this when refactor
     */
    if (props.expandable && props.internalHooks === INTERNAL_HOOKS && props.expandable.__PARENT_RENDER_ICON__ || mergedData.some(record => record && typeof record === 'object' && record[mergedChildrenColumnName])) {
      return 'nest';
    }
    /* eslint-enable */
    return false;
  }, [!!expandedRowRender, mergedData]);
  const [innerExpandedKeys, setInnerExpandedKeys] = React.useState(() => {
    if (defaultExpandedRowKeys) {
      return defaultExpandedRowKeys;
    }
    if (defaultExpandAllRows) {
      return findAllChildrenKeys(mergedData, getRowKey, mergedChildrenColumnName);
    }
    return [];
  });
  const mergedExpandedKeys = React.useMemo(() => new Set(expandedRowKeys || innerExpandedKeys || []), [expandedRowKeys, innerExpandedKeys]);
  const onTriggerExpand = React.useCallback(record => {
    const key = getRowKey(record, mergedData.indexOf(record));
    let newExpandedKeys;
    const hasKey = mergedExpandedKeys.has(key);
    if (hasKey) {
      mergedExpandedKeys.delete(key);
      newExpandedKeys = [...mergedExpandedKeys];
    } else {
      newExpandedKeys = [...mergedExpandedKeys, key];
    }
    setInnerExpandedKeys(newExpandedKeys);
    if (onExpand) {
      onExpand(!hasKey, record);
    }
    if (onExpandedRowsChange) {
      onExpandedRowsChange(newExpandedKeys);
    }
  }, [getRowKey, mergedExpandedKeys, mergedData, onExpand, onExpandedRowsChange]);

  // Warning if use `expandedRowRender` and nest children in the same time
  if (process.env.NODE_ENV !== 'production' && expandedRowRender && mergedData.some(record => {
    return Array.isArray(record?.[mergedChildrenColumnName]);
  })) {
    warning(false, '`expandedRowRender` should not use with nested Table');
  }
  return [expandableConfig, expandableType, mergedExpandedKeys, mergedExpandIcon, mergedChildrenColumnName, onTriggerExpand];
}