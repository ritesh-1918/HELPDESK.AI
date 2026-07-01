import React from 'react';
import type { BreadcrumbSemanticClassNames, BreadcrumbSemanticStyles } from './Breadcrumb';
export interface BreadcrumbContextProps {
    classNames?: BreadcrumbSemanticClassNames;
    styles?: BreadcrumbSemanticStyles;
}
declare const BreadcrumbContext: React.Context<BreadcrumbContextProps>;
export default BreadcrumbContext;
