"use client";

import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import * as React from 'react';
import { useEvent } from '@rc-component/util';
import { clsx } from 'clsx';
import scrollIntoView from 'scroll-into-view-if-needed';
import getScroll from '../_util/getScroll';
import { useMergeSemantic } from '../_util/hooks';
import scrollTo from '../_util/scrollTo';
import { devUseWarning } from '../_util/warning';
import Affix from '../affix';
import { ConfigContext, useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import AnchorLink from './AnchorLink';
import AnchorContext from './context';
import useStyle from './style';
function getDefaultContainer() {
  return window;
}
function getOffsetTop(element, container) {
  if (!element.getClientRects().length) {
    return 0;
  }
  const rect = element.getBoundingClientRect();
  if (rect.width || rect.height) {
    if (container === window) {
      return rect.top - element.ownerDocument.documentElement.clientTop;
    }
    return rect.top - container.getBoundingClientRect().top;
  }
  return rect.top;
}
const sharpMatcherRegex = /#([\S ]+)$/;
const Anchor = props => {
  const {
    rootClassName,
    prefixCls: customPrefixCls,
    className,
    style,
    offsetTop,
    affix = true,
    showInkInFixed = false,
    children,
    items,
    direction: anchorDirection = 'vertical',
    bounds,
    targetOffset,
    onClick,
    onChange,
    getContainer,
    getCurrentAnchor,
    replace,
    classNames,
    styles
  } = props;
  // =================== Warning =====================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Anchor');
    warning.deprecated(!children, 'Anchor children', 'items');
    process.env.NODE_ENV !== "production" ? warning(!(anchorDirection === 'horizontal' && items?.some(n => 'children' in n)), 'usage', '`Anchor items#children` is not supported when `Anchor` direction is horizontal.') : void 0;
  }
  const [links, setLinks] = React.useState([]);
  const [activeLink, setActiveLink] = React.useState(null);
  const activeLinkRef = React.useRef(activeLink);
  const wrapperRef = React.useRef(null);
  const spanLinkNode = React.useRef(null);
  const animating = React.useRef(false);
  const scrollRequestId = React.useRef(null);
  const {
    direction,
    getPrefixCls,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('anchor');
  const {
    getTargetContainer
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('anchor', customPrefixCls);
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  const getCurrentContainer = getContainer ?? getTargetContainer ?? getDefaultContainer;
  const dependencyListItem = JSON.stringify(links);
  const registerLink = useEvent(link => {
    if (!links.includes(link)) {
      setLinks(prev => [].concat(_toConsumableArray(prev), [link]));
    }
  });
  const unregisterLink = useEvent(link => {
    if (links.includes(link)) {
      setLinks(prev => prev.filter(i => i !== link));
    }
  });
  const updateInk = () => {
    const linkNode = wrapperRef.current?.querySelector(`.${prefixCls}-link-title-active`);
    if (linkNode && spanLinkNode.current) {
      const {
        style: inkStyle
      } = spanLinkNode.current;
      const horizontalAnchor = anchorDirection === 'horizontal';
      inkStyle.top = horizontalAnchor ? '' : `${linkNode.offsetTop + linkNode.clientHeight / 2}px`;
      inkStyle.height = horizontalAnchor ? '' : `${linkNode.clientHeight}px`;
      inkStyle.left = horizontalAnchor ? `${linkNode.offsetLeft}px` : '';
      inkStyle.width = horizontalAnchor ? `${linkNode.clientWidth}px` : '';
      if (horizontalAnchor) {
        scrollIntoView(linkNode, {
          scrollMode: 'if-needed',
          block: 'nearest'
        });
      }
    }
  };
  const getInternalCurrentAnchor = (_links, _offsetTop = 0, _bounds = 5) => {
    const linkSections = [];
    const container = getCurrentContainer();
    _links.forEach(link => {
      const sharpLinkMatch = sharpMatcherRegex.exec(link?.toString());
      if (!sharpLinkMatch) {
        return;
      }
      const target = document.getElementById(sharpLinkMatch[1]);
      if (target) {
        const top = getOffsetTop(target, container);
        if (top <= _offsetTop + _bounds) {
          linkSections.push({
            link,
            top
          });
        }
      }
    });
    if (linkSections.length) {
      const maxSection = linkSections.reduce((prev, curr) => curr.top > prev.top ? curr : prev);
      return maxSection.link;
    }
    return '';
  };
  const setCurrentActiveLink = useEvent(link => {
    // FIXME: Seems a bug since this compare is not equals
    // `activeLinkRef` is parsed value which will always trigger `onChange` event.
    if (activeLinkRef.current === link) {
      return;
    }
    // https://github.com/ant-design/ant-design/issues/30584
    const newLink = typeof getCurrentAnchor === 'function' ? getCurrentAnchor(link) : link;
    setActiveLink(newLink);
    activeLinkRef.current = newLink;
    // onChange should respect the original link (which may caused by
    // window scroll or user click), not the new link
    onChange?.(link);
  });
  const handleScroll = React.useCallback(() => {
    if (animating.current) {
      return;
    }
    const currentActiveLink = getInternalCurrentAnchor(links, targetOffset !== undefined ? targetOffset : offsetTop || 0, bounds);
    setCurrentActiveLink(currentActiveLink);
  }, [links, targetOffset, offsetTop, bounds]);
  const handleScrollTo = React.useCallback(link => {
    const previousActiveLink = activeLinkRef.current;
    setCurrentActiveLink(link);
    const sharpLinkMatch = sharpMatcherRegex.exec(link);
    if (!sharpLinkMatch) {
      return;
    }
    const targetElement = document.getElementById(sharpLinkMatch[1]);
    if (!targetElement) {
      return;
    }
    if (animating.current) {
      if (previousActiveLink === link) {
        return;
      }
      scrollRequestId.current?.();
    }
    const container = getCurrentContainer();
    const scrollTop = getScroll(container);
    const eleOffsetTop = getOffsetTop(targetElement, container);
    let y = scrollTop + eleOffsetTop;
    y -= targetOffset !== undefined ? targetOffset : offsetTop || 0;
    animating.current = true;
    scrollRequestId.current = scrollTo(y, {
      getContainer: getCurrentContainer,
      callback() {
        animating.current = false;
      }
    });
  }, [targetOffset, offsetTop]);
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    direction: anchorDirection
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const wrapperClass = clsx(hashId, cssVarCls, rootCls, rootClassName, `${prefixCls}-wrapper`, {
    [`${prefixCls}-wrapper-horizontal`]: anchorDirection === 'horizontal',
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, className, contextClassName, mergedClassNames.root);
  const anchorClass = clsx(prefixCls, {
    [`${prefixCls}-fixed`]: !affix && !showInkInFixed
  });
  const inkClass = clsx(`${prefixCls}-ink`, mergedClassNames.indicator, {
    [`${prefixCls}-ink-visible`]: activeLink
  });
  const wrapperStyle = {
    maxHeight: offsetTop ? `calc(100vh - ${offsetTop}px)` : '100vh',
    ...mergedStyles.root,
    ...contextStyle,
    ...style
  };
  const createNestedLink = options => Array.isArray(options) ? options.map(item => (/*#__PURE__*/React.createElement(AnchorLink, {
    replace: replace,
    ...item,
    key: item.key
  }, anchorDirection === 'vertical' && createNestedLink(item.children)))) : null;
  const anchorContent = /*#__PURE__*/React.createElement("div", {
    ref: wrapperRef,
    className: wrapperClass,
    style: wrapperStyle
  }, /*#__PURE__*/React.createElement("div", {
    className: anchorClass
  }, /*#__PURE__*/React.createElement("span", {
    className: inkClass,
    ref: spanLinkNode,
    style: mergedStyles.indicator
  }), 'items' in props ? createNestedLink(items) : children));
  React.useEffect(() => {
    const scrollContainer = getCurrentContainer();
    handleScroll();
    scrollContainer?.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer?.removeEventListener('scroll', handleScroll);
    };
  }, [dependencyListItem]);
  React.useEffect(() => {
    if (typeof getCurrentAnchor === 'function') {
      setCurrentActiveLink(getCurrentAnchor(activeLinkRef.current || ''));
    }
  }, [getCurrentAnchor]);
  React.useEffect(() => {
    updateInk();
  }, [anchorDirection, getCurrentAnchor, dependencyListItem, activeLink]);
  const memoizedContextValue = React.useMemo(() => ({
    registerLink,
    unregisterLink,
    scrollTo: handleScrollTo,
    activeLink,
    onClick,
    direction: anchorDirection,
    classNames: mergedClassNames,
    styles: mergedStyles
  }), [activeLink, onClick, handleScrollTo, anchorDirection, mergedStyles, mergedClassNames]);
  const affixProps = affix && typeof affix === 'object' ? affix : undefined;
  return /*#__PURE__*/React.createElement(AnchorContext.Provider, {
    value: memoizedContextValue
  }, affix ? (/*#__PURE__*/React.createElement(Affix, {
    offsetTop: offsetTop,
    target: getCurrentContainer,
    ...affixProps
  }, anchorContent)) : anchorContent);
};
if (process.env.NODE_ENV !== 'production') {
  Anchor.displayName = 'Anchor';
}
export default Anchor;