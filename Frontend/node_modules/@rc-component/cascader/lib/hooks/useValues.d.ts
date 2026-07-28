import type { DataEntity } from '@rc-component/tree/lib/interface';
import type { LegacyKey, SingleValueType } from '../Cascader';
import type { GetMissValues } from './useMissingValues';
export default function useValues(multiple: boolean, rawValues: SingleValueType[], getPathKeyEntities: () => Record<string, DataEntity>, getValueByKeyPath: (pathKeys: LegacyKey[]) => SingleValueType[], getMissingValues: GetMissValues): [
    checkedValues: SingleValueType[],
    halfCheckedValues: SingleValueType[],
    missingCheckedValues: SingleValueType[]
];
