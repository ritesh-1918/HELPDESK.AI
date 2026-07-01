function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import { useEvent, warning } from '@rc-component/util';
import * as React from 'react';
import { INTERNAL_HOOKS } from "../constant";
import { makeImmutable } from "../context/TableContext";
import Table, { DEFAULT_PREFIX } from "../Table";
import Grid from "./BodyGrid";
import { StaticContext } from "./context";
import getValue from "@rc-component/util/es/utils/get";
const renderBody = (rawData, props) => {
  const {
    ref,
    onScroll
  } = props;
  return /*#__PURE__*/React.createElement(Grid, {
    ref: ref,
    data: rawData,
    onScroll: onScroll
  });
};
const VirtualTable = (props, ref) => {
  const {
    data,
    columns,
    scroll,
    sticky,
    prefixCls = DEFAULT_PREFIX,
    className,
    listItemHeight,
    components,
    onScroll
  } = props;
  let {
    x: scrollX,
    y: scrollY
  } = scroll || {};

  // Fill scrollX
  if (typeof scrollX !== 'number') {
    if (process.env.NODE_ENV !== 'production') {
      warning(!scrollX, '`scroll.x` in virtual table must be number.');
    }
    scrollX = 1;
  }

  // Fill scrollY
  if (typeof scrollY !== 'number') {
    scrollY = 500;
    if (process.env.NODE_ENV !== 'production') {
      warning(false, '`scroll.y` in virtual table must be number.');
    }
  }
  const getComponent = useEvent((path, defaultComponent) => getValue(components, path) || defaultComponent);

  // Memo this
  const onInternalScroll = useEvent(onScroll);

  // ========================= Context ==========================
  const context = React.useMemo(() => ({
    sticky,
    scrollY,
    listItemHeight,
    getComponent,
    onScroll: onInternalScroll
  }), [sticky, scrollY, listItemHeight, getComponent, onInternalScroll]);

  // ========================== Render ==========================
  return /*#__PURE__*/React.createElement(StaticContext.Provider, {
    value: context
  }, /*#__PURE__*/React.createElement(Table, _extends({}, props, {
    className: clsx(className, `${prefixCls}-virtual`),
    scroll: {
      ...scroll,
      x: scrollX
    },
    components: {
      ...components,
      // fix https://github.com/ant-design/ant-design/issues/48991
      body: data?.length ? renderBody : undefined
    },
    columns: columns,
    internalHooks: INTERNAL_HOOKS,
    tailor: true,
    ref: ref
  })));
};
const RefVirtualTable = /*#__PURE__*/React.forwardRef(VirtualTable);
if (process.env.NODE_ENV !== 'production') {
  RefVirtualTable.displayName = 'VirtualTable';
}
export const genVirtualTable = shouldTriggerRender => {
  return makeImmutable(RefVirtualTable, shouldTriggerRender);
};
export default genVirtualTable();