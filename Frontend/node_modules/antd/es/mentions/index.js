"use client";

import * as React from 'react';
import RcMentions from '@rc-component/mentions';
import { composeRef } from "@rc-component/util/es/ref";
import { clsx } from 'clsx';
import getAllowClear from '../_util/getAllowClear';
import { useMergeSemantic } from '../_util/hooks';
import genPurePanel from '../_util/PurePanel';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import toList from '../_util/toList';
import { devUseWarning } from '../_util/warning';
import { ConfigContext } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import DefaultRenderEmpty from '../config-provider/defaultRenderEmpty';
import DisabledContext from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import { FormItemInputContext } from '../form/context';
import useVariant from '../form/hooks/useVariants';
import Spin from '../spin';
import useStyle from './style';
export const {
  Option
} = RcMentions;
function loadingFilterOption() {
  return true;
}
const InternalMentions = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    disabled: customDisabled,
    loading,
    filterOption,
    children,
    notFoundContent,
    options,
    status: customStatus,
    allowClear = false,
    popupClassName,
    style,
    variant: customVariant,
    classNames,
    styles,
    size: customSize,
    ...restProps
  } = props;
  const [focused, setFocused] = React.useState(false);
  const innerRef = React.useRef(null);
  const mergedRef = composeRef(ref, innerRef);
  // ===================== Size =====================
  const mergedSize = useSize(ctx => customSize ?? ctx);
  // =================== Warning =====================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Mentions');
    warning.deprecated(!children, 'Mentions.Option', 'options');
  }
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('mentions');
  const {
    renderEmpty
  } = React.useContext(ConfigContext);
  const {
    status: contextStatus,
    hasFeedback,
    feedbackIcon
  } = React.useContext(FormItemInputContext);
  const mergedStatus = getMergedStatus(contextStatus, customStatus);
  // ===================== Disabled =====================
  const contextDisabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? contextDisabled;
  const prefixCls = getPrefixCls('mentions', customizePrefixCls);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    disabled: mergedDisabled,
    status: mergedStatus,
    loading,
    options,
    variant: customVariant
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const onFocus = (...args) => {
    if (restProps.onFocus) {
      restProps.onFocus.apply(restProps, args);
    }
    setFocused(true);
  };
  const onBlur = (...args) => {
    if (restProps.onBlur) {
      restProps.onBlur.apply(restProps, args);
    }
    setFocused(false);
  };
  const notFoundContentEle = React.useMemo(() => {
    if (notFoundContent !== undefined) {
      return notFoundContent;
    }
    return renderEmpty?.('Select') || /*#__PURE__*/React.createElement(DefaultRenderEmpty, {
      componentName: "Select"
    });
  }, [notFoundContent, renderEmpty]);
  const mentionOptions = React.useMemo(() => {
    if (loading) {
      return /*#__PURE__*/React.createElement(Option, {
        value: "ANTD_SEARCHING",
        disabled: true
      }, /*#__PURE__*/React.createElement(Spin, {
        size: "small"
      }));
    }
    return children;
  }, [loading, children]);
  const mergedOptions = loading ? [{
    value: 'ANTD_SEARCHING',
    disabled: true,
    label: /*#__PURE__*/React.createElement(Spin, {
      size: "small"
    })
  }] : options;
  const mentionsfilterOption = loading ? loadingFilterOption : filterOption;
  const mergedAllowClear = getAllowClear(allowClear);
  // Style
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  const [variant, enableVariantCls] = useVariant('mentions', customVariant);
  const suffixNode = hasFeedback && /*#__PURE__*/React.createElement(React.Fragment, null, feedbackIcon);
  const mergedClassName = clsx(contextClassName, className, rootClassName, cssVarCls, rootCls, mergedClassNames.root, {
    [`${prefixCls}-sm`]: mergedSize === 'small',
    [`${prefixCls}-lg`]: mergedSize === 'large'
  });
  return /*#__PURE__*/React.createElement(RcMentions, {
    silent: loading,
    prefixCls: prefixCls,
    notFoundContent: notFoundContentEle,
    className: mergedClassName,
    disabled: mergedDisabled,
    allowClear: mergedAllowClear,
    direction: direction,
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    ...restProps,
    filterOption: mentionsfilterOption,
    onFocus: onFocus,
    onBlur: onBlur,
    ref: mergedRef,
    options: mergedOptions,
    suffix: suffixNode,
    styles: {
      textarea: mergedStyles.textarea,
      popup: mergedStyles.popup,
      suffix: mergedStyles.suffix
    },
    classNames: {
      textarea: clsx(mergedClassNames.textarea),
      popup: clsx(mergedClassNames.popup, popupClassName, rootClassName, hashId, cssVarCls, rootCls),
      suffix: mergedClassNames.suffix,
      mentions: clsx({
        [`${prefixCls}-disabled`]: mergedDisabled,
        [`${prefixCls}-focused`]: focused,
        [`${prefixCls}-rtl`]: direction === 'rtl'
      }, hashId),
      variant: clsx({
        [`${prefixCls}-${variant}`]: enableVariantCls
      }, getStatusClassNames(prefixCls, mergedStatus)),
      affixWrapper: hashId
    }
  }, mentionOptions);
});
const Mentions = InternalMentions;
if (process.env.NODE_ENV !== 'production') {
  Mentions.displayName = 'Mentions';
}
Mentions.Option = Option;
// We don't care debug panel
/* istanbul ignore next */
const PurePanel = genPurePanel(Mentions, undefined, undefined, 'mentions');
Mentions._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
Mentions.getMentions = (value = '', config = {}) => {
  const {
    prefix = '@',
    split = ' '
  } = config;
  const prefixList = toList(prefix);
  return value.split(split).map((str = '') => {
    let hitPrefix = null;
    prefixList.some(prefixStr => {
      const startStr = str.slice(0, prefixStr.length);
      if (startStr === prefixStr) {
        hitPrefix = prefixStr;
        return true;
      }
      return false;
    });
    if (hitPrefix !== null) {
      return {
        prefix: hitPrefix,
        value: str.slice(hitPrefix.length)
      };
    }
    return null;
  }).filter(entity => !!entity && !!entity.value);
};
export default Mentions;