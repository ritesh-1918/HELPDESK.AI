"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _menu = _interopRequireWildcard(require("@rc-component/menu"));
var _react = _interopRequireWildcard(require("react"));
var _MentionsContext = _interopRequireDefault(require("./MentionsContext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
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
  } = _react.default.useContext(_MentionsContext.default);
  const {
    prefixCls,
    options,
    opened
  } = props;
  const activeOption = options[activeIndex] || {};
  const menuRef = (0, _react.useRef)(null);

  // Monitor the changes in ActiveIndex and scroll to the visible area if there are any changes
  (0, _react.useEffect)(() => {
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
  return /*#__PURE__*/_react.default.createElement(_menu.default, {
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
    return /*#__PURE__*/_react.default.createElement(_menu.MenuItem, {
      key: key,
      disabled: disabled,
      className: className,
      style: style,
      onMouseEnter: () => {
        setActiveIndex(index);
      }
    }, label);
  }), !options.length && /*#__PURE__*/_react.default.createElement(_menu.MenuItem, {
    disabled: true
  }, notFoundContent));
}
var _default = exports.default = DropdownMenu;