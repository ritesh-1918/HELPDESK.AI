import * as React from 'react';

// Use any here since we do not get the type during compilation
/**
 * SelectContext is only used for Select. BaseSelect should not consume this context.
 */

const SelectContext = /*#__PURE__*/React.createContext(null);
export default SelectContext;