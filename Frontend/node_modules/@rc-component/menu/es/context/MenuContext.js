import * as React from 'react';
import useMemo from "@rc-component/util/es/hooks/useMemo";
import isEqual from "@rc-component/util/es/isEqual";
export const MenuContext = /*#__PURE__*/React.createContext(null);
function mergeProps(origin, target) {
  const clone = {
    ...origin
  };
  Object.keys(target).forEach(key => {
    const value = target[key];
    if (value !== undefined) {
      clone[key] = value;
    }
  });
  return clone;
}
export default function InheritableContextProvider({
  children,
  locked,
  ...restProps
}) {
  const context = React.useContext(MenuContext);
  const inheritableContext = useMemo(() => mergeProps(context, restProps), [context, restProps], (prev, next) => !locked && (prev[0] !== next[0] || !isEqual(prev[1], next[1], true)));
  return /*#__PURE__*/React.createElement(MenuContext.Provider, {
    value: inheritableContext
  }, children);
}