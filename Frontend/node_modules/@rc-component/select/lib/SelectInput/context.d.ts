import * as React from 'react';
import type { SelectInputProps } from '.';
export type ContentContextProps = SelectInputProps;
declare const SelectInputContext: React.Context<SelectInputProps>;
export declare function useSelectInputContext(): SelectInputProps;
export default SelectInputContext;
