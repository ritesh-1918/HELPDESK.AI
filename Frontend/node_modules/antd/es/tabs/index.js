"use client";

import * as React from 'react';
import CloseOutlined from "@ant-design/icons/es/icons/CloseOutlined";
import EllipsisOutlined from "@ant-design/icons/es/icons/EllipsisOutlined";
import PlusOutlined from "@ant-design/icons/es/icons/PlusOutlined";
import RcTabs from '@rc-component/tabs';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { ConfigContext } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import useAnimateConfig from './hooks/useAnimateConfig';
import useLegacyItems from './hooks/useLegacyItems';
import useStyle from './style';
import TabPane from './TabPane';
const InternalTabs = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    type,
    className,
    rootClassName,
    size: customSize,
    onEdit,
    hideAdd,
    centered,
    addIcon,
    removeIcon,
    moreIcon,
    more,
    popupClassName,
    children,
    items,
    animated,
    style,
    indicatorSize,
    indicator,
    classNames,
    styles,
    destroyInactiveTabPane,
    destroyOnHidden,
    tabPlacement,
    tabPosition,
    ...restProps
  } = props;
  const {
    prefixCls: customizePrefixCls
  } = restProps;
  const {
    getPrefixCls,
    direction,
    getPopupContainer,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('tabs');
  const {
    tabs
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('tabs', customizePrefixCls);
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  const tabsRef = React.useRef(null);
  React.useImperativeHandle(ref, () => ({
    nativeElement: tabsRef.current
  }));
  let editable;
  if (type === 'editable-card') {
    editable = {
      onEdit: (editType, {
        key,
        event
      }) => {
        onEdit?.(editType === 'add' ? event : key, editType);
      },
      removeIcon: removeIcon ?? tabs?.removeIcon ?? /*#__PURE__*/React.createElement(CloseOutlined, null),
      addIcon: (addIcon ?? tabs?.addIcon) || /*#__PURE__*/React.createElement(PlusOutlined, null),
      showAdd: hideAdd !== true
    };
  }
  const rootPrefixCls = getPrefixCls();
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Tabs');
    [['popupClassName', 'classNames.popup'], ['tabPosition', 'tabPlacement']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
    process.env.NODE_ENV !== "production" ? warning(!('onPrevClick' in props) && !('onNextClick' in props), 'breaking', '`onPrevClick` and `onNextClick` has been removed. Please use `onTabScroll` instead.') : void 0;
    process.env.NODE_ENV !== "production" ? warning(!(indicatorSize || tabs?.indicatorSize), 'deprecated', '`indicatorSize` has been deprecated. Please use `indicator={{ size: ... }}` instead.') : void 0;
    warning.deprecated(!('destroyInactiveTabPane' in props || items?.some(item => 'destroyInactiveTabPane' in item)), 'destroyInactiveTabPane', 'destroyOnHidden');
  }
  const size = useSize(customSize);
  const mergedItems = useLegacyItems(items, children);
  const mergedAnimated = useAnimateConfig(prefixCls, animated);
  const mergedIndicator = {
    align: indicator?.align ?? tabs?.indicator?.align,
    size: indicator?.size ?? indicatorSize ?? tabs?.indicator?.size ?? tabs?.indicatorSize
  };
  const mergedPlacement = React.useMemo(() => {
    const placement = tabPlacement ?? tabPosition ?? undefined;
    const isRTL = direction === 'rtl';
    switch (placement) {
      case 'start':
        return isRTL ? 'right' : 'left';
      case 'end':
        return isRTL ? 'left' : 'right';
      default:
        return placement;
    }
  }, [tabPlacement, tabPosition, direction]);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    size,
    tabPlacement: mergedPlacement,
    items: mergedItems
  };
  // ========================= Style ==========================
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  }, {
    popup: {
      _default: 'root'
    }
  });
  return /*#__PURE__*/React.createElement(RcTabs, {
    ref: tabsRef,
    direction: direction,
    getPopupContainer: getPopupContainer,
    ...restProps,
    items: mergedItems,
    className: clsx({
      [`${prefixCls}-${size}`]: size,
      [`${prefixCls}-card`]: ['card', 'editable-card'].includes(type),
      [`${prefixCls}-editable-card`]: type === 'editable-card',
      [`${prefixCls}-centered`]: centered
    }, contextClassName, className, rootClassName, mergedClassNames.root, hashId, cssVarCls, rootCls),
    classNames: {
      ...mergedClassNames,
      popup: clsx(popupClassName, hashId, cssVarCls, rootCls, mergedClassNames.popup?.root)
    },
    styles: mergedStyles,
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    editable: editable,
    more: {
      icon: tabs?.more?.icon ?? tabs?.moreIcon ?? moreIcon ?? /*#__PURE__*/React.createElement(EllipsisOutlined, null),
      transitionName: `${rootPrefixCls}-slide-up`,
      ...more
    },
    prefixCls: prefixCls,
    animated: mergedAnimated,
    indicator: mergedIndicator,
    destroyOnHidden: destroyOnHidden ?? destroyInactiveTabPane,
    tabPosition: mergedPlacement
  });
});
const Tabs = InternalTabs;
Tabs.TabPane = TabPane;
if (process.env.NODE_ENV !== 'production') {
  Tabs.displayName = 'Tabs';
}
export default Tabs;