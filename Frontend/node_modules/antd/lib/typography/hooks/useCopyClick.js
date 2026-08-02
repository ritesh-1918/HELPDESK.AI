"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _copy = _interopRequireDefault(require("../../_util/copy"));
var _toList = _interopRequireDefault(require("../../_util/toList"));
const useCopyClick = ({
  copyConfig,
  children
}) => {
  const [copied, setCopied] = React.useState(false);
  const [copyLoading, setCopyLoading] = React.useState(false);
  const copyIdRef = React.useRef(null);
  const cleanCopyId = () => {
    if (copyIdRef.current) {
      clearTimeout(copyIdRef.current);
    }
  };
  const copyOptions = {};
  if (copyConfig.format) {
    copyOptions.format = copyConfig.format;
  }
  React.useEffect(() => cleanCopyId, []);
  // Keep copy action up to date
  const onClick = (0, _util.useEvent)(async e => {
    e?.preventDefault();
    e?.stopPropagation();
    setCopyLoading(true);
    try {
      const text = typeof copyConfig.text === 'function' ? await copyConfig.text() : copyConfig.text;
      await (0, _copy.default)(text || (0, _toList.default)(children, true).join('') || '', copyOptions);
      setCopyLoading(false);
      setCopied(true);
      // Trigger tips update
      cleanCopyId();
      copyIdRef.current = setTimeout(() => {
        setCopied(false);
      }, 3000);
      copyConfig.onCopy?.(e);
    } catch (error) {
      setCopyLoading(false);
      throw error;
    }
  });
  return {
    copied,
    copyLoading,
    onClick
  };
};
var _default = exports.default = useCopyClick;