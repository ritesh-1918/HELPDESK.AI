import Menu, { MenuItem } from '@rc-component/menu';
import React, { useEffect, useRef } from 'react';
import MentionsContext from "./MentionsContext";
/**
 * We only use Menu to display the candidate.
 * The focus is controlled by textarea to make accessibility easy.
 */
function DropdownMenu(props) {
  const {
    notFoundContent,
    activeIndex,
    setActiveIndex,
    selectOption,
    onFocus,
    onBlur,
    onScroll
  } = React.useContext(MentionsContext);
  const {
    prefixCls,
    options,
    opened
  } = props;
  const activeOption = options[activeIndex] || {};
  const menuRef = useRef(null);

  // Monitor the changes in ActiveIndex and scroll to the visible area if there are any changes
  useEffect(() => {
    if (activeIndex === -1 || !menuRef.current || !opened) {
      return;
    }
    const activeItem = menuRef.current?.findItem?.({
      key: activeOption.key
    });
    if (activeItem) {
      activeItem.scrollIntoView({
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [activeIndex, activeOption.key, opened]);
  return /*#__PURE__*/React.createElement(Menu, {
    ref: menuRef,
    prefixCls: `${prefixCls}-menu`,
    activeKey: activeOption.key,
    onSelect: ({
      key
    }) => {
      const option = options.find(({
        key: optionKey
      }) => optionKey === key);
      selectOption(option);
    },
    onFocus: onFocus,
    onBlur: onBlur,
    onScroll: onScroll
  }, options.map((option, index) => {
    const {
      key,
      disabled,
      className,
      style,
      label
    } = option;
    return /*#__PURE__*/React.createElement(MenuItem, {
      key: key,
      disabled: disabled,
      className: className,
      style: style,
      onMouseEnter: () => {
        setActiveIndex(index);
      }
    }, label);
  }), !options.length && /*#__PURE__*/React.createElement(MenuItem, {
    disabled: true
  }, notFoundContent));
}
export default DropdownMenu;