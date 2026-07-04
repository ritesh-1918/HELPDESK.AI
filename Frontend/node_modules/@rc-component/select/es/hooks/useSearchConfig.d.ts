import type { SearchConfig, DefaultOptionType, SelectProps } from '../Select';
export default function useSearchConfig(showSearch: boolean | SearchConfig<DefaultOptionType> | undefined, props: SearchConfig<DefaultOptionType>, mode: SelectProps<DefaultOptionType>['mode']): [boolean, SearchConfig<DefaultOptionType>];
