import type { DefaultOptionType, InternalFieldNames, SearchConfig } from '../Cascader';
export declare const SEARCH_MARK = "__rc_cascader_search_mark__";
declare const useSearchOptions: (search: string, options: DefaultOptionType[], fieldNames: InternalFieldNames, prefixCls: string, config: SearchConfig, enableHalfPath?: boolean) => DefaultOptionType[];
export default useSearchOptions;
