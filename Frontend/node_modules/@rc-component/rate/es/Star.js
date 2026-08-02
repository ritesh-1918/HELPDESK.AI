import React from 'react';
import KeyCode from "@rc-component/util/es/KeyCode";
import { clsx } from 'clsx';
function Star(props, ref) {
  const {
    disabled,
    prefixCls,
    character,
    characterRender,
    index,
    count,
    value,
    allowHalf,
    focused,
    onHover,
    onClick
  } = props;

  // =========================== Events ===========================
  const onInternalHover = e => {
    onHover(e, index);
  };
  const onInternalClick = e => {
    onClick(e, index);
  };
  const onInternalKeyDown = e => {
    if (e.keyCode === KeyCode.ENTER) {
      onClick(e, index);
    }
  };

  // =========================== Render ===========================
  // >>>>> ClassName
  const starValue = index + 1;
  const classNameList = new Set([prefixCls]);

  // TODO: Current we just refactor from CC to FC. This logic seems can be optimized.
  if (value === 0 && index === 0 && focused) {
    classNameList.add(`${prefixCls}-focused`);
  } else if (allowHalf && value + 0.5 >= starValue && value < starValue) {
    classNameList.add(`${prefixCls}-half`);
    classNameList.add(`${prefixCls}-active`);
    if (focused) {
      classNameList.add(`${prefixCls}-focused`);
    }
  } else {
    if (starValue <= value) {
      classNameList.add(`${prefixCls}-full`);
    } else {
      classNameList.add(`${prefixCls}-zero`);
    }
    if (starValue === value && focused) {
      classNameList.add(`${prefixCls}-focused`);
    }
  }

  // >>>>> Node
  const characterNode = typeof character === 'function' ? character(props) : character;
  let start = /*#__PURE__*/React.createElement("li", {
    className: clsx(Array.from(classNameList)),
    ref: ref
  }, /*#__PURE__*/React.createElement("div", {
    onClick: disabled ? null : onInternalClick,
    onKeyDown: disabled ? null : onInternalKeyDown,
    onMouseMove: disabled ? null : onInternalHover,
    role: "radio",
    "aria-checked": value > index ? 'true' : 'false',
    "aria-posinset": index + 1,
    "aria-setsize": count,
    tabIndex: disabled ? -1 : 0
  }, /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-first`
  }, characterNode), /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-second`
  }, characterNode)));
  if (characterRender) {
    start = characterRender(start, props);
  }
  return start;
}
export default /*#__PURE__*/React.forwardRef(Star);