import * as React from 'react';
import { RawList } from "./List";
const List = /*#__PURE__*/React.forwardRef((props, ref) => RawList({
  ...props,
  virtual: false
}, ref));
List.displayName = 'List';
export default List;