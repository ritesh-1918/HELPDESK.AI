"use client";

import InternalBreadcrumb from './Breadcrumb';
import BreadcrumbItem from './BreadcrumbItem';
import BreadcrumbSeparator from './BreadcrumbSeparator';
const Breadcrumb = InternalBreadcrumb;
Breadcrumb.Item = BreadcrumbItem;
Breadcrumb.Separator = BreadcrumbSeparator;
export default Breadcrumb;