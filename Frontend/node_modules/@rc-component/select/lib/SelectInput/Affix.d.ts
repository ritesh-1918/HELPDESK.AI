import * as React from 'react';
export interface AffixProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}
export default function Affix(props: AffixProps): React.JSX.Element;
