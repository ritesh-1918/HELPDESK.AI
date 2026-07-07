/* istanbul ignore file */
import * as React from 'react';
function useRenderTimes(props, debug) {
  // Render times
  const timesRef = React.useRef(0);
  timesRef.current += 1;

  // Props changed
  const propsRef = React.useRef(props);
  const keys = [];
  Object.keys(props || {}).map(key => {
    if (props?.[key] !== propsRef.current?.[key]) {
      keys.push(key);
    }
  });
  propsRef.current = props;

  // Cache keys since React rerender may cause it lost
  const keysRef = React.useRef([]);
  if (keys.length) {
    keysRef.current = keys;
  }
  React.useDebugValue(timesRef.current);
  React.useDebugValue(keysRef.current.join(', '));
  if (debug) {
    console.log(`${debug}:`, timesRef.current, keysRef.current);
  }
  return timesRef.current;
}
export default process.env.NODE_ENV !== 'production' ? useRenderTimes : () => {};
export const RenderBlock = /*#__PURE__*/React.memo(() => {
  const times = useRenderTimes();
  return /*#__PURE__*/React.createElement("h1", null, "Render Times: ", times);
});
if (process.env.NODE_ENV !== 'production') {
  RenderBlock.displayName = 'RenderBlock';
}