import * as React from 'react';
export interface UseIconsOptions {
    isRtl: boolean;
    expandIcon: React.ReactNode;
    loadingIcon: React.ReactNode;
    contextExpandIcon: React.ReactNode;
    contextLoadingIcon: React.ReactNode;
}
export default function useIcons({ contextExpandIcon, contextLoadingIcon, expandIcon, loadingIcon, isRtl, }: UseIconsOptions): {
    expandIcon: string | number | bigint | boolean | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | React.JSX.Element;
    loadingIcon: string | number | bigint | boolean | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | React.JSX.Element;
};
