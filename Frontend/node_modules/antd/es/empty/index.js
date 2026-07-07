"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import { useLocale } from '../locale';
import DefaultEmptyImg from './empty';
import SimpleEmptyImg from './simple';
import useStyle from './style';
const defaultEmptyImg = /*#__PURE__*/React.createElement(DefaultEmptyImg, null);
const simpleEmptyImg = /*#__PURE__*/React.createElement(SimpleEmptyImg, null);
const Empty = props => {
  const {
    className,
    rootClassName,
    prefixCls: customizePrefixCls,
    image,
    description,
    children,
    imageStyle,
    style,
    classNames,
    styles,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    image: contextImage
  } = useComponentConfig('empty');
  const prefixCls = getPrefixCls('empty', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props
  });
  const [locale] = useLocale('Empty');
  const des = typeof description !== 'undefined' ? description : locale?.description;
  const alt = typeof des === 'string' ? des : 'empty';
  const mergedImage = image ?? contextImage ?? defaultEmptyImg;
  let imageNode = null;
  if (typeof mergedImage === 'string') {
    imageNode = /*#__PURE__*/React.createElement("img", {
      draggable: false,
      alt: alt,
      src: mergedImage
    });
  } else {
    imageNode = mergedImage;
  }
  // ============================= Warning ==============================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Empty');
    [['imageStyle', 'styles.image']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: clsx(hashId, cssVarCls, prefixCls, contextClassName, {
      [`${prefixCls}-normal`]: mergedImage === simpleEmptyImg,
      [`${prefixCls}-rtl`]: direction === 'rtl'
    }, className, rootClassName, mergedClassNames.root),
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    ...restProps
  }, /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-image`, mergedClassNames.image),
    style: {
      ...imageStyle,
      ...mergedStyles.image
    }
  }, imageNode), des && (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-description`, mergedClassNames.description),
    style: mergedStyles.description
  }, des)), children && (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-footer`, mergedClassNames.footer),
    style: mergedStyles.footer
  }, children)));
};
Empty.PRESENTED_IMAGE_DEFAULT = defaultEmptyImg;
Empty.PRESENTED_IMAGE_SIMPLE = simpleEmptyImg;
if (process.env.NODE_ENV !== 'production') {
  Empty.displayName = 'Empty';
}
export default Empty;