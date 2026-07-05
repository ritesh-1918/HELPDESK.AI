"use client";

import * as React from 'react';
import { devUseWarning } from '../_util/warning';
import Base from './Base';
const TITLE_ELE_LIST = [1, 2, 3, 4, 5];
const Title = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    level = 1,
    children,
    ...restProps
  } = props;
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Typography.Title');
    process.env.NODE_ENV !== "production" ? warning(TITLE_ELE_LIST.includes(level), 'usage', 'Title only accept `1 | 2 | 3 | 4 | 5` as `level` value. And `5` need 4.6.0+ version.') : void 0;
  }
  const component = TITLE_ELE_LIST.includes(level) ? `h${level}` : `h1`;
  return /*#__PURE__*/React.createElement(Base, {
    ref: ref,
    ...restProps,
    component: component
  }, children);
});
export default Title;