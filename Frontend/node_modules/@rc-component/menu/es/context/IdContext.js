import * as React from 'react';
export const IdContext = /*#__PURE__*/React.createContext(null);
export function getMenuId(uuid, eventKey) {
  return `${uuid}-${eventKey}`;
}

/**
 * Get `data-menu-id`
 */
export function useMenuId(eventKey) {
  const id = React.useContext(IdContext);
  return getMenuId(id, eventKey);
}