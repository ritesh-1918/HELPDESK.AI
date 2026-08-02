"use client";

import * as React from 'react';
import CheckOutlined from "@ant-design/icons/es/icons/CheckOutlined";
import CloseOutlined from "@ant-design/icons/es/icons/CloseOutlined";
import RcSteps from '@rc-component/steps';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import Wave from '../_util/wave';
import { TARGET_CLS } from '../_util/wave/interface';
import { useComponentConfig } from '../config-provider/context';
import useSize from '../config-provider/hooks/useSize';
import useBreakpoint from '../grid/hooks/useBreakpoint';
import { genCssVar } from '../theme/util/genStyleUtils';
import Tooltip from '../tooltip';
import { InternalContext } from './context';
import PanelArrow from './PanelArrow';
import ProgressIcon from './ProgressIcon';
import useStyle from './style';
const waveEffectClassNames = {
  itemIcon: TARGET_CLS
};
const Steps = props => {
  const {
    // Style
    size,
    className,
    rootClassName,
    style,
    variant = 'filled',
    type,
    classNames,
    styles,
    // Layout
    direction,
    orientation,
    responsive = true,
    progressDot,
    labelPlacement,
    titlePlacement,
    ellipsis,
    offset = 0,
    // Data
    items,
    percent,
    current = 0,
    onChange,
    // Render
    iconRender,
    // MISC
    ...restProps
  } = props;
  const internalContent = React.useContext(InternalContext);
  const contextContent = useComponentConfig('steps');
  const {
    getPrefixCls,
    direction: rtlDirection,
    className: contextClassName,
    style: contextStyle
  } = contextContent;
  let contextClassNames;
  let contextStyles;
  let components = {};
  if (internalContent) {
    components = {
      root: internalContent.rootComponent,
      item: internalContent.itemComponent
    };
  } else {
    ({
      classNames: contextClassNames,
      styles: contextStyles
    } = contextContent);
  }
  const rootPrefixCls = getPrefixCls();
  const prefixCls = getPrefixCls('steps', props.prefixCls);
  const itemIconCls = `${prefixCls}-item-icon`;
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const [varName] = genCssVar(rootPrefixCls, 'cmp-steps');
  // ============================= Size =============================
  const mergedSize = useSize(size);
  // ============================= Item =============================
  const mergedItems = React.useMemo(() => (items || []).filter(Boolean), [items]);
  // ============================ Layout ============================
  const {
    xs
  } = useBreakpoint(responsive);
  // Type
  const mergedType = React.useMemo(() => {
    if (type && type !== 'default') {
      return type;
    }
    if (progressDot) {
      return 'dot';
    }
    return type;
  }, [progressDot, type]);
  const isInline = mergedType === 'inline';
  const isDot = mergedType === 'dot' || mergedType === 'inline';
  // Progress Dot Render function
  const legacyProgressDotRender = React.useMemo(() => {
    return mergedType === 'dot' && typeof progressDot === 'function' ? progressDot : undefined;
  }, [mergedType, progressDot]);
  const mergedOrientation = React.useMemo(() => {
    const nextOrientation = orientation || direction;
    if (mergedType === 'panel') {
      return 'horizontal';
    }
    return responsive && xs || nextOrientation === 'vertical' ? 'vertical' : 'horizontal';
  }, [orientation, direction, mergedType, responsive, xs]);
  const mergedTitlePlacement = React.useMemo(() => {
    if (isDot || mergedOrientation === 'vertical') {
      return mergedOrientation === 'vertical' ? 'horizontal' : 'vertical';
    }
    if (type === 'navigation') {
      return 'horizontal';
    }
    return titlePlacement || labelPlacement || 'horizontal';
  }, [isDot, labelPlacement, mergedOrientation, titlePlacement, type]);
  // ========================== Percentage ==========================
  const mergedPercent = isInline ? undefined : percent;
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    variant,
    size: mergedSize,
    type: mergedType,
    orientation: mergedOrientation,
    titlePlacement: mergedTitlePlacement,
    current,
    percent: mergedPercent,
    responsive,
    offset
  };
  // ============================ Styles ============================
  const [mergedClassNames, mergedStyles] = useMergeSemantic([waveEffectClassNames, contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ============================= Icon =============================
  const internalIconRender = (_, info) => {
    const {
      item,
      index,
      active,
      components: {
        Icon: StepIcon
      }
    } = info;
    const {
      status,
      icon
    } = item;
    let iconContent = null;
    if (isDot || icon) {
      iconContent = icon;
    } else {
      switch (status) {
        case 'finish':
          iconContent = /*#__PURE__*/React.createElement(CheckOutlined, {
            className: `${itemIconCls}-finish`
          });
          break;
        case 'error':
          iconContent = /*#__PURE__*/React.createElement(CloseOutlined, {
            className: `${itemIconCls}-error`
          });
          break;
        default:
          {
            let numNode = /*#__PURE__*/React.createElement("span", {
              className: `${itemIconCls}-number`
            }, info.index + 1);
            if (status === 'process' && mergedPercent !== undefined) {
              numNode = /*#__PURE__*/React.createElement(ProgressIcon, {
                prefixCls: prefixCls,
                rootPrefixCls: rootPrefixCls,
                percent: mergedPercent
              }, numNode);
            }
            iconContent = numNode;
          }
      }
    }
    let iconNode = /*#__PURE__*/React.createElement(StepIcon, null, iconContent);
    // Custom Render Props
    if (iconRender) {
      iconNode = iconRender(iconNode, {
        index,
        active,
        item,
        components: {
          Icon: StepIcon
        }
      });
    } else if (typeof legacyProgressDotRender === 'function') {
      iconNode = legacyProgressDotRender(iconNode, {
        index,
        ...item
      });
    }
    return iconNode;
  };
  // ============================ Custom ============================
  const itemRender = (itemNode, itemInfo) => {
    let content = itemNode;
    if (isInline && itemInfo.item.content) {
      content = /*#__PURE__*/React.createElement(Tooltip, {
        destroyOnHidden: true,
        title: itemInfo.item.content
      }, itemNode);
    }
    return /*#__PURE__*/React.createElement(Wave, {
      component: "Steps",
      disabled: itemInfo.item.disabled || !onChange,
      colorSource: variant === 'filled' ? 'color' : null
    }, content);
  };
  const itemWrapperRender = mergedType === 'panel' ? itemNode => {
    return /*#__PURE__*/React.createElement(React.Fragment, null, itemNode, /*#__PURE__*/React.createElement(PanelArrow, {
      prefixCls: prefixCls
    }));
  } : undefined;
  // ============================ Styles ============================
  const mergedStyle = {
    [varName('items-offset')]: `${offset}`,
    ...contextStyle,
    ...style
  };
  const stepsClassName = clsx(contextClassName, `${prefixCls}-${variant}`, {
    [`${prefixCls}-${mergedType}`]: mergedType !== 'dot' ? mergedType : false,
    [`${prefixCls}-rtl`]: rtlDirection === 'rtl',
    [`${prefixCls}-dot`]: isDot,
    [`${prefixCls}-ellipsis`]: ellipsis,
    [`${prefixCls}-with-progress`]: mergedPercent !== undefined,
    [`${prefixCls}-${mergedSize}`]: mergedSize
  }, className, rootClassName, hashId, cssVarCls);
  // =========================== Warning ============================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Steps');
    warning.deprecated(!labelPlacement, 'labelPlacement', 'titlePlacement');
    warning.deprecated(!progressDot, 'progressDot', 'type="dot"');
    warning.deprecated(!direction, 'direction', 'orientation');
    warning.deprecated(mergedItems.every(item => !item.description), 'items.description', 'items.content');
  }
  // ============================ Render ============================
  return /*#__PURE__*/React.createElement(RcSteps, {
    ...restProps,
    // Style
    prefixCls: prefixCls,
    className: stepsClassName,
    style: mergedStyle,
    classNames: mergedClassNames,
    styles: mergedStyles,
    // Layout
    orientation: mergedOrientation,
    titlePlacement: mergedTitlePlacement,
    components: components,
    // Data
    current: current,
    items: mergedItems,
    onChange: onChange,
    // Render
    iconRender: internalIconRender,
    itemRender: itemRender,
    itemWrapperRender: itemWrapperRender
  });
};
if (process.env.NODE_ENV !== 'production') {
  Steps.displayName = 'Steps';
}
export default Steps;