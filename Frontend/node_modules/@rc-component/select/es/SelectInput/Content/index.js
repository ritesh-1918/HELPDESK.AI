import * as React from 'react';
import pickAttrs from "@rc-component/util/es/pickAttrs";
import SingleContent from "./SingleContent";
import MultipleContent from "./MultipleContent";
import { useSelectInputContext } from "../context";
import useBaseProps from "../../hooks/useBaseProps";
const SelectContent = /*#__PURE__*/React.forwardRef(function SelectContent(_, ref) {
  const {
    multiple,
    onInputKeyDown,
    tabIndex
  } = useSelectInputContext();
  const baseProps = useBaseProps();
  const {
    showSearch
  } = baseProps;
  const ariaProps = pickAttrs(baseProps, {
    aria: true
  });
  const sharedInputProps = {
    ...ariaProps,
    onKeyDown: onInputKeyDown,
    readOnly: !showSearch,
    tabIndex
  };
  if (multiple) {
    return /*#__PURE__*/React.createElement(MultipleContent, {
      ref: ref,
      inputProps: sharedInputProps
    });
  }
  return /*#__PURE__*/React.createElement(SingleContent, {
    ref: ref,
    inputProps: sharedInputProps
  });
});
export default SelectContent;