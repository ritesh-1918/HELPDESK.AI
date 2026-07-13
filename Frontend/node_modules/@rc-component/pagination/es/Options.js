import KEYCODE from "@rc-component/util/es/KeyCode";
import React from 'react';
const defaultPageSizeOptions = [10, 20, 50, 100];
const Options = props => {
  const {
    pageSizeOptions = defaultPageSizeOptions,
    locale,
    changeSize,
    pageSize,
    goButton,
    quickGo,
    rootPrefixCls,
    disabled,
    buildOptionText,
    showSizeChanger,
    sizeChangerRender
  } = props;
  const [goInputText, setGoInputText] = React.useState('');
  const getValidValue = React.useMemo(() => {
    return !goInputText || Number.isNaN(goInputText) ? undefined : Number(goInputText);
  }, [goInputText]);
  const mergeBuildOptionText = typeof buildOptionText === 'function' ? buildOptionText : value => `${value} ${locale.items_per_page}`;
  const handleChange = e => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setGoInputText(value);
    }
  };
  const handleBlur = e => {
    if (goButton || goInputText === '') {
      return;
    }
    setGoInputText('');
    if (e.relatedTarget && (e.relatedTarget.className.includes(`${rootPrefixCls}-item-link`) || e.relatedTarget.className.includes(`${rootPrefixCls}-item`))) {
      return;
    }
    quickGo?.(getValidValue);
  };
  const go = e => {
    if (goInputText === '') {
      return;
    }
    if (e.keyCode === KEYCODE.ENTER || e.type === 'click') {
      setGoInputText('');
      quickGo?.(getValidValue);
    }
  };
  const getPageSizeOptions = () => {
    if (pageSizeOptions.some(option => option.toString() === pageSize.toString())) {
      return pageSizeOptions;
    }
    return pageSizeOptions.concat([pageSize]).sort((a, b) => {
      const numberA = Number.isNaN(Number(a)) ? 0 : Number(a);
      const numberB = Number.isNaN(Number(b)) ? 0 : Number(b);
      return numberA - numberB;
    });
  };
  // ============== cls ==============
  const prefixCls = `${rootPrefixCls}-options`;

  // ============== render ==============

  if (!showSizeChanger && !quickGo) {
    return null;
  }
  let changeSelect = null;
  let goInput = null;
  let gotoButton = null;

  // >>>>> Size Changer
  if (showSizeChanger && sizeChangerRender) {
    changeSelect = sizeChangerRender({
      disabled,
      size: pageSize,
      onSizeChange: nextValue => {
        changeSize?.(Number(nextValue));
      },
      'aria-label': locale.page_size,
      className: `${prefixCls}-size-changer`,
      options: getPageSizeOptions().map(opt => ({
        label: mergeBuildOptionText(opt),
        value: opt
      }))
    });
  }

  // >>>>> Quick Go
  if (quickGo) {
    if (goButton) {
      gotoButton = typeof goButton === 'boolean' ? /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: go,
        onKeyUp: go,
        disabled: disabled,
        className: `${prefixCls}-quick-jumper-button`
      }, locale.jump_to_confirm) : /*#__PURE__*/React.createElement("span", {
        onClick: go,
        onKeyUp: go
      }, goButton);
    }
    goInput = /*#__PURE__*/React.createElement("div", {
      className: `${prefixCls}-quick-jumper`
    }, locale.jump_to, /*#__PURE__*/React.createElement("input", {
      disabled: disabled,
      type: "text",
      value: goInputText,
      onChange: handleChange,
      onKeyUp: go,
      onBlur: handleBlur,
      "aria-label": locale.page
    }), locale.page, gotoButton);
  }
  return /*#__PURE__*/React.createElement("li", {
    className: prefixCls
  }, changeSelect, goInput);
};
if (process.env.NODE_ENV !== 'production') {
  Options.displayName = 'Options';
}
export default Options;