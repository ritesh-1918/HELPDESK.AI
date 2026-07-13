import type { DefaultOptionType } from '..';
import type { InternalFieldNames, SingleValueType, LegacyKey } from '../Cascader';
import { type GetEntities } from './useEntities';
export default function useOptions(mergedFieldNames: InternalFieldNames, options?: DefaultOptionType[]): [
    mergedOptions: DefaultOptionType[],
    getPathKeyEntities: GetEntities,
    getValueByKeyPath: (pathKeys: LegacyKey[]) => SingleValueType[]
];
