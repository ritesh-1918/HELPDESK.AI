import * as React from 'react';
const EmptyList = [];

// ========================= Path Register =========================

export const PathRegisterContext = /*#__PURE__*/React.createContext(null);
export function useMeasure() {
  return React.useContext(PathRegisterContext);
}

// ========================= Path Tracker ==========================
export const PathTrackerContext = /*#__PURE__*/React.createContext(EmptyList);
export function useFullPath(eventKey) {
  const parentKeyPath = React.useContext(PathTrackerContext);
  return React.useMemo(() => eventKey !== undefined ? [...parentKeyPath, eventKey] : parentKeyPath, [parentKeyPath, eventKey]);
}

// =========================== Path User ===========================

export const PathUserContext = /*#__PURE__*/React.createContext(null);