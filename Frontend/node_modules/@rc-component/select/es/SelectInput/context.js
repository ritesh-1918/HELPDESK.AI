import * as React from 'react';
const SelectInputContext = /*#__PURE__*/React.createContext(null);
export function useSelectInputContext() {
  return React.useContext(SelectInputContext);
}
export default SelectInputContext;