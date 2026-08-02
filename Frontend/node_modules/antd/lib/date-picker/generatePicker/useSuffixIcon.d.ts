import React from 'react';
import type { PickerMode } from '@rc-component/picker/interface';
interface UseSuffixIconProps {
    picker?: PickerMode;
    hasFeedback?: boolean;
    feedbackIcon?: React.ReactNode;
    suffixIcon?: React.ReactNode;
}
declare const useSuffixIcon: ({ picker, hasFeedback, feedbackIcon, suffixIcon }: UseSuffixIconProps) => string | number | bigint | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | React.JSX.Element | null;
export default useSuffixIcon;
