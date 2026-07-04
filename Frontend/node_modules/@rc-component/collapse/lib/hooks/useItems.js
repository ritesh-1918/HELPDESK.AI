"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _toArray = _interopRequireDefault(require("@rc-component/util/lib/Children/toArray"));
var _react = _interopRequireDefault(require("react"));
var _Panel = _interopRequireDefault(require("../Panel"));
var _clsx = _interopRequireDefault(require("clsx"));
function mergeSemantic(src, tgt, mergeFn) {
  if (!src || !tgt) {
    return src || tgt;
  }
  const keys = Array.from(new Set([...Object.keys(src), ...Object.keys(tgt)]));
  const result = {};
  keys.forEach(key => {
    result[key] = mergeFn(src[key], tgt[key]);
  });
  return result;
}
function mergeSemanticClassNames(src, tgt) {
  return mergeSemantic(src, tgt, (a, b) => (0, _clsx.default)(a, b));
}
function mergeSemanticStyles(src, tgt) {
  return mergeSemantic(src, tgt, (a, b) => ({
    ...a,
    ...b
  }));
}
const convertItemsToNodes = (items, props) => {
  const {
    prefixCls,
    accordion,
    collapsible,
    destroyOnHidden,
    onItemClick,
    activeKey,
    openMotion,
    expandIcon,
    classNames: collapseClassNames,
    styles: collapseStyles
  } = props;
  return items.map((item, index) => {
    const {
      children,
      label,
      key: rawKey,
      collapsible: rawCollapsible,
      onItemClick: rawOnItemClick,
      destroyOnHidden: rawDestroyOnHidden,
      classNames,
      styles,
      ...restProps
    } = item;

    // You may be puzzled why you want to convert them all into strings, me too.
    // Maybe: https://github.com/react-component/collapse/blob/aac303a8b6ff30e35060b4f8fecde6f4556fcbe2/src/Collapse.tsx#L15
    const key = String(rawKey ?? index);
    const mergeCollapsible = rawCollapsible ?? collapsible;
    const mergedDestroyOnHidden = rawDestroyOnHidden ?? destroyOnHidden;
    const handleItemClick = value => {
      if (mergeCollapsible === 'disabled') {
        return;
      }
      onItemClick(value);
      rawOnItemClick?.(value);
    };
    let isActive = false;
    if (accordion) {
      isActive = activeKey[0] === key;
    } else {
      isActive = activeKey.indexOf(key) > -1;
    }
    return /*#__PURE__*/_react.default.createElement(_Panel.default, (0, _extends2.default)({}, restProps, {
      classNames: mergeSemanticClassNames(collapseClassNames, classNames),
      styles: mergeSemanticStyles(collapseStyles, styles),
      prefixCls: prefixCls,
      key: key,
      panelKey: key,
      isActive: isActive,
      accordion: accordion,
      openMotion: openMotion,
      expandIcon: expandIcon,
      header: label,
      collapsible: mergeCollapsible,
      onItemClick: handleItemClick,
      destroyOnHidden: mergedDestroyOnHidden
    }), children);
  });
};

/**
 * @deprecated The next major version will be removed
 */
const getNewChild = (child, index, props) => {
  if (!child) {
    return null;
  }
  const {
    prefixCls,
    accordion,
    collapsible,
    destroyOnHidden,
    onItemClick,
    activeKey,
    openMotion,
    expandIcon,
    classNames: collapseClassNames,
    styles
  } = props;
  const key = child.key || String(index);
  const {
    header,
    headerClass,
    destroyOnHidden: childDestroyOnHidden,
    collapsible: childCollapsible,
    onItemClick: childOnItemClick
  } = child.props;
  let isActive = false;
  if (accordion) {
    isActive = activeKey[0] === key;
  } else {
    isActive = activeKey.indexOf(key) > -1;
  }
  const mergeCollapsible = childCollapsible ?? collapsible;
  const handleItemClick = value => {
    if (mergeCollapsible === 'disabled') {
      return;
    }
    onItemClick(value);
    childOnItemClick?.(value);
  };
  const childProps = {
    key,
    panelKey: key,
    header,
    headerClass,
    classNames: collapseClassNames,
    styles,
    isActive,
    prefixCls,
    destroyOnHidden: childDestroyOnHidden ?? destroyOnHidden,
    openMotion,
    accordion,
    children: child.props.children,
    onItemClick: handleItemClick,
    expandIcon,
    collapsible: mergeCollapsible
  };

  // https://github.com/ant-design/ant-design/issues/20479
  if (typeof child.type === 'string') {
    return child;
  }
  Object.keys(childProps).forEach(propName => {
    if (typeof childProps[propName] === 'undefined') {
      delete childProps[propName];
    }
  });
  return /*#__PURE__*/_react.default.cloneElement(child, childProps);
};
function useItems(items, rawChildren, props) {
  if (Array.isArray(items)) {
    return convertItemsToNodes(items, props);
  }
  return (0, _toArray.default)(rawChildren).map((child, index) => getNewChild(child, index, props));
}
var _default = exports.default = useItems;