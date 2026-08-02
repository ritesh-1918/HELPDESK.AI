var _excluded = ["icon", "type"],
  _excluded2 = ["onClear"];
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
import * as React from 'react';
import PickerContext from "../context";
import { clsx } from 'clsx';
export default function Icon(props) {
  var icon = props.icon,
    type = props.type,
    restProps = _objectWithoutProperties(props, _excluded);
  var _React$useContext = React.useContext(PickerContext),
    prefixCls = _React$useContext.prefixCls,
    classNames = _React$useContext.classNames,
    styles = _React$useContext.styles;
  return icon ? /*#__PURE__*/React.createElement("span", _extends({
    className: clsx("".concat(prefixCls, "-").concat(type), classNames.suffix),
    style: styles.suffix
  }, restProps), icon) : null;
}
export function ClearIcon(_ref) {
  var onClear = _ref.onClear,
    restProps = _objectWithoutProperties(_ref, _excluded2);
  return /*#__PURE__*/React.createElement(Icon, _extends({}, restProps, {
    type: "clear",
    role: "button",
    onMouseDown: function onMouseDown(e) {
      e.preventDefault();
    },
    onClick: function onClick(e) {
      e.stopPropagation();
      onClear();
    }
  }));
}