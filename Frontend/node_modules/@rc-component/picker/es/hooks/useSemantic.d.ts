import type { SharedPickerProps } from '../interface';
export type FilledPanelClassNames = NonNullable<SharedPickerProps['classNames']>['popup'];
export type FilledPanelStyles = NonNullable<SharedPickerProps['styles']>['popup'];
export type FilledClassNames = NonNullable<SharedPickerProps['classNames']> & {
    popup: FilledPanelClassNames;
};
export type FilledStyles = NonNullable<SharedPickerProps['styles']> & {
    popup: FilledPanelStyles;
};
/**
 * Convert `classNames` & `styles` to a fully filled object
 */
export default function useSemantic(classNames?: SharedPickerProps['classNames'], styles?: SharedPickerProps['styles']): readonly [FilledClassNames, FilledStyles];
