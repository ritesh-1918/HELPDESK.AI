import type { ReactNode } from 'react';
import React from 'react';
import type { DialogProps } from '@rc-component/dialog';
export type ClosableType = DialogProps['closable'];
export type BaseContextClosable = {
    closable?: ClosableType;
    closeIcon?: ReactNode;
};
export type ContextClosable<T extends BaseContextClosable = any> = Partial<Pick<T, 'closable' | 'closeIcon'>>;
export declare const pickClosable: <T extends BaseContextClosable>(context?: ContextClosable<T>) => ContextClosable<T> | undefined;
/** Collection contains the all the props related with closable. e.g. `closable`, `closeIcon` */
interface ClosableCollection {
    closable?: ClosableType;
    closeIcon?: ReactNode;
    disabled?: boolean;
}
interface FallbackCloseCollection extends ClosableCollection {
    /**
     * Some components need to wrap CloseIcon twice,
     * this method will be executed once after the final CloseIcon is calculated
     */
    closeIconRender?: (closeIcon: ReactNode) => ReactNode;
}
type DataAttributes = {
    [key: `data-${string}`]: string;
};
export declare const computeClosable: (propCloseCollection?: ClosableCollection, contextCloseCollection?: ClosableCollection | null, fallbackCloseCollection?: FallbackCloseCollection, closeLabel?: string) => [closable: boolean, closeIcon: React.ReactNode, closeBtnIsDisabled: boolean, ariaOrDataProps: React.AriaAttributes & DataAttributes];
export declare const useClosable: (propCloseCollection?: ClosableCollection, contextCloseCollection?: ClosableCollection | null, fallbackCloseCollection?: FallbackCloseCollection) => [closable: boolean, closeIcon: ReactNode, closeBtnIsDisabled: boolean, ariaOrDataProps: React.AriaAttributes & DataAttributes];
export {};
