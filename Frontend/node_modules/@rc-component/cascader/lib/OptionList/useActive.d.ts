import type { LegacyKey } from '../Cascader';
/**
 * Control the active open options path.
 */
declare const useActive: (multiple?: boolean, open?: boolean) => [LegacyKey[], (activeValueCells: LegacyKey[]) => void];
export default useActive;
