import React from 'react';
export const NotificationContext = /*#__PURE__*/React.createContext({});
const NotificationProvider = ({
  children,
  classNames
}) => {
  return /*#__PURE__*/React.createElement(NotificationContext.Provider, {
    value: {
      classNames
    }
  }, children);
};
export default NotificationProvider;