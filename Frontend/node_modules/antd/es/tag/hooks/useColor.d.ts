import * as React from 'react';
import type { TagProps } from '..';
/**
 * Convert color related props to a unified object,
 * which is used to flatten the compatibility requirements.
 */
export default function useColor(props: Pick<TagProps, 'color' | 'variant' | 'bordered'>, contextVariant?: TagProps['variant']): readonly ["solid" | "filled" | "outlined", string | undefined, boolean, boolean, React.CSSProperties];
