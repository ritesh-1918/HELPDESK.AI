"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.warningNullOptions = warningNullOptions;
var _toArray = _interopRequireDefault(require("@rc-component/util/lib/Children/toArray"));
var _warning = _interopRequireWildcard(require("@rc-component/util/lib/warning"));
var React = _interopRequireWildcard(require("react"));
var _BaseSelect = require("../BaseSelect");
var _commonUtil = require("./commonUtil");
var _legacyUtil = require("./legacyUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function warningProps(props) {
  const {
    mode,
    options,
    children,
    backfill,
    allowClear,
    placeholder,
    getInputElement,
    showSearch,
    onSearch,
    defaultOpen,
    autoFocus,
    labelInValue,
    value,
    optionLabelProp
  } = props;
  const multiple = (0, _BaseSelect.isMultiple)(mode);
  const mergedShowSearch = showSearch !== undefined ? showSearch : multiple || mode === 'combobox';
  const mergedOptions = options || (0, _legacyUtil.convertChildrenToData)(children);

  // `tags` should not set option as disabled
  (0, _warning.default)(mode !== 'tags' || mergedOptions.every(opt => !opt.disabled), 'Please avoid setting option to disabled in tags mode since user can always type text as tag.');

  // `combobox` & `tags` should option be `string` type
  if (mode === 'tags' || mode === 'combobox') {
    const hasNumberValue = mergedOptions.some(item => {
      if (item.options) {
        return item.options.some(opt => typeof ('value' in opt ? opt.value : opt.key) === 'number');
      }
      return typeof ('value' in item ? item.value : item.key) === 'number';
    });
    (0, _warning.default)(!hasNumberValue, '`value` of Option should not use number type when `mode` is `tags` or `combobox`.');
  }

  // `combobox` should not use `optionLabelProp`
  (0, _warning.default)(mode !== 'combobox' || !optionLabelProp, '`combobox` mode not support `optionLabelProp`. Please set `value` on Option directly.');

  // Only `combobox` support `backfill`
  (0, _warning.default)(mode === 'combobox' || !backfill, '`backfill` only works with `combobox` mode.');

  // Only `combobox` support `getInputElement`
  (0, _warning.default)(mode === 'combobox' || !getInputElement, '`getInputElement` only work with `combobox` mode.');

  // Customize `getInputElement` should not use `allowClear` & `placeholder`
  (0, _warning.noteOnce)(mode !== 'combobox' || !getInputElement || !allowClear || !placeholder, 'Customize `getInputElement` should customize clear and placeholder logic instead of configuring `allowClear` and `placeholder`.');

  // `onSearch` should use in `combobox` or `showSearch`
  if (onSearch && !mergedShowSearch && mode !== 'combobox' && mode !== 'tags') {
    (0, _warning.default)(false, '`onSearch` should work with `showSearch` instead of use alone.');
  }
  (0, _warning.noteOnce)(!defaultOpen || autoFocus, '`defaultOpen` makes Select open without focus which means it will not close by click outside. You can set `autoFocus` if needed.');
  if (value !== undefined && value !== null) {
    const values = (0, _commonUtil.toArray)(value);
    (0, _warning.default)(!labelInValue || values.every(val => typeof val === 'object' && ('key' in val || 'value' in val)), '`value` should in shape of `{ value: string | number, label?: ReactNode }` when you set `labelInValue` to `true`');
    (0, _warning.default)(!multiple || Array.isArray(value), '`value` should be array when `mode` is `multiple` or `tags`');
  }

  // Syntactic sugar should use correct children type
  if (children) {
    let invalidateChildType = null;
    (0, _toArray.default)(children).some(node => {
      if (! /*#__PURE__*/React.isValidElement(node) || !node.type) {
        return false;
      }
      const {
        type
      } = node;
      if (type.isSelectOption) {
        return false;
      }
      if (type.isSelectOptGroup) {
        const allChildrenValid = (0, _toArray.default)(node.props.children).every(subNode => {
          if (! /*#__PURE__*/React.isValidElement(subNode) || !node.type || subNode.type.isSelectOption) {
            return true;
          }
          invalidateChildType = subNode.type;
          return false;
        });
        if (allChildrenValid) {
          return false;
        }
        return true;
      }
      invalidateChildType = type;
      return true;
    });
    if (invalidateChildType) {
      (0, _warning.default)(false, `\`children\` should be \`Select.Option\` or \`Select.OptGroup\` instead of \`${invalidateChildType.displayName || invalidateChildType.name || invalidateChildType}\`.`);
    }
  }
}

// value in Select option should not be null
// note: OptGroup has options too
function warningNullOptions(options, fieldNames) {
  if (options) {
    const recursiveOptions = (optionsList, inGroup = false) => {
      for (let i = 0; i < optionsList.length; i++) {
        const option = optionsList[i];
        if (option[fieldNames?.value] === null) {
          (0, _warning.default)(false, '`value` in Select options should not be `null`.');
          return true;
        }
        if (!inGroup && Array.isArray(option[fieldNames?.options]) && recursiveOptions(option[fieldNames?.options], true)) {
          break;
        }
      }
    };
    recursiveOptions(options);
  }
}
var _default = exports.default = warningProps;