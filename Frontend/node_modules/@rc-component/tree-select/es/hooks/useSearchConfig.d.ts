import type { SearchConfig } from "../TreeSelect";
export default function useSearchConfig(showSearch: boolean | SearchConfig, props: SearchConfig & {
    inputValue: string;
}): [boolean, SearchConfig];
