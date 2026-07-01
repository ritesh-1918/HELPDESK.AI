"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useDiffItem;
var React = _interopRequireWildcard(require("react"));
var _algorithmUtil = require("../utils/algorithmUtil");
function useDiffItem(data, getKey, onDiff) {
  const [prevData, setPrevData] = React.useState(data);
  const [diffItem, setDiffItem] = React.useState(null);
  React.useEffect(() => {
    const diff = (0, _algorithmUtil.findListDiffIndex)(prevData || [], data || [], getKey);
    if (diff?.index !== undefined) {
      onDiff?.(diff.index);
      setDiffItem(data[diff.index]);
    }
    setPrevData(data);
  }, [data]);
  return [diffItem];
}