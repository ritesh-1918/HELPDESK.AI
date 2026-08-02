import * as React from 'react';
export const Context = /*#__PURE__*/React.createContext({});
export default function MotionProvider({
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement(Context.Provider, {
    value: props
  }, children);
}