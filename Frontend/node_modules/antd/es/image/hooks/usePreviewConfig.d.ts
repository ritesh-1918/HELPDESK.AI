import type { PreviewConfig } from '..';
import type { GroupPreviewConfig } from '../PreviewGroup';
export default function usePreviewConfig<T extends PreviewConfig | GroupPreviewConfig>(preview?: boolean | T): [previewConfig: T, rootClassName: string, maskClassName: string];
