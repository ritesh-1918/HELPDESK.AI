import type { SingleValueType, DefaultOptionType, InternalFieldNames, ShowCheckedStrategy, LegacyKey } from '../Cascader';
import type { GetEntities } from '../hooks/useEntities';
export declare function formatStrategyValues(pathKeys: LegacyKey[], getKeyPathEntities: GetEntities, showCheckedStrategy?: ShowCheckedStrategy): LegacyKey[];
export declare function toPathOptions(valueCells: SingleValueType, options: DefaultOptionType[], fieldNames: InternalFieldNames, stringMode?: boolean): {
    value: SingleValueType[number];
    index: number;
    option: DefaultOptionType;
}[];
