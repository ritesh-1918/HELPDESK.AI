import React from 'react';
export type CellSemanticClassNames = {
    label?: string;
    content?: string;
};
export type CellSemanticStyles = {
    label?: React.CSSProperties;
    content?: React.CSSProperties;
};
export interface DescriptionsContextProps {
    /** @deprecated Please use `styles.label` instead */
    labelStyle?: React.CSSProperties;
    /** @deprecated Please use `styles.content` instead */
    contentStyle?: React.CSSProperties;
    classNames?: CellSemanticClassNames;
    styles?: CellSemanticStyles;
}
declare const DescriptionsContext: React.Context<DescriptionsContextProps>;
export default DescriptionsContext;
