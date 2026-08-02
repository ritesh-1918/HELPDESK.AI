"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useStatus;
var _react = require("react");
var _util = require("../util");
function useStatus({
  src,
  isCustomPlaceholder,
  fallback
}) {
  const [status, setStatus] = (0, _react.useState)(isCustomPlaceholder ? 'loading' : 'normal');
  const isLoaded = (0, _react.useRef)(false);
  const isError = status === 'error';

  // https://github.com/react-component/image/pull/187
  (0, _react.useEffect)(() => {
    let isCurrentSrc = true;
    (0, _util.isImageValid)(src).then(isValid => {
      // https://github.com/ant-design/ant-design/issues/44948
      // If src changes, the previous setStatus should not be triggered
      if (!isValid && isCurrentSrc) {
        setStatus('error');
      }
    });
    return () => {
      isCurrentSrc = false;
    };
  }, [src]);
  (0, _react.useEffect)(() => {
    if (isCustomPlaceholder && !isLoaded.current) {
      setStatus('loading');
    } else if (isError) {
      setStatus('normal');
    }
  }, [src]);
  const onLoad = () => {
    setStatus('normal');
  };
  const getImgRef = img => {
    isLoaded.current = false;
    if (status === 'loading' && img?.complete && (img.naturalWidth || img.naturalHeight)) {
      isLoaded.current = true;
      onLoad();
    }
  };
  const srcAndOnload = isError && fallback ? {
    src: fallback
  } : {
    onLoad,
    src
  };
  return [getImgRef, srcAndOnload, status];
}