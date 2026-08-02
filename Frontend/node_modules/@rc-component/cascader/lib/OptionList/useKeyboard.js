"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _KeyCode = _interopRequireDefault(require("@rc-component/util/lib/KeyCode"));
var React = _interopRequireWildcard(require("react"));
var _useSearchOptions = require("../hooks/useSearchOptions");
var _commonUtil = require("../utils/commonUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = (ref, options, fieldNames, activeValueCells, setActiveValueCells, onKeyBoardSelect, contextProps) => {
  const {
    direction,
    searchValue,
    toggleOpen,
    open
  } = contextProps;
  const rtl = direction === 'rtl';
  const [validActiveValueCells, lastActiveIndex, lastActiveOptions, fullPathKeys] = React.useMemo(() => {
    let activeIndex = -1;
    let currentOptions = options;
    const mergedActiveIndexes = [];
    const mergedActiveValueCells = [];
    const len = activeValueCells.length;
    const pathKeys = (0, _commonUtil.getFullPathKeys)(options, fieldNames);

    // Fill validate active value cells and index
    for (let i = 0; i < len && currentOptions; i += 1) {
      // Mark the active index for current options
      const nextActiveIndex = currentOptions.findIndex((option, index) => (pathKeys[index] ? (0, _commonUtil.toPathKey)(pathKeys[index]) : option[fieldNames.value]) === activeValueCells[i]);
      if (nextActiveIndex === -1) {
        break;
      }
      activeIndex = nextActiveIndex;
      mergedActiveIndexes.push(activeIndex);
      mergedActiveValueCells.push(activeValueCells[i]);
      currentOptions = currentOptions[activeIndex][fieldNames.children];
    }

    // Fill last active options
    let activeOptions = options;
    for (let i = 0; i < mergedActiveIndexes.length - 1; i += 1) {
      activeOptions = activeOptions[mergedActiveIndexes[i]][fieldNames.children];
    }
    return [mergedActiveValueCells, activeIndex, activeOptions, pathKeys];
  }, [activeValueCells, fieldNames, options]);

  // Update active value cells and scroll to target element
  const internalSetActiveValueCells = next => {
    setActiveValueCells(next);
  };

  // Same options offset
  const offsetActiveOption = offset => {
    const len = lastActiveOptions.length;
    let currentIndex = lastActiveIndex;
    if (currentIndex === -1 && offset < 0) {
      currentIndex = len;
    }
    for (let i = 0; i < len; i += 1) {
      currentIndex = (currentIndex + offset + len) % len;
      const option = lastActiveOptions[currentIndex];
      if (option && !option.disabled) {
        const nextActiveCells = validActiveValueCells.slice(0, -1).concat(fullPathKeys[currentIndex] ? (0, _commonUtil.toPathKey)(fullPathKeys[currentIndex]) : option[fieldNames.value]);
        internalSetActiveValueCells(nextActiveCells);
        return;
      }
    }
  };

  // Different options offset
  const prevColumn = () => {
    if (validActiveValueCells.length > 1) {
      const nextActiveCells = validActiveValueCells.slice(0, -1);
      internalSetActiveValueCells(nextActiveCells);
    } else {
      toggleOpen(false);
    }
  };
  const nextColumn = () => {
    const nextOptions = lastActiveOptions[lastActiveIndex]?.[fieldNames.children] || [];
    const nextOption = nextOptions.find(option => !option.disabled);
    if (nextOption) {
      const nextActiveCells = [...validActiveValueCells, nextOption[fieldNames.value]];
      internalSetActiveValueCells(nextActiveCells);
    }
  };
  React.useImperativeHandle(ref, () => ({
    // scrollTo: treeRef.current?.scrollTo,
    onKeyDown: event => {
      const {
        which
      } = event;
      switch (which) {
        // >>> Arrow keys
        case _KeyCode.default.UP:
        case _KeyCode.default.DOWN:
          {
            let offset = 0;
            if (which === _KeyCode.default.UP) {
              offset = -1;
            } else if (which === _KeyCode.default.DOWN) {
              offset = 1;
            }
            if (offset !== 0) {
              offsetActiveOption(offset);
            }
            break;
          }
        case _KeyCode.default.LEFT:
          {
            if (searchValue) {
              break;
            }
            if (rtl) {
              nextColumn();
            } else {
              prevColumn();
            }
            break;
          }
        case _KeyCode.default.RIGHT:
          {
            if (searchValue) {
              break;
            }
            if (rtl) {
              prevColumn();
            } else {
              nextColumn();
            }
            break;
          }
        case _KeyCode.default.BACKSPACE:
          {
            if (!searchValue) {
              prevColumn();
            }
            break;
          }

        // >>> Select
        case _KeyCode.default.ENTER:
          {
            if (validActiveValueCells.length) {
              const option = lastActiveOptions[lastActiveIndex];

              // Search option should revert back of origin options
              const originOptions = option?.[_useSearchOptions.SEARCH_MARK] || [];
              if (originOptions.length) {
                onKeyBoardSelect(originOptions.map(opt => opt[fieldNames.value]), originOptions[originOptions.length - 1]);
              } else {
                onKeyBoardSelect(validActiveValueCells, lastActiveOptions[lastActiveIndex]);
              }
            }
            break;
          }

        // >>> Close
        case _KeyCode.default.ESC:
          {
            toggleOpen(false);
            if (open) {
              event.stopPropagation();
            }
          }
      }
    },
    onKeyUp: () => {}
  }));
};
exports.default = _default;