"use client";

import * as React from 'react';
import DoubleLeftOutlined from "@ant-design/icons/es/icons/DoubleLeftOutlined";
import DoubleRightOutlined from "@ant-design/icons/es/icons/DoubleRightOutlined";
import LeftOutlined from "@ant-design/icons/es/icons/LeftOutlined";
import RightOutlined from "@ant-design/icons/es/icons/RightOutlined";
import RcPagination from '@rc-component/pagination';
import enUS from "@rc-component/pagination/es/locale/en_US";
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import useSize from '../config-provider/hooks/useSize';
import useBreakpoint from '../grid/hooks/useBreakpoint';
import { useLocale } from '../locale';
import Select from '../select';
import { useToken } from '../theme/internal';
import useStyle from './style';
import BorderedStyle from './style/bordered';
import useShowSizeChanger from './useShowSizeChanger';
const Pagination = props => {
  const {
    align,
    prefixCls: customizePrefixCls,
    selectPrefixCls: customizeSelectPrefixCls,
    className,
    rootClassName,
    style,
    size: customizeSize,
    locale: customLocale,
    responsive,
    showSizeChanger,
    selectComponentClass,
    pageSizeOptions,
    styles,
    classNames,
    ...restProps
  } = props;
  const {
    xs
  } = useBreakpoint(responsive);
  const [, token] = useToken();
  const {
    getPrefixCls,
    direction,
    showSizeChanger: contextShowSizeChangerConfig,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    totalBoundaryShowSizeChanger: contextTotalBoundaryShowSizeChanger
  } = useComponentConfig('pagination');
  const prefixCls = getPrefixCls('pagination', customizePrefixCls);
  // Style
  const [hashId, cssVarCls] = useStyle(prefixCls);
  // ============================== Size ==============================
  const mergedSize = useSize(customizeSize);
  const isSmall = mergedSize === 'small' || !!(xs && !mergedSize && responsive);
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    size: mergedSize
  };
  // ========================= Style ==========================
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ============================= Locale =============================
  const [contextLocale] = useLocale('Pagination', enUS);
  const locale = {
    ...contextLocale,
    ...customLocale
  };
  // ========================== Size Changer ==========================
  // Merge the props showSizeChanger
  const [propShowSizeChanger, propSizeChangerSelectProps] = useShowSizeChanger(showSizeChanger);
  const [contextShowSizeChanger, contextSizeChangerSelectProps] = useShowSizeChanger(contextShowSizeChangerConfig);
  const mergedShowSizeChanger = propShowSizeChanger ?? contextShowSizeChanger;
  const mergedShowSizeChangerSelectProps = propSizeChangerSelectProps ?? contextSizeChangerSelectProps;
  const SizeChanger = selectComponentClass || Select;
  // Generate options
  const mergedPageSizeOptions = React.useMemo(() => {
    return pageSizeOptions ? pageSizeOptions.map(option => Number(option)) : undefined;
  }, [pageSizeOptions]);
  // Render size changer
  const sizeChangerRender = info => {
    const {
      disabled,
      size: pageSize,
      onSizeChange,
      'aria-label': ariaLabel,
      className: sizeChangerClassName,
      options
    } = info;
    const {
      className: propSizeChangerClassName,
      onChange: propSizeChangerOnChange
    } = mergedShowSizeChangerSelectProps || {};
    // Origin Select is using Select.Option,
    // So it make the option value must be string
    // Just for compatible
    const selectedValue = options.find(option => String(option.value) === String(pageSize))?.value;
    return /*#__PURE__*/React.createElement(SizeChanger, {
      disabled: disabled,
      showSearch: true,
      popupMatchSelectWidth: false,
      getPopupContainer: triggerNode => triggerNode.parentNode,
      "aria-label": ariaLabel,
      options: options,
      ...mergedShowSizeChangerSelectProps,
      value: selectedValue,
      onChange: (nextSize, option) => {
        onSizeChange?.(nextSize);
        propSizeChangerOnChange?.(nextSize, option);
      },
      size: mergedSize,
      className: clsx(sizeChangerClassName, propSizeChangerClassName)
    });
  };
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Pagination');
    process.env.NODE_ENV !== "production" ? warning(!selectComponentClass, 'usage', '`selectComponentClass` is not official api which will be removed.') : void 0;
  }
  // ============================= Render =============================
  const iconsProps = React.useMemo(() => {
    const ellipsis = /*#__PURE__*/React.createElement("span", {
      className: `${prefixCls}-item-ellipsis`
    }, "\u2022\u2022\u2022");
    const prevIcon = /*#__PURE__*/React.createElement("button", {
      className: `${prefixCls}-item-link`,
      type: "button",
      tabIndex: -1
    }, direction === 'rtl' ? /*#__PURE__*/React.createElement(RightOutlined, null) : /*#__PURE__*/React.createElement(LeftOutlined, null));
    const nextIcon = /*#__PURE__*/React.createElement("button", {
      className: `${prefixCls}-item-link`,
      type: "button",
      tabIndex: -1
    }, direction === 'rtl' ? /*#__PURE__*/React.createElement(LeftOutlined, null) : /*#__PURE__*/React.createElement(RightOutlined, null));
    const jumpPrevIcon =
    /*#__PURE__*/
    // biome-ignore lint/a11y/useValidAnchor: it is hard to refactor
    React.createElement("a", {
      className: `${prefixCls}-item-link`
    }, /*#__PURE__*/React.createElement("div", {
      className: `${prefixCls}-item-container`
    }, direction === 'rtl' ? (/*#__PURE__*/React.createElement(DoubleRightOutlined, {
      className: `${prefixCls}-item-link-icon`
    })) : (/*#__PURE__*/React.createElement(DoubleLeftOutlined, {
      className: `${prefixCls}-item-link-icon`
    })), ellipsis));
    const jumpNextIcon =
    /*#__PURE__*/
    // biome-ignore lint/a11y/useValidAnchor: it is hard to refactor
    React.createElement("a", {
      className: `${prefixCls}-item-link`
    }, /*#__PURE__*/React.createElement("div", {
      className: `${prefixCls}-item-container`
    }, direction === 'rtl' ? (/*#__PURE__*/React.createElement(DoubleLeftOutlined, {
      className: `${prefixCls}-item-link-icon`
    })) : (/*#__PURE__*/React.createElement(DoubleRightOutlined, {
      className: `${prefixCls}-item-link-icon`
    })), ellipsis));
    return {
      prevIcon,
      nextIcon,
      jumpPrevIcon,
      jumpNextIcon
    };
  }, [direction, prefixCls]);
  const selectPrefixCls = getPrefixCls('select', customizeSelectPrefixCls);
  const extendedClassName = clsx({
    [`${prefixCls}-${align}`]: !!align,
    [`${prefixCls}-${mergedSize}`]: mergedSize,
    /** @deprecated Should be removed in v7 */
    [`${prefixCls}-mini`]: isSmall,
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-bordered`]: token.wireframe
  }, contextClassName, className, rootClassName, mergedClassNames.root, hashId, cssVarCls);
  const mergedStyle = {
    ...mergedStyles.root,
    ...contextStyle,
    ...style
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, token.wireframe && /*#__PURE__*/React.createElement(BorderedStyle, {
    prefixCls: prefixCls
  }), /*#__PURE__*/React.createElement(RcPagination, {
    ...iconsProps,
    ...restProps,
    styles: mergedStyles,
    classNames: mergedClassNames,
    style: mergedStyle,
    prefixCls: prefixCls,
    selectPrefixCls: selectPrefixCls,
    className: extendedClassName,
    locale: locale,
    pageSizeOptions: mergedPageSizeOptions,
    showSizeChanger: mergedShowSizeChanger,
    totalBoundaryShowSizeChanger: restProps.totalBoundaryShowSizeChanger ?? contextTotalBoundaryShowSizeChanger,
    sizeChangerRender: sizeChangerRender
  }));
};
if (process.env.NODE_ENV !== 'production') {
  Pagination.displayName = 'Pagination';
}
export default Pagination;