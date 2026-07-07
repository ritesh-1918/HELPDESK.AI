"use client";

import * as React from 'react';
import { useControlledState } from '@rc-component/util';
import ConfigProvider, { ConfigContext } from '../config-provider';
export function withPureRenderTheme(Component) {
  return props => (/*#__PURE__*/React.createElement(ConfigProvider, {
    theme: {
      token: {
        motion: false,
        zIndexPopupBase: 0
      }
    }
  }, /*#__PURE__*/React.createElement(Component, {
    ...props
  })));
}
/* istanbul ignore next */
const genPurePanel = (Component, alignPropName, postProps, defaultPrefixCls, getDropdownCls) => {
  const PurePanel = props => {
    const {
      prefixCls: customizePrefixCls,
      style
    } = props;
    const holderRef = React.useRef(null);
    const [popupHeight, setPopupHeight] = React.useState(0);
    const [popupWidth, setPopupWidth] = React.useState(0);
    const [open, setOpen] = useControlledState(false, props.open);
    const {
      getPrefixCls
    } = React.useContext(ConfigContext);
    const prefixCls = getPrefixCls(defaultPrefixCls || 'select', customizePrefixCls);
    React.useEffect(() => {
      // We do not care about ssr
      setOpen(true);
      if (typeof ResizeObserver !== 'undefined') {
        const resizeObserver = new ResizeObserver(entries => {
          const element = entries[0].target;
          setPopupHeight(element.offsetHeight + 8);
          setPopupWidth(element.offsetWidth);
        });
        const interval = setInterval(() => {
          const dropdownCls = getDropdownCls ? `.${getDropdownCls(prefixCls)}` : `.${prefixCls}-dropdown`;
          const popup = holderRef.current?.querySelector(dropdownCls);
          if (popup) {
            clearInterval(interval);
            resizeObserver.observe(popup);
          }
        }, 10);
        return () => {
          clearInterval(interval);
          resizeObserver.disconnect();
        };
      }
    }, [prefixCls]);
    let mergedProps = {
      ...props,
      style: {
        ...style,
        margin: 0
      },
      open,
      getPopupContainer: () => holderRef.current
    };
    if (postProps) {
      mergedProps = postProps(mergedProps);
    }
    if (alignPropName) {
      Object.assign(mergedProps, {
        [alignPropName]: {
          overflow: {
            adjustX: false,
            adjustY: false
          }
        }
      });
    }
    const mergedStyle = {
      paddingBottom: popupHeight,
      position: 'relative',
      minWidth: popupWidth
    };
    return /*#__PURE__*/React.createElement("div", {
      ref: holderRef,
      style: mergedStyle
    }, /*#__PURE__*/React.createElement(Component, {
      ...mergedProps
    }));
  };
  return withPureRenderTheme(PurePanel);
};
export default genPurePanel;