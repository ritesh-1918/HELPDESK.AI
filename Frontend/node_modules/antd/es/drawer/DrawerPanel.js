"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { pickClosable, useClosable, useMergeSemantic } from '../_util/hooks';
import { useComponentConfig } from '../config-provider/context';
import Skeleton from '../skeleton';
const DrawerPanel = props => {
  const {
    prefixCls,
    ariaId,
    title,
    footer,
    extra,
    closable,
    loading,
    onClose,
    headerStyle,
    bodyStyle,
    footerStyle,
    children,
    classNames: drawerClassNames,
    styles: drawerStyles
  } = props;
  const drawerContext = useComponentConfig('drawer');
  const {
    classNames: contextClassNames,
    styles: contextStyles,
    closable: contextClosable
  } = drawerContext;
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, drawerClassNames], [contextStyles, drawerStyles], {
    props: {
      ...props,
      closable: closable ?? contextClosable
    }
  });
  const closablePlacement = React.useMemo(() => {
    const merged = closable ?? contextClosable;
    if (merged === false) {
      return undefined;
    }
    if (typeof merged === 'object' && merged?.placement === 'end') {
      return 'end';
    }
    return 'start';
  }, [closable, contextClosable]);
  const customCloseIconRender = React.useCallback(icon => (/*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: clsx(`${prefixCls}-close`, {
      [`${prefixCls}-close-${closablePlacement}`]: closablePlacement === 'end'
    }, mergedClassNames.close),
    style: mergedStyles.close
  }, icon)), [onClose, prefixCls, closablePlacement, mergedClassNames.close, mergedStyles.close]);
  const [mergedClosable, mergedCloseIcon] = useClosable(pickClosable(props), pickClosable(drawerContext), {
    closable: true,
    closeIconRender: customCloseIconRender
  });
  const renderHeader = () => {
    if (!title && !mergedClosable) {
      return null;
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        ...mergedStyles.header,
        ...headerStyle
      },
      className: clsx(`${prefixCls}-header`, mergedClassNames.header, {
        [`${prefixCls}-header-close-only`]: mergedClosable && !title && !extra
      })
    }, /*#__PURE__*/React.createElement("div", {
      className: `${prefixCls}-header-title`
    }, closablePlacement === 'start' && mergedCloseIcon, title && (/*#__PURE__*/React.createElement("div", {
      className: clsx(`${prefixCls}-title`, mergedClassNames.title),
      style: mergedStyles.title,
      id: ariaId
    }, title))), extra && (/*#__PURE__*/React.createElement("div", {
      className: clsx(`${prefixCls}-extra`, mergedClassNames.extra),
      style: mergedStyles.extra
    }, extra)), closablePlacement === 'end' && mergedCloseIcon);
  };
  const renderFooter = () => {
    if (!footer) {
      return null;
    }
    return /*#__PURE__*/React.createElement("div", {
      className: clsx(`${prefixCls}-footer`, mergedClassNames.footer),
      style: {
        ...mergedStyles.footer,
        ...footerStyle
      }
    }, footer);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, renderHeader(), /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-body`, mergedClassNames.body),
    style: {
      ...mergedStyles.body,
      ...bodyStyle
    }
  }, loading ? (/*#__PURE__*/React.createElement(Skeleton, {
    active: true,
    title: false,
    paragraph: {
      rows: 5
    },
    className: `${prefixCls}-body-skeleton`
  })) : children), renderFooter());
};
export default DrawerPanel;