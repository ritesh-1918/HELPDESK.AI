"use client";

import * as React from 'react';
import MinusOutlined from "@ant-design/icons/es/icons/MinusOutlined";
import PlusOutlined from "@ant-design/icons/es/icons/PlusOutlined";
import DownOutlined from "@ant-design/icons/es/icons/DownOutlined";
import UpOutlined from "@ant-design/icons/es/icons/UpOutlined";
import RcInputNumber from '@rc-component/input-number';
import { clsx } from 'clsx';
import ContextIsolator from '../_util/ContextIsolator';
import { useMergeSemantic } from '../_util/hooks';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import { devUseWarning } from '../_util/warning';
import ConfigProvider from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import DisabledContext from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import { FormItemInputContext } from '../form/context';
import useVariant from '../form/hooks/useVariants';
import SpaceAddon from '../space/Addon';
import Compact, { useCompactItemContext } from '../space/Compact';
import useStyle from './style';
const InternalInputNumber = /*#__PURE__*/React.forwardRef((props, ref) => {
  const inputRef = React.useRef(null);
  React.useImperativeHandle(ref, () => inputRef.current);
  const {
    rootClassName,
    size: customizeSize,
    disabled: customDisabled,
    prefixCls,
    addonBefore: _addonBefore,
    addonAfter: _addonAfter,
    prefix,
    suffix,
    bordered,
    readOnly,
    status,
    controls = true,
    variant: customVariant,
    className,
    style,
    classNames,
    styles,
    mode,
    ...others
  } = props;
  const {
    direction,
    className: contextClassName,
    style: contextStyle,
    styles: contextStyles,
    classNames: contextClassNames
  } = useComponentConfig('inputNumber');
  // ===================== Disabled =====================
  const disabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? disabled;
  // controls && !mergedDisabled && !readOnly;
  const mergedControls = React.useMemo(() => {
    if (!controls || mergedDisabled || readOnly) {
      return false;
    }
    return controls;
  }, [controls, mergedDisabled, readOnly]);
  const {
    compactSize,
    compactItemClassnames
  } = useCompactItemContext(prefixCls, direction);
  let upIcon = mode === 'spinner' ? /*#__PURE__*/React.createElement(PlusOutlined, null) : /*#__PURE__*/React.createElement(UpOutlined, null);
  let downIcon = mode === 'spinner' ? /*#__PURE__*/React.createElement(MinusOutlined, null) : /*#__PURE__*/React.createElement(DownOutlined, null);
  const controlsTemp = typeof mergedControls === 'boolean' ? mergedControls : undefined;
  if (typeof mergedControls === 'object') {
    upIcon = mergedControls.upIcon || upIcon;
    downIcon = mergedControls.downIcon || downIcon;
  }
  const {
    hasFeedback,
    isFormItemInput,
    feedbackIcon
  } = React.useContext(FormItemInputContext);
  const mergedSize = useSize(ctx => customizeSize ?? compactSize ?? ctx);
  const [variant, enableVariantCls] = useVariant('inputNumber', customVariant, bordered);
  const suffixNode = hasFeedback && /*#__PURE__*/React.createElement(React.Fragment, null, feedbackIcon);
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    size: mergedSize,
    disabled: mergedDisabled,
    controls: mergedControls
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  return /*#__PURE__*/React.createElement(RcInputNumber, {
    ref: inputRef,
    mode: mode,
    disabled: mergedDisabled,
    className: clsx(className, rootClassName, mergedClassNames.root, contextClassName, compactItemClassnames, getStatusClassNames(prefixCls, status, hasFeedback), {
      [`${prefixCls}-${variant}`]: enableVariantCls,
      [`${prefixCls}-lg`]: mergedSize === 'large',
      [`${prefixCls}-sm`]: mergedSize === 'small',
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-in-form-item`]: isFormItemInput,
      [`${prefixCls}-without-controls`]: !mergedControls
    }),
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    upHandler: upIcon,
    downHandler: downIcon,
    prefixCls: prefixCls,
    readOnly: readOnly,
    controls: controlsTemp,
    prefix: prefix,
    suffix: suffixNode || suffix,
    classNames: mergedClassNames,
    styles: mergedStyles,
    ...others
  });
});
// ===================================================================
// ==                          InputNumber                          ==
// ===================================================================
const InputNumber = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    addonBefore,
    addonAfter,
    prefixCls: customizePrefixCls,
    className,
    status: customStatus,
    rootClassName,
    ...rest
  } = props;
  const {
    getPrefixCls
  } = useComponentConfig('inputNumber');
  const prefixCls = getPrefixCls('input-number', customizePrefixCls);
  const {
    status: contextStatus
  } = React.useContext(FormItemInputContext);
  const mergedStatus = getMergedStatus(contextStatus, customStatus);
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  const hasLegacyAddon = addonBefore || addonAfter;
  // ======================= Warn =======================
  if (process.env.NODE_ENV !== 'production') {
    const typeWarning = devUseWarning('InputNumber');
    [['bordered', 'variant'], ['addonAfter', 'Space.Compact'], ['addonBefore', 'Space.Compact']].forEach(([prop, newProp]) => {
      typeWarning.deprecated(!(prop in props), prop, newProp);
    });
    typeWarning(!(props.type === 'number' && props.changeOnWheel), 'usage', 'When `type=number` is used together with `changeOnWheel`, changeOnWheel may not work properly. Please delete `type=number` if it is not necessary.');
  }
  // ====================== Render ======================
  const inputNumberNode = /*#__PURE__*/React.createElement(InternalInputNumber, {
    ref: ref,
    ...rest,
    prefixCls: prefixCls,
    status: mergedStatus,
    className: clsx(cssVarCls, rootCls, hashId, className),
    rootClassName: !hasLegacyAddon ? rootClassName : undefined
  });
  if (hasLegacyAddon) {
    const renderAddon = node => {
      if (!node) {
        return null;
      }
      return /*#__PURE__*/React.createElement(SpaceAddon, {
        className: clsx(`${prefixCls}-addon`, cssVarCls, hashId),
        variant: props.variant,
        disabled: props.disabled,
        status: mergedStatus
      }, /*#__PURE__*/React.createElement(ContextIsolator, {
        form: true
      }, node));
    };
    const addonBeforeNode = renderAddon(addonBefore);
    const addonAfterNode = renderAddon(addonAfter);
    return /*#__PURE__*/React.createElement(Compact, {
      rootClassName: rootClassName
    }, addonBeforeNode, inputNumberNode, addonAfterNode);
  }
  return inputNumberNode;
});
const TypedInputNumber = InputNumber;
/** @private Internal Component. Do not use in your production. */
const PureInputNumber = props => (/*#__PURE__*/React.createElement(ConfigProvider, {
  theme: {
    components: {
      InputNumber: {
        handleVisible: true
      }
    }
  }
}, /*#__PURE__*/React.createElement(InputNumber, {
  ...props
})));
if (process.env.NODE_ENV !== 'production') {
  InternalInputNumber.displayName = 'InternalInputNumber';
  TypedInputNumber.displayName = 'InputNumber';
}
TypedInputNumber._InternalPanelDoNotUseOrYouWillBeFired = PureInputNumber;
export default TypedInputNumber;