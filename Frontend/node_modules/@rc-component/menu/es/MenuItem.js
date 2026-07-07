function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import Overflow from '@rc-component/overflow';
import KeyCode from "@rc-component/util/es/KeyCode";
import omit from "@rc-component/util/es/omit";
import { useComposeRef } from "@rc-component/util/es/ref";
import warning from "@rc-component/util/es/warning";
import * as React from 'react';
import { useMenuId } from "./context/IdContext";
import { MenuContext } from "./context/MenuContext";
import { useFullPath, useMeasure } from "./context/PathContext";
import PrivateContext from "./context/PrivateContext";
import useActive from "./hooks/useActive";
import useDirectionStyle from "./hooks/useDirectionStyle";
import Icon from "./Icon";
import { warnItemProp } from "./utils/warnUtil";
// Since Menu event provide the `info.item` which point to the MenuItem node instance.
// We have to use class component here.
// This should be removed from doc & api in future.
class LegacyMenuItem extends React.Component {
  render() {
    const {
      title,
      attribute,
      elementRef,
      ...restProps
    } = this.props;

    // Here the props are eventually passed to the DOM element.
    // React does not recognize non-standard attributes.
    // Therefore, remove the props that is not used here.
    // ref: https://github.com/ant-design/ant-design/issues/41395
    const passedProps = omit(restProps, ['eventKey', 'popupClassName', 'popupOffset', 'onTitleClick']);
    warning(!attribute, '`attribute` of Menu.Item is deprecated. Please pass attribute directly.');
    return /*#__PURE__*/React.createElement(Overflow.Item, _extends({}, attribute, {
      title: typeof title === 'string' ? title : undefined
    }, passedProps, {
      ref: elementRef
    }));
  }
}

/**
 * Real Menu Item component
 */
const InternalMenuItem = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    style,
    className,
    eventKey,
    warnKey,
    disabled,
    itemIcon,
    children,
    // Aria
    role,
    // Active
    onMouseEnter,
    onMouseLeave,
    onClick,
    onKeyDown,
    onFocus,
    ...restProps
  } = props;
  const domDataId = useMenuId(eventKey);
  const {
    prefixCls,
    onItemClick,
    disabled: contextDisabled,
    overflowDisabled,
    // Icon
    itemIcon: contextItemIcon,
    // Select
    selectedKeys,
    // Active
    onActive
  } = React.useContext(MenuContext);
  const {
    _internalRenderMenuItem
  } = React.useContext(PrivateContext);
  const itemCls = `${prefixCls}-item`;
  const legacyMenuItemRef = React.useRef();
  const elementRef = React.useRef();
  const mergedDisabled = contextDisabled || disabled;
  const mergedEleRef = useComposeRef(ref, elementRef);
  const connectedKeys = useFullPath(eventKey);

  // ================================ Warn ================================
  if (process.env.NODE_ENV !== 'production' && warnKey) {
    warning(false, 'MenuItem should not leave undefined `key`.');
  }

  // ============================= Info =============================
  const getEventInfo = e => {
    return {
      key: eventKey,
      // Note: For legacy code is reversed which not like other antd component
      keyPath: [...connectedKeys].reverse(),
      item: legacyMenuItemRef.current,
      domEvent: e
    };
  };

  // ============================= Icon =============================
  const mergedItemIcon = itemIcon || contextItemIcon;

  // ============================ Active ============================
  const {
    active,
    ...activeProps
  } = useActive(eventKey, mergedDisabled, onMouseEnter, onMouseLeave);

  // ============================ Select ============================
  const selected = selectedKeys.includes(eventKey);

  // ======================== DirectionStyle ========================
  const directionStyle = useDirectionStyle(connectedKeys.length);

  // ============================ Events ============================
  const onInternalClick = e => {
    if (mergedDisabled) {
      return;
    }
    const info = getEventInfo(e);
    onClick?.(warnItemProp(info));
    onItemClick(info);
  };
  const onInternalKeyDown = e => {
    onKeyDown?.(e);
    if (e.which === KeyCode.ENTER) {
      const info = getEventInfo(e);

      // Legacy. Key will also trigger click event
      onClick?.(warnItemProp(info));
      onItemClick(info);
    }
  };

  /**
   * Used for accessibility. Helper will focus element without key board.
   * We should manually trigger an active
   */
  const onInternalFocus = e => {
    onActive(eventKey);
    onFocus?.(e);
  };

  // ============================ Render ============================
  const optionRoleProps = {};
  if (props.role === 'option') {
    optionRoleProps['aria-selected'] = selected;
  }
  let renderNode = /*#__PURE__*/React.createElement(LegacyMenuItem, _extends({
    ref: legacyMenuItemRef,
    elementRef: mergedEleRef,
    role: role === null ? 'none' : role || 'menuitem',
    tabIndex: disabled ? null : -1,
    "data-menu-id": overflowDisabled && domDataId ? null : domDataId
  }, omit(restProps, ['extra']), activeProps, optionRoleProps, {
    component: "li",
    "aria-disabled": disabled,
    style: {
      ...directionStyle,
      ...style
    },
    className: clsx(itemCls, {
      [`${itemCls}-active`]: active,
      [`${itemCls}-selected`]: selected,
      [`${itemCls}-disabled`]: mergedDisabled
    }, className),
    onClick: onInternalClick,
    onKeyDown: onInternalKeyDown,
    onFocus: onInternalFocus
  }), children, /*#__PURE__*/React.createElement(Icon, {
    props: {
      ...props,
      isSelected: selected
    },
    icon: mergedItemIcon
  }));
  if (_internalRenderMenuItem) {
    renderNode = _internalRenderMenuItem(renderNode, props, {
      selected
    });
  }
  return renderNode;
});
function MenuItem(props, ref) {
  const {
    eventKey
  } = props;

  // ==================== Record KeyPath ====================
  const measure = useMeasure();
  const connectedKeyPath = useFullPath(eventKey);

  // eslint-disable-next-line consistent-return
  React.useEffect(() => {
    if (measure) {
      measure.registerPath(eventKey, connectedKeyPath);
      return () => {
        measure.unregisterPath(eventKey, connectedKeyPath);
      };
    }
  }, [connectedKeyPath]);
  if (measure) {
    return null;
  }

  // ======================== Render ========================
  return /*#__PURE__*/React.createElement(InternalMenuItem, _extends({}, props, {
    ref: ref
  }));
}
export default /*#__PURE__*/React.forwardRef(MenuItem);