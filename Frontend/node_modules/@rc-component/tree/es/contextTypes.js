/**
 * Webpack has bug for import loop, which is not the same behavior as ES module.
 * When util.js imports the TreeNode for tree generate will cause treeContextTypes be empty.
 */
import * as React from 'react';
export const TreeContext = /*#__PURE__*/React.createContext(null);

/** Internal usage, safe to remove. Do not use in prod */
export const UnstableContext = /*#__PURE__*/React.createContext({});