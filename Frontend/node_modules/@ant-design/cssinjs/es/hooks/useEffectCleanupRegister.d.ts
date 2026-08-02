import type { DependencyList } from 'react';
declare const useEffectCleanupRegister: (deps?: DependencyList) => (fn: () => void) => void;
export default useEffectCleanupRegister;
