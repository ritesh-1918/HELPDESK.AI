import React from 'react';
import type { PreviewConfig } from '..';
import type { GroupPreviewConfig } from '../PreviewGroup';
declare const useMergedPreviewConfig: <T extends PreviewConfig | GroupPreviewConfig>(previewConfig: T, contextPreviewConfig: T, prefixCls: string, mergedRootClassName: string, getContextPopupContainer: PreviewConfig["getContainer"], icons: PreviewConfig["icons"], defaultCover?: React.ReactNode) => T & {
    blurClassName?: string;
};
export default useMergedPreviewConfig;
