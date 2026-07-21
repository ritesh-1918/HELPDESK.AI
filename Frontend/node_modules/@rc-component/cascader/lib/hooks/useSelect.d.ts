import type { InternalValueType, LegacyKey, ShowCheckedStrategy, SingleValueType } from '../Cascader';
import type { GetEntities } from './useEntities';
export default function useSelect(multiple: boolean, triggerChange: (nextValues: InternalValueType) => void, checkedValues: SingleValueType[], halfCheckedValues: SingleValueType[], missingCheckedValues: SingleValueType[], getPathKeyEntities: GetEntities, getValueByKeyPath: (pathKeys: LegacyKey[]) => SingleValueType[], showCheckedStrategy?: ShowCheckedStrategy): (valuePath: SingleValueType) => void;
